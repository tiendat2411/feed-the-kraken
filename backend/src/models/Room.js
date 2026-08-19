const Player = require('./Player');

class Room {
  /**
   * Tạo một instance Room mới
   * @param {Object} params
   * @param {string} params.id - Mã phòng 6 chữ cái
   * @param {string} params.hostId - ID của người làm Host
   */
  constructor({ id, hostId }) {
    this.id = id;
    this.hostId = hostId;
    
    // Default values
    this.status = 'LOBBY'; // 'LOBBY' | 'IN_GAME' | 'FINISHED' | 'DISSOLVED'
    this.gamePhase = null; // e.g., 'NIGHT_1', 'DAY_1_CREW_SELECTION'
    this.mapType = 'QUICK_JOURNEY'; // 'QUICK_JOURNEY' | 'LONG_JOURNEY'
    this.captainId = null;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    
    // Danh sách người chơi dạng Map để dễ truy xuất
    this.players = new Map();
  }

  /**
   * Cập nhật thời gian hoạt động cuối cùng
   */
  touch() {
    this.lastActivity = Date.now();
  }

  /**
   * Lấy danh sách tất cả người chơi dạng Array
   * @returns {Array<Player>}
   */
  getPlayers() {
    return Array.from(this.players.values());
  }

  /**
   * Thêm người chơi vào phòng
   * @param {Player} player 
   */
  addPlayer(player) {
    if (this.status !== 'LOBBY') {
      throw new Error('Cannot join room that is already playing');
    }
    if (this.players.size >= 11) {
      throw new Error('Room is full');
    }
    this.players.set(player.id, player);
    this.touch();
  }

  /**
   * Lấy thông tin player theo ID
   * @param {string} playerId 
   * @returns {Player}
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Xóa người chơi khỏi phòng
   * @param {string} playerId 
   */
  removePlayer(playerId) {
    this.players.delete(playerId);
    this.touch();
  }

  toJSON() {
    const playersArray = this.getPlayers().map(p => p.toJSON());
    return {
      id: this.id,
      hostId: this.hostId,
      status: this.status,
      gamePhase: this.gamePhase,
      mapType: this.mapType,
      captainId: this.captainId,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      players: playersArray
    };
  }

  static fromJSON(data) {
    const room = new Room({
      id: data.id,
      hostId: data.hostId
    });
    room.status = data.status;
    room.gamePhase = data.gamePhase;
    room.mapType = data.mapType;
    room.captainId = data.captainId;
    room.createdAt = data.createdAt;
    room.lastActivity = data.lastActivity;
    
    if (data.players && Array.isArray(data.players)) {
      data.players.forEach(pData => {
        const player = Player.fromJSON(pData);
        room.players.set(player.id, player);
      });
    }
    return room;
  }
}

module.exports = Room;
