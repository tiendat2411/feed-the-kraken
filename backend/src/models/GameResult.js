import { randomUUID } from 'crypto';

/**
 * ENT-006: Game Result (Kết quả Ván Chơi)
 * Thực thể đại diện cho bản ghi kết quả của một ván chơi sau khi kết thúc.
 * Hỗ trợ màn hình vinh danh, xuất báo cáo tổng kết, và lưu trữ lịch sử ván đấu.
 */
export class GameResult {
  /**
   * Khởi tạo bản ghi GameResult
   * @param {Object} params
   * @param {string} [params.id] - ID duy nhất (mặc định sinh UUID)
   * @param {string} params.roomId - Mã phòng diễn ra trận đấu
   * @param {string} params.winningFaction - Phe thắng cuộc ('SAILOR' | 'PIRATE' | 'CULT')
   * @param {string} params.winReason - Lý do / sự kiện kích hoạt chiến thắng
   * @param {Array<Object>} params.playersSnapshot - Danh sách snapshot đầy đủ của toàn bộ người chơi
   * @param {Object|null} [params.terminalNode] - Node nơi con tàu cập bến kết thúc
   * @param {Array<string>} [params.visitedNodes] - Lịch sử các node tàu đã đi qua
   * @param {string} [params.mapType] - Chế độ bản đồ ('QUICK_JOURNEY' | 'LONG_JOURNEY')
   * @param {number} [params.totalRounds] - Tổng số vòng điều hướng đã diễn ra
   * @param {number|string} [params.createdAt] - Thời điểm kết thúc ván đấu
   */
  constructor({
    id = randomUUID(),
    roomId,
    winningFaction,
    winReason,
    playersSnapshot = [],
    terminalNode = null,
    visitedNodes = [],
    mapType = 'QUICK_JOURNEY',
    totalRounds = 0,
    createdAt = Date.now()
  }) {
    // 1. Invariant Checks (Defensive Programming)
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('roomId là bắt buộc và phải là một chuỗi ký tự');
    }

    const validFactions = ['SAILOR', 'PIRATE', 'CULT'];
    if (!validFactions.includes(winningFaction)) {
      throw new Error(`winningFaction không hợp lệ: ${winningFaction}. Bắt buộc phải là một trong [SAILOR, PIRATE, CULT]`);
    }

    if (!winReason || typeof winReason !== 'string') {
      throw new Error('winReason là bắt buộc và phải là một chuỗi ký tự');
    }

    if (!Array.isArray(playersSnapshot) || playersSnapshot.length === 0) {
      throw new Error('playersSnapshot phải là một mảng và không được để trống');
    }

    this.id = id;
    this.roomId = roomId;
    this.winningFaction = winningFaction;
    this.winReason = winReason;
    this.playersSnapshot = playersSnapshot;
    this.terminalNode = terminalNode;
    this.visitedNodes = Array.isArray(visitedNodes) ? [...visitedNodes] : [];
    this.mapType = mapType;
    this.totalRounds = totalRounds;
    this.createdAt = createdAt;
  }

  /**
   * Factory method: Tạo instance GameResult từ instance Room hiện tại
   * @param {Object} room - Instance Room khi kết thúc ván đấu
   * @param {string} winningFaction - Phe thắng cuộc
   * @param {string} winReason - Lý do chiến thắng
   * @returns {GameResult}
   */
  static fromRoom(room, winningFaction, winReason) {
    if (!room) {
      throw new Error('Room là bắt buộc để tạo GameResult');
    }

    const rawPlayers = room.getPlayers ? room.getPlayers() : (room.players || []);
    
    // Tạo snapshot 100% dữ liệu danh tính thật sự của toàn bộ người chơi (ENT-006 Invariant)
    const playersSnapshot = rawPlayers.map(player => {
      const isCultLeader = player.factionRole === 'CULT_LEADER';
      const isCultist = player.isCultist === true || player.factionRole === 'CULTIST';
      
      let effectiveFaction = player.factionRole;
      if (isCultist && !isCultLeader) {
        effectiveFaction = 'CULTIST';
      }

      // Xác định người chơi có thuộc phe chiến thắng không
      let isWinner = false;
      if (winningFaction === 'SAILOR') {
        isWinner = (player.factionRole === 'SAILOR' && !isCultist);
      } else if (winningFaction === 'PIRATE') {
        isWinner = (player.factionRole === 'PIRATE' && !isCultist);
      } else if (winningFaction === 'CULT') {
        isWinner = (isCultLeader || isCultist || player.factionRole === 'CULTIST');
      }

      return {
        id: player.id,
        nickname: player.nickname,
        avatar: player.avatar || null,
        originalFaction: player.initialFactionRole || player.factionRole,
        currentFaction: effectiveFaction,
        isCultLeader,
        isCultist,
        isWinner,
        status: player.status,
        gunCount: player.gunCount ?? 0,
        publicTitles: Array.isArray(player.publicTitles) ? [...player.publicTitles] : [],
        speechRestricted: Boolean(player.speechRestricted)
      };
    });

    const currentNode = room.mapBoard?.getCurrentNode ? room.mapBoard.getCurrentNode() : null;
    const visitedNodes = room.mapBoard?.visitedNodes ? [...room.mapBoard.visitedNodes] : [];

    return new GameResult({
      roomId: room.id,
      winningFaction,
      winReason,
      playersSnapshot,
      terminalNode: currentNode,
      visitedNodes,
      mapType: room.mapType || 'QUICK_JOURNEY',
      totalRounds: visitedNodes.length > 0 ? visitedNodes.length - 1 : 0,
      createdAt: Date.now()
    });
  }

  /**
   * Chuyển đổi thành Object thuần phục vụ lưu trữ DB / serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      winningFaction: this.winningFaction,
      winReason: this.winReason,
      playersSnapshot: this.playersSnapshot,
      terminalNode: this.terminalNode,
      visitedNodes: this.visitedNodes,
      mapType: this.mapType,
      totalRounds: this.totalRounds,
      createdAt: this.createdAt
    };
  }

  /**
   * Trả về dữ liệu kết quả cho Client (Tiết lộ toàn bộ danh tính ẩn theo UC-018 AC-1)
   * @returns {Object}
   */
  toSanitizedJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      winningFaction: this.winningFaction,
      winReason: this.winReason,
      playersSnapshot: this.playersSnapshot,
      terminalNode: this.terminalNode,
      visitedNodes: this.visitedNodes,
      mapType: this.mapType,
      totalRounds: this.totalRounds,
      createdAt: this.createdAt
    };
  }

  /**
   * Khôi phục instance GameResult từ Object JSON
   * @param {Object} data 
   * @returns {GameResult}
   */
  static fromJSON(data) {
    if (!data) return null;
    return new GameResult({
      id: data.id,
      roomId: data.roomId,
      winningFaction: data.winningFaction,
      winReason: data.winReason,
      playersSnapshot: data.playersSnapshot || [],
      terminalNode: data.terminalNode || null,
      visitedNodes: data.visitedNodes || [],
      mapType: data.mapType || 'QUICK_JOURNEY',
      totalRounds: data.totalRounds || 0,
      createdAt: data.createdAt || Date.now()
    });
  }
}

export default GameResult;
