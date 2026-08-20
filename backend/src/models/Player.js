import { randomUUID } from 'crypto';

class Player {
  /**
   * Tạo một instance Player mới
   * @param {Object} params
   * @param {string} params.roomId
   * @param {string} params.sessionToken
   * @param {string} params.nickname
   * @param {string} params.avatar
   */
  constructor({ roomId, sessionToken, nickname, avatar }) {
    this.id = randomUUID(); // Định danh duy nhất
    this.roomId = roomId; // ID của Room
    this.sessionToken = sessionToken; // Token phục hồi phiên
    this.nickname = nickname; // Tên hiển thị
    this.avatar = avatar || '🧑‍✈️'; // Avatar
    
    // Default values
    this.connectionStatus = 'ONLINE'; // 'ONLINE' | 'OFFLINE' | 'RECONNECTING'
    this.factionRole = null; // 'SAILOR' | 'PIRATE' | 'CULT_LEADER' | 'CULTIST'
    this.publicTitles = []; // e.g., 'CAPTAIN', 'LIEUTENANT', 'NAVIGATOR'
    this.speechRestricted = false; // Bị cắt lưỡi (Off with the tongue)
    
    // Các trạng thái mở rộng khác theo rule
    this.status = 'ACTIVE'; // 'ACTIVE' | 'OFF_DUTY' | 'ELIMINATED'
    this.eliminationReason = null; // 'JUMP_OVERBOARD' | 'FEED_THE_KRAKEN' | 'EXECUTION'
    this.gunCount = 0;
  }

  toPublicJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      nickname: this.nickname,
      name: this.nickname, // Alias for frontend compatibility
      avatar: this.avatar,
      connectionStatus: this.connectionStatus,
      publicTitles: this.publicTitles,
      speechRestricted: this.speechRestricted,
      status: this.status,
      eliminationReason: this.eliminationReason,
      gunCount: this.gunCount
    };
  }

  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      sessionToken: this.sessionToken,
      nickname: this.nickname,
      name: this.nickname, // Alias for frontend compatibility
      avatar: this.avatar,
      connectionStatus: this.connectionStatus,
      factionRole: this.factionRole,
      publicTitles: this.publicTitles,
      speechRestricted: this.speechRestricted,
      status: this.status,
      eliminationReason: this.eliminationReason,
      gunCount: this.gunCount
    };
  }

  static fromJSON(data) {
    const player = new Player({
      roomId: data.roomId,
      sessionToken: data.sessionToken,
      nickname: data.nickname || data.name,
      avatar: data.avatar
    });
    player.id = data.id;
    player.connectionStatus = data.connectionStatus || 'ONLINE';
    player.factionRole = data.factionRole;
    player.publicTitles = data.publicTitles || [];
    player.speechRestricted = data.speechRestricted || false;
    player.status = data.status || 'ACTIVE';
    player.eliminationReason = data.eliminationReason || null;
    player.gunCount = data.gunCount || 0;
    return player;
  }
}

export default Player;

