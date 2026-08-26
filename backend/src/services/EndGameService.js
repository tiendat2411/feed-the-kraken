import { GameResult } from '../models/GameResult.js';

/**
 * EndGameService (BR-005 / UC-018)
 * Quản lý quy trình đóng băng trạng thái khi có phe thắng cuộc (End Game Flow),
 * khởi tạo thực thể GameResult và hỗ trợ Host đưa toàn phòng quay trở lại Sảnh chờ (Return to Lobby).
 */
export class EndGameService {
  /**
   * Kích hoạt kết thúc ván đấu (Freeze state, tạo GameResult snapshot)
   * @param {Object} room - Instance Room
   * @param {string} winningFaction - Phe thắng ('SAILOR' | 'PIRATE' | 'CULT')
   * @param {string} winReason - Lý do thắng cuộc
   * @returns {Object} { isGameOver: true, winningFaction, winReason, gameResult, room }
   */
  static endGame(room, winningFaction, winReason) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    const validFactions = ['SAILOR', 'PIRATE', 'CULT'];
    if (!validFactions.includes(winningFaction)) {
      throw new Error(`Phe thắng không hợp lệ: ${winningFaction}`);
    }

    if (!winReason || typeof winReason !== 'string') {
      throw new Error('winReason là bắt buộc và phải là chuỗi ký tự');
    }

    // 1. Đóng băng toàn bộ Game State (UC-018 Step 1)
    room.status = 'FINISHED';
    room.gamePhase = 'END_GAME';
    room.winnerFaction = winningFaction;
    room.winReason = winReason;
    room.phaseDeadline = null;

    // Hủy bỏ các luồng pending / timer
    room.mutinySession = null;
    room.pendingMapAction = null;
    room.pendingCardAction = null;
    room.pendingMermaidInspection = null;
    room.pendingTelescopeInspection = null;
    room.pendingCultRitual = null;
    room.navigationHand = null;

    // 2. Tạo bản ghi thực thể ENT-006: Game Result (UC-018 Step 3)
    const gameResult = GameResult.fromRoom(room, winningFaction, winReason);
    room.gameResult = gameResult.toJSON();

    room.touch();

    return {
      isGameOver: true,
      winningFaction,
      winReason,
      gameResult,
      room
    };
  }

  /**
   * Host đưa toàn bộ người chơi trong phòng quay lại Sảnh chờ (UC-018 Step 6)
   * @param {Object} room - Instance Room
   * @param {string} hostSessionToken - Token xác thực quyền của Host
   * @returns {Object} { success: true, room }
   */
  static returnToLobby(room, hostSessionToken) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    const host = room.getPlayerByToken(hostSessionToken);
    if (!host || room.hostId !== host.id) {
      throw new Error('Chỉ Chủ phòng (Host) mới có quyền đưa phòng về lại Sảnh chờ');
    }

    // Reset trạng thái phòng về LOBBY
    room.status = 'LOBBY';
    room.gamePhase = 'LOBBY';
    room.winnerFaction = null;
    room.winReason = null;
    room.gameResult = null;
    room.mapBoard = null;
    room.navigationDeck = null;
    room.captainId = null;
    room.lieutenantId = null;
    room.navigatorId = null;
    room.nominatedLieutenantId = null;
    room.nominatedNavigatorId = null;
    room.mutinySession = null;
    room.executedNavigationCard = null;
    room.pendingMapAction = null;
    room.lastMapActionResult = null;
    room.pendingCardAction = null;
    room.lastCardActionResult = null;
    room.pendingMermaidInspection = null;
    room.pendingTelescopeInspection = null;
    room.pendingCultRitual = null;
    room.navigationHand = null;
    room.phaseDeadline = null;

    // Reset toàn bộ thuộc tính game của người chơi
    const players = room.getPlayers();
    players.forEach(player => {
      player.status = 'ACTIVE';
      player.factionRole = null;
      player.initialFactionRole = null;
      player.originalFactionRole = null;
      player.isCultist = false;
      player.isConvertible = true;
      player.gunCount = 0;
      player.publicTitles = [];
      player.speechRestricted = false;
      player.eliminationReason = null;
    });

    room.touch();

    return {
      success: true,
      room
    };
  }
}

export default EndGameService;
