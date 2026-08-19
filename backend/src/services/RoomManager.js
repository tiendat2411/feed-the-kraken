import { randomBytes } from 'crypto';
import redisClient from '../config/redis.js';
import Room from '../models/Room.js';
import Player from '../models/Player.js';
import { RoleDistributionService } from './RoleDistribution.js';

// Map<roomId, Room>
const rooms = new Map();

const generateRoomId = () => randomBytes(2).toString('hex').toUpperCase();

export class RoomManager {
  /**
   * Tạo phòng mới
   */
  static async createRoom(hostToken, hostName, socketId) {
    let roomId;
    do {
      roomId = generateRoomId();
    } while (rooms.has(roomId));

    const host = new Player({
      roomId: roomId,
      sessionToken: hostToken,
      nickname: hostName,
      avatar: '🧑‍✈️'
    });
    host.connectionStatus = 'ONLINE';

    const room = new Room({ id: roomId, hostId: host.id });
    room.addPlayer(host);

    rooms.set(roomId, room);
    await this.saveSnapshot(roomId);
    return room.toJSON();
  }

  /**
   * Tham gia phòng
   */
  static async joinRoom(roomId, playerToken, playerName, socketId) {
    const room = rooms.get(roomId);
    if (!room) throw new Error('Phòng không tồn tại');

    const existingPlayer = room.getPlayerByToken(playerToken);
    if (existingPlayer) {
      existingPlayer.connectionStatus = 'ONLINE';
      if (playerName) existingPlayer.nickname = playerName;
    } else {
      const newPlayer = new Player({
        roomId: roomId,
        sessionToken: playerToken,
        nickname: playerName || 'Thủy thủ',
        avatar: '👨‍🍳'
      });
      room.addPlayer(newPlayer);
    }

    await this.saveSnapshot(roomId);
    return room.toJSON();
  }

  /**
   * Lấy dữ liệu phòng theo ID
   */
  static getRoom(roomId) {
    const room = rooms.get(roomId);
    return room ? room.toJSON() : null;
  }

  /**
   * Lấy instance Room gốc
   */
  static getRoomInstance(roomId) {
    return rooms.get(roomId) || null;
  }

