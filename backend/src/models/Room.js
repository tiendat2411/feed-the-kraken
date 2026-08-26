import Player from './Player.js';
import NavigationDeck from './NavigationDeck.js';
import MapBoard from './MapBoard.js';

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
    this.gamePhase = null; // e.g., 'ROLE_REVEAL', 'PIRATES_GATHERING', 'DAY_1_CREW_SELECTION'
    this.mapType = 'QUICK_JOURNEY'; // 'QUICK_JOURNEY' | 'LONG_JOURNEY'
    this.captainId = null;
    this.lieutenantId = null;
    this.navigatorId = null;
    this.nominatedLieutenantId = null;
    this.nominatedNavigatorId = null;
    this.mutinySession = null;
    this.navigationDeck = null;
    this.mapBoard = null;
    this.pendingMapAction = null;
    this.lastMapActionResult = null;
    this.pendingCardAction = null;
    this.pendingMermaidInspection = null;
    this.pendingTelescopeInspection = null;
    this.pendingCultRitual = null;
    this.phaseDeadline = null; // Timestamp kết thúc phase hiện tại
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    
    // Danh sách người chơi dạng Map<playerId, Player>
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
      throw new Error('Room is full (max 11 players)');
    }
    this.players.set(player.id, player);
    this.touch();
  }

  /**
   * Lấy thông tin player theo ID
   * @param {string} playerId 
   * @returns {Player|undefined}
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Lấy thông tin player theo Session Token
   * @param {string} sessionToken 
   * @returns {Player|undefined}
   */
  getPlayerByToken(sessionToken) {
    for (const player of this.players.values()) {
      if (player.sessionToken === sessionToken) {
        return player;
      }
    }
    return undefined;
  }

  /**
   * Xóa người chơi khỏi phòng
   * @param {string} playerId 
   * @returns {boolean}
   */
  removePlayer(playerId) {
    const deleted = this.players.delete(playerId);
    if (deleted) {
      this.touch();
    }
    return deleted;
  }

  /**
   * Chuyển quyền Host cho người chơi khác
   * @param {string} newHostId 
   */
  transferHost(newHostId) {
    if (this.players.has(newHostId)) {
      this.hostId = newHostId;
      this.touch();
    }
  }

  /**
   * Trả về JSON bảo mật, lọc bỏ vai trò của người khác
   * @param {string} requestingSessionToken 
   * @returns {Object}
   */
  toSanitizedJSON(requestingSessionToken) {
    const playersPublic = this.getPlayers().map(p => p.toPublicJSON());
    const requestingPlayer = this.getPlayerByToken(requestingSessionToken);

    const result = {
      id: this.id,
      hostId: this.hostId,
      status: this.status,
      gamePhase: this.gamePhase,
      mapType: this.mapType,
      captainId: this.captainId,
      lieutenantId: this.lieutenantId,
      navigatorId: this.navigatorId,
      nominatedLieutenantId: this.nominatedLieutenantId,
      nominatedNavigatorId: this.nominatedNavigatorId,
      mutinySession: this.mutinySession ? this.mutinySession.toSanitizedJSON(requestingPlayer?.id) : null,
      navigationDeck: this.navigationDeck ? this.navigationDeck.toSanitizedJSON() : null,
      mapBoard: this.mapBoard ? this.mapBoard.toSanitizedJSON() : null,
      pendingMapAction: this.pendingMapAction || null,
      lastMapActionResult: this.lastMapActionResult ? (
        this.lastMapActionResult.isPrivate && this.captainId !== requestingPlayer?.id
          ? {
              actionType: this.lastMapActionResult.actionType,
              targetId: this.lastMapActionResult.targetId,
              targetName: this.lastMapActionResult.targetName,
              publicMessage: this.lastMapActionResult.publicMessage
            }
          : this.lastMapActionResult
      ) : null,
      pendingCardAction: this.pendingCardAction || null,
      lastCardActionResult: this.lastCardActionResult || null,
      myMermaidCards: (this.pendingMermaidInspection && requestingPlayer && this.pendingMermaidInspection.targetPlayerId === requestingPlayer.id) ? (this.pendingMermaidInspection.cards || []) : [],
      myTelescopeCard: (this.pendingTelescopeInspection && requestingPlayer && this.pendingTelescopeInspection.targetPlayerId === requestingPlayer.id) ? (this.pendingTelescopeInspection.card || null) : null,
      pendingCultRitual: this.pendingCultRitual ? {
        type: this.pendingCultRitual.type
      } : null,
      myCultInspection: (this.pendingCultRitual && this.pendingCultRitual.type === 'CULT_CABIN_SEARCH' && requestingPlayer?.factionRole === 'CULT_LEADER')
        ? this.pendingCultRitual.inspectionData || null
        : null,
      phaseDeadline: this.phaseDeadline,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      players: playersPublic,
      myRole: requestingPlayer ? requestingPlayer.factionRole : null,
      myId: requestingPlayer ? requestingPlayer.id : null,
      executedNavigationCard: this.executedNavigationCard || null,
      myNavigationCards: (this.navigationHand && requestingPlayer && this.navigationHand.playerId === requestingPlayer.id) ? (this.navigationHand.cards || []) : []
    };

    // Nếu đang ở giai đoạn Pirate Gathering và người này là Pirate -> Cho thấy danh sách Pirate khác
    if (this.gamePhase === 'PIRATES_GATHERING' && requestingPlayer?.factionRole === 'PIRATE') {
      result.knownPirates = this.getPlayers()
        .filter(p => p.factionRole === 'PIRATE')
        .map(p => ({ id: p.id, nickname: p.nickname, name: p.nickname, avatar: p.avatar }));
    }

    return result;
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
      lieutenantId: this.lieutenantId,
      navigatorId: this.navigatorId,
      nominatedLieutenantId: this.nominatedLieutenantId,
      nominatedNavigatorId: this.nominatedNavigatorId,
      mutinySession: this.mutinySession ? this.mutinySession.toJSON() : null,
      navigationDeck: this.navigationDeck ? this.navigationDeck.toJSON() : null,
      mapBoard: this.mapBoard ? this.mapBoard.toJSON() : null,
      pendingMapAction: this.pendingMapAction || null,
      lastMapActionResult: this.lastMapActionResult || null,
      pendingCardAction: this.pendingCardAction || null,
      pendingMermaidInspection: this.pendingMermaidInspection || null,
      pendingTelescopeInspection: this.pendingTelescopeInspection || null,
      pendingCultRitual: this.pendingCultRitual || null,
      navigationHand: this.navigationHand || null,
      executedNavigationCard: this.executedNavigationCard || null,
      phaseDeadline: this.phaseDeadline,
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
    room.lieutenantId = data.lieutenantId || null;
    room.navigatorId = data.navigatorId || null;
    room.nominatedLieutenantId = data.nominatedLieutenantId || null;
    room.nominatedNavigatorId = data.nominatedNavigatorId || null;
    room.mutinySession = data.mutinySession ? data.mutinySession : null;
    room.navigationDeck = data.navigationDeck ? NavigationDeck.fromJSON(data.navigationDeck) : null;
    room.mapBoard = data.mapBoard ? MapBoard.fromJSON(data.mapBoard) : null;
    room.pendingMapAction = data.pendingMapAction || null;
    room.lastMapActionResult = data.lastMapActionResult || null;
    room.pendingCardAction = data.pendingCardAction || null;
    room.pendingMermaidInspection = data.pendingMermaidInspection || null;
    room.pendingTelescopeInspection = data.pendingTelescopeInspection || null;
    room.pendingCultRitual = data.pendingCultRitual || null;
    room.navigationHand = data.navigationHand || null;
    room.executedNavigationCard = data.executedNavigationCard || null;
    room.phaseDeadline = data.phaseDeadline || null;
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

export default Room;

