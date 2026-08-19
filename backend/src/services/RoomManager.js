import { randomBytes } from 'crypto';
import redisClient from '../config/redis.js';
import Room from '../models/Room.js';
import Player from '../models/Player.js';

// Map<roomId, Room>
const rooms = new Map();

const generateRoomId = () => randomBytes(2).toString('hex').toUpperCase();

export class RoomManager {
  static async createRoom(hostToken, hostName, socketId) {
    let roomId;
    do {
      roomId = generateRoomId();
    } while (rooms.has(roomId));

    const room = new Room({ id: roomId, hostId: hostToken });
    const host = new Player({
      roomId: roomId,
      sessionToken: hostToken,
      nickname: hostName,
      avatar: '🧑‍✈️' // default
    });
    host.connectionStatus = 'ONLINE';

    room.addPlayer(host);
    rooms.set(roomId, room);
    await this.saveSnapshot(roomId);
    return room.toJSON();
  }

  static async joinRoom(roomId, playerToken, playerName, socketId) {
    const room = rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const existingPlayer = room.getPlayer(playerToken);
    if (existingPlayer) {
      existingPlayer.connectionStatus = 'ONLINE';
      existingPlayer.nickname = playerName || existingPlayer.nickname;
    } else {
      const newPlayer = new Player({
        roomId: roomId,
        sessionToken: playerToken,
        nickname: playerName,
        avatar: '👨‍🍳'
      });
      room.addPlayer(newPlayer);
    }

    await this.saveSnapshot(roomId);
    return room.toJSON();
  }

  static getRoom(roomId) {
    const room = rooms.get(roomId);
    return room ? room.toJSON() : null;
  }

  static reconnectPlayer(playerToken, socketId) {
    for (const [roomId, room] of rooms.entries()) {
      const player = room.getPlayer(playerToken);
      if (player) {
        player.connectionStatus = 'ONLINE';
        this.saveSnapshot(roomId);
        return room.toJSON();
      }
    }
    return null;
  }

  static disconnectPlayer(playerToken) {
    for (const [roomId, room] of rooms.entries()) {
      const player = room.getPlayer(playerToken);
      if (player) {
        player.connectionStatus = 'OFFLINE';
        this.saveSnapshot(roomId);
        return room.toJSON();
      }
    }
    return null;
  }

  static updateAvatar(roomId, playerToken, avatar) {
    const room = rooms.get(roomId);
    if (room) {
      const player = room.getPlayer(playerToken);
      if (player) {
        player.avatar = avatar;
        this.saveSnapshot(roomId);
        return room.toJSON();
      }
    }
    return null;
  }

  static updateMapType(roomId, hostToken, mapType) {
    const room = rooms.get(roomId);
    if (room && room.hostId === hostToken) {
      room.mapType = mapType;
      this.saveSnapshot(roomId);
      return room.toJSON();
    }
    return null;
  }

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
}