  /**
   * Tìm phòng hiện tại của một sessionToken
   */
  static getRoomByToken(playerToken) {
    for (const [roomId, room] of rooms.entries()) {
      const player = room.getPlayerByToken(playerToken);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  /**
   * Bắt đầu trò chơi & phân bổ vai trò bí mật
   */
  static async startGame(hostToken) {
    const found = this.getRoomByToken(hostToken);
    if (!found) throw new Error('Bạn chưa tham gia phòng nào');

    const { room, player: hostPlayer } = found;

    if (room.hostId !== hostPlayer.id) {
      throw new Error('Chỉ có Chủ phòng mới có quyền bắt đầu trận đấu');
    }

    if (room.status !== 'LOBBY') {
      throw new Error('Trận đấu đã được bắt đầu từ trước');
    }

    const players = room.getPlayers();
    if (players.length < 5 || players.length > 11) {
      throw new Error(`Cần từ 5 đến 11 người chơi để bắt đầu (hiện có: ${players.length})`);
    }

    // 1. Phân bổ vai trò bí mật & Khởi tạo súng (3 súng/người)
    RoleDistributionService.distributeRoles(players);

    // 2. Chuyển trạng thái phòng sang IN_GAME và phase ROLE_REVEAL
    room.status = 'IN_GAME';
    room.gamePhase = 'ROLE_REVEAL';

    // 3. Chỉ định Thuyền trưởng ban đầu (Mặc định là Host)
    room.captainId = room.hostId;
    hostPlayer.publicTitles = ['CAPTAIN'];

    await this.saveSnapshot(room.id);

    return {
      roomId: room.id,
      room
    };
  }

  /**
   * Khôi phục kết nối (Reconnect)
   */
  static reconnectPlayer(playerToken, socketId) {
    const found = this.getRoomByToken(playerToken);
    if (found) {
      const { room, player } = found;
      player.connectionStatus = 'ONLINE';
      this.saveSnapshot(room.id);
      return room;
    }
    return null;
  }

  /**
   * Xử lý Disconnect tạm thời (đánh dấu OFFLINE)
   */
  static disconnectPlayer(playerToken) {
    const found = this.getRoomByToken(playerToken);
    if (found) {
      const { room, player } = found;
      player.connectionStatus = 'OFFLINE';
      this.saveSnapshot(room.id);
      return room;
    }
    return null;
  }

  /**
   * Người chơi chủ động rời phòng
   */
  static async leaveRoom(playerToken) {
    const found = this.getRoomByToken(playerToken);
    if (!found) return null;

    const { room, player } = found;
    room.removePlayer(player.id);

    // Nếu không còn ai trong phòng -> Giải tán phòng
    if (room.getPlayers().length === 0) {
      rooms.delete(room.id);
      await this.deleteSnapshot(room.id);
      return {
        roomId: room.id,
        isDissolved: true,
        leftPlayerId: player.id
      };
    }

    // Nếu người rời phòng là Host -> Chuyển quyền Host cho người kế tiếp
    if (room.hostId === player.id) {
      const remainingPlayers = room.getPlayers();
      room.transferHost(remainingPlayers[0].id);
    }

    await this.saveSnapshot(room.id);
    return {
      roomId: room.id,
      room,
      isDissolved: false,
      leftPlayerId: player.id
    };
  }

  /**
   * Chủ phòng kick người chơi khác
   */
  static async kickPlayer(hostToken, targetPlayerId) {
    const found = this.getRoomByToken(hostToken);
    if (!found) throw new Error('Bạn chưa tham gia phòng nào');

    const { room, player: hostPlayer } = found;

    if (room.hostId !== hostPlayer.id) {
      throw new Error('Chỉ có Chủ phòng mới có quyền kick người chơi');
    }

    if (room.status !== 'LOBBY') {
      throw new Error('Không thể kick người chơi khi trận đấu đã bắt đầu');
    }

    const targetPlayer = room.getPlayer(targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Người chơi cần kick không tồn tại trong phòng');
    }

    if (targetPlayer.id === hostPlayer.id) {
      throw new Error('Chủ phòng không thể tự kick chính mình');
    }

    const kickedPlayerToken = targetPlayer.sessionToken;
    room.removePlayer(targetPlayer.id);

    await this.saveSnapshot(room.id);

    return {
      roomId: room.id,
      room,
      kickedPlayerToken,
      kickedPlayerId: targetPlayer.id
    };
  }

  /**
   * Chủ phòng giải tán phòng
   */
  static async dissolveRoom(hostToken) {
    const found = this.getRoomByToken(hostToken);
    if (!found) throw new Error('Bạn chưa tham gia phòng nào');

    const { room, player: hostPlayer } = found;

    if (room.hostId !== hostPlayer.id) {
      throw new Error('Chỉ có Chủ phòng mới có quyền giải tán phòng');
    }

    rooms.delete(room.id);
    await this.deleteSnapshot(room.id);

    return {
      roomId: room.id,
      isDissolved: true
    };
  }

  /**
   * Cập nhật Avatar
   */
  static updateAvatar(roomId, playerToken, avatar) {
    const room = rooms.get(roomId);
    if (room) {
      const player = room.getPlayerByToken(playerToken);
      if (player) {
        player.avatar = avatar;
        this.saveSnapshot(roomId);
        return room;
      }
    }
    return null;
  }

  /**
   * Cập nhật loại Bản đồ (Chỉ Host)
   */
  static updateMapType(roomId, hostToken, mapType) {
    const room = rooms.get(roomId);
    if (room) {
      const player = room.getPlayerByToken(hostToken);
      if (player && room.hostId === player.id) {
        room.mapType = mapType;
        this.saveSnapshot(roomId);
        return room;
      }
    }
    return null;
  }

  /**
   * Lưu snapshot vào Redis
   */
  static async saveSnapshot(roomId) {
    const room = rooms.get(roomId);
    if (room && redisClient.isOpen) {
      try {
        await redisClient.set(`room:${roomId}`, JSON.stringify(room.toJSON()));
      } catch (err) {
        console.error('Failed to save snapshot to Redis:', err);
      }
    }
  }

  /**
   * Xóa snapshot khỏi Redis
   */
  static async deleteSnapshot(roomId) {
    if (redisClient.isOpen) {
      try {
        await redisClient.del(`room:${roomId}`);
      } catch (err) {
        console.error('Failed to delete snapshot from Redis:', err);
      }
    }
  }
}


