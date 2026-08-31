import MapBoard from '../models/MapBoard.js';
import { EndGameService } from './EndGameService.js';

/**
 * ExecutionService (BR-004 / UC-012, UC-013)
 * Xử lý việc di chuyển con tàu trên bản đồ lục giác (Ship Movement - UC-012),
 * nạp đạn khi cắt qua Tuyến tiếp tế (Supply Line - UC-013),
 * thực thi các Hành động Ô Bản Đồ (Map Actions - UC-013: Cabin Search, Flogging, Off with the tongue, Feed the Kraken),
 * và phân định kết thúc game khi tàu cập bến chiến thắng (Victory Assertions).
 */
export class ExecutionService {
  /**
   * Thực hiện di chuyển con tàu dựa trên lá bài điều hướng đã được chọn (UC-012)
   * @param {Object} room - Instance Room hiện tại
   * @returns {Object} Kết quả di chuyển và trạng thái game tiếp theo
   */
  static executeShipMovement(room) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'EXECUTE_ACTIONS' && room.gamePhase !== 'NAVIGATION_NAVIGATOR_DECISION') {
      throw new Error(`Không thể thực thi di chuyển tàu ở giai đoạn ${room.gamePhase}`);
    }

    const executedCard = room.executedNavigationCard;
    if (!executedCard || !executedCard.color) {
      throw new Error('Chưa có lá bài điều hướng nào được chốt để di chuyển tàu');
    }

    // Đảm bảo MapBoard đã được khởi tạo
    if (!room.mapBoard) {
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: room.mapType || 'QUICK_JOURNEY'
      });
    }

    const cardColor = executedCard.color; // 'RED' | 'YELLOW' | 'BLUE'
    
    // 1. Thực hiện di chuyển trên đồ thị bản đồ lục giác
    const movementResult = room.mapBoard.moveByDirection(cardColor);
    const { previousNode, currentNode, crossedSupplyLine, victoryFaction } = movementResult;

    // 2. Xử lý nạp đạn nếu tàu vừa cắt qua Tuyến tiếp tế (Supply Line - Map Long Journey)
    let supplyLineRefilledPlayers = [];
    if (crossedSupplyLine) {
      room.getPlayers().forEach(player => {
        if (player.status === 'ACTIVE') {
          if (player.gunCount < 3) {
            player.gunCount = 3;
            supplyLineRefilledPlayers.push(player.id);
          }
        }
      });
    }

    // 3. Kiểm tra điều kiện Thắng cuộc (End Game - Rule 3.6 & AC-2 UC-012)
    if (victoryFaction) {
      const endResult = EndGameService.endGame(room, victoryFaction, `SHIP_REACHED_${victoryFaction}_DESTINATION`);

      return {
        isGameOver: true,
        winnerFaction: victoryFaction,
        winReason: room.winReason,
        gameResult: room.gameResult,
        previousNode,
        currentNode,
        cardColor,
        executedCard,
        crossedSupplyLine,
        supplyLineRefilledPlayers,
        mapBoard: room.mapBoard.toSanitizedJSON(),
        room
      };
    }

    // 4. Nếu chưa kết thúc game -> Rẽ nhánh sang Map Action hoặc Card Action
    let nextPhase = 'EXECUTE_CARD_ACTION';
    let pendingMapAction = null;

    if (currentNode.mapAction && currentNode.mapAction !== 'NONE') {
      nextPhase = 'EXECUTE_MAP_ACTION';
      pendingMapAction = {
        type: currentNode.mapAction,
        nodeId: currentNode.id,
        nodeName: currentNode.name
      };
      room.pendingMapAction = pendingMapAction;
    } else {
      room.pendingMapAction = null;
    }

    room.gamePhase = nextPhase;
    room.touch();

    return {
      isGameOver: false,
      winnerFaction: null,
      nextPhase,
      previousNode,
      currentNode,
      cardColor,
      executedCard,
      mapAction: currentNode.mapAction || 'NONE',
      pendingMapAction,
      crossedSupplyLine,
      supplyLineRefilledPlayers,
      mapBoard: room.mapBoard.toSanitizedJSON(),
      room
    };
  }

  /**
   * Thuyền trưởng thực thi Hành động Ô Bản Đồ lên người chơi mục tiêu (UC-013)
   * @param {Object} room - Instance Room
   * @param {string} captainToken - sessionToken của Thuyền trưởng
   * @param {string} targetPlayerId - ID của người chơi mục tiêu
   * @returns {Object} Kết quả hành động bản đồ
   */
  static executeMapAction(room, captainToken, targetPlayerId) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'EXECUTE_MAP_ACTION') {
      throw new Error(`Không thể thực thi Map Action ở giai đoạn ${room.gamePhase}`);
    }

    if (!room.pendingMapAction || !room.pendingMapAction.type) {
      throw new Error('Không có Map Action nào đang chờ thực thi');
    }

    const captain = room.getPlayerByToken(captainToken);
    if (!captain || room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng đương nhiệm mới có quyền thực thi Hành động Bản đồ');
    }

    const targetPlayer = room.getPlayer(targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Người chơi mục tiêu không tồn tại trong phòng');
    }

    if (targetPlayer.status === 'ELIMINATED') {
      throw new Error('Không thể chọn người chơi đã bị loại khỏi tàu');
    }

    if (targetPlayer.id === room.captainId) {
      throw new Error('Thuyền trưởng không thể chọn chính mình làm mục tiêu');
    }

    const actionType = room.pendingMapAction.type;
    let resultPayload = {
      actionType,
      targetId: targetPlayer.id,
      targetName: targetPlayer.nickname
    };

    switch (actionType) {
      case 'CABIN_SEARCH': {
        // Khám xét Cabin (AC-1 UC-013)
        targetPlayer.isConvertible = false; // Miễn nhiễm thu nạp về sau

        let privateResult;
        if (targetPlayer.factionRole === 'CULTIST') {
          // Nếu đã bị thu nạp -> Chỉ gửi biểu tượng Tentacle, tuyệt đối không hiện phe gốc
          privateResult = 'CULTIST_TENTACLE';
        } else {
          privateResult = targetPlayer.factionRole; // 'SAILOR' | 'PIRATE' | 'CULT_LEADER'
        }

        resultPayload.isPrivate = true;
        resultPayload.privateResult = privateResult;
        resultPayload.publicMessage = `Captain secretly searched the cabin of ${targetPlayer.nickname}.`;
        break;
      }

      case 'FLOGGING': {
        // Đánh roi / Tra khảo (AC-4 UC-013)
        targetPlayer.isConvertible = false; // Miễn nhiễm thu nạp về sau

        // Xác định phe sai để tạo phát biểu loại trừ
        let candidateFalseFactions = [];
        if (targetPlayer.factionRole === 'SAILOR') {
          candidateFalseFactions = ['PIRATE', 'CULT_LEADER'];
        } else if (targetPlayer.factionRole === 'PIRATE') {
          candidateFalseFactions = ['SAILOR', 'CULT_LEADER'];
        } else if (targetPlayer.factionRole === 'CULT_LEADER') {
          candidateFalseFactions = ['SAILOR', 'PIRATE'];
        } else {
          // CULTIST
          candidateFalseFactions = ['SAILOR', 'PIRATE'];
        }

        const falseFaction = candidateFalseFactions[Math.floor(Math.random() * candidateFalseFactions.length)];
        const falseFactionLabel = falseFaction === 'SAILOR' ? 'Sailor' : falseFaction === 'PIRATE' ? 'Pirate' : 'Cultist';

        targetPlayer.floggingStatement = {
          falseFaction,
          factionType: falseFaction === 'CULT_LEADER' ? 'CULT' : falseFaction,
          text: `NOT A ${falseFaction === 'SAILOR' ? 'SAILOR' : falseFaction === 'PIRATE' ? 'PIRATE' : 'CULTIST'}`
        };

        resultPayload.isPrivate = false;
        resultPayload.falseFaction = falseFaction;
        resultPayload.publicStatement = `This person is NOT a ${falseFactionLabel}`;
        resultPayload.publicMessage = `After flogging, Captain publicly declared: "${targetPlayer.nickname} is NOT a ${falseFactionLabel}".`;
        break;
      }

      case 'OFF_WITH_THE_TONGUE': {
        // Cắt lưỡi (Speech Restriction)
        targetPlayer.speechRestricted = true;
        resultPayload.isPrivate = false;
        resultPayload.publicMessage = `${targetPlayer.nickname}'s tongue has been cut! (Permanently silenced and disqualified from Captaincy).`;
        break;
      }

      case 'FEED_THE_KRAKEN': {
        // Hiến tế cho Kraken (AC-3 UC-013)
        targetPlayer.status = 'ELIMINATED';
        targetPlayer.eliminationReason = 'FEED_THE_KRAKEN';
        targetPlayer.gunCount = 0;
        targetPlayer.publicTitles = [];

        if (targetPlayer.id === room.lieutenantId) room.lieutenantId = null;
        if (targetPlayer.id === room.navigatorId) room.navigatorId = null;

        // KIỂM TRA ĐIỀU KIỆN THẮNG ĐẶC BIỆT: Hiến tế trúng Cult Leader
        if (targetPlayer.factionRole === 'CULT_LEADER') {
          EndGameService.endGame(room, 'CULT', 'CULT_LEADER_SACRIFICED_TO_KRAKEN');

          resultPayload.isGameOver = true;
          resultPayload.winnerFaction = 'CULT';
          resultPayload.winReason = room.winReason;
          resultPayload.gameResult = room.gameResult;
          resultPayload.publicMessage = `${targetPlayer.nickname} đã bị hiến tế cho thần Kraken! Thần Kraken trỗi dậy, phe Tà Giáo (Cult) giành CHIẾN THẮNG!`;

          room.lastMapActionResult = resultPayload;
          return {
            actionType,
            resultPayload,
            isGameOver: true,
            winnerFaction: 'CULT',
            gameResult: room.gameResult,
            room
          };
        }

        resultPayload.isGameOver = false;
        resultPayload.isPrivate = false;
        resultPayload.publicMessage = `${targetPlayer.nickname} đã bị ném xuống biển hiến tế cho quái vật Kraken!`;
        break;
      }

      default:
        throw new Error(`Loại Map Action không được hỗ trợ: ${actionType}`);
    }

    room.lastMapActionResult = resultPayload;
    room.touch();

    return {
      actionType,
      resultPayload,
      isGameOver: false,
      winnerFaction: null,
      room
    };
  }

  /**
   * Thuyền trưởng xác nhận kết thúc Map Action để chuyển tiếp sang Card Action (Game Pace)
   * @param {Object} room 
   * @param {string} captainToken 
   * @returns {Object}
   */
  static confirmMapActionAndAdvance(room, captainToken) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'EXECUTE_MAP_ACTION') {
      throw new Error(`Không thể chuyển tiếp Map Action ở giai đoạn ${room.gamePhase}`);
    }

    const captain = room.getPlayerByToken(captainToken);
    if (!captain || room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng đương nhiệm mới có quyền xác nhận chuyển phase');
    }

    room.pendingMapAction = null;
    room.gamePhase = 'EXECUTE_CARD_ACTION';
    room.touch();

    return {
      nextPhase: 'EXECUTE_CARD_ACTION',
      cardAction: room.executedNavigationCard?.action || 'NONE',
      room
    };
  }

  /**
   * Tự động kích hoạt Hiệu Ứng Thẻ Bài khi bước vào phase EXECUTE_CARD_ACTION (UC-014)
   * @param {Object} room - Instance Room
   * @returns {Object}
   */
  static executeCardAction(room) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'EXECUTE_CARD_ACTION') {
      throw new Error(`Không thể thực thi Card Action ở giai đoạn ${room.gamePhase}`);
    }

    const executedCard = room.executedNavigationCard;
    const cardAction = executedCard?.action || 'NONE';

    switch (cardAction) {
      case 'DRUNK': {
        // Say rượu (AC-1 UC-014): Chuyển Thuyền trưởng theo vòng tròn kim đồng hồ, bỏ qua bị cắt lưỡi / eliminated
        const players = room.getPlayers();
        const currentIndex = players.findIndex(p => p.id === room.captainId);
        
        let newCaptain = null;
        for (let i = 1; i < players.length; i++) {
          const candidate = players[(currentIndex + i) % players.length];
          if (candidate.status !== 'ELIMINATED' && !candidate.speechRestricted) {
            newCaptain = candidate;
            break;
          }
        }

        if (newCaptain && newCaptain.id !== room.captainId) {
          const oldCaptain = room.getPlayer(room.captainId);
          if (oldCaptain) {
            oldCaptain.publicTitles = oldCaptain.publicTitles.filter(t => t !== 'CAPTAIN');
          }
          room.captainId = newCaptain.id;
          if (!newCaptain.publicTitles.includes('CAPTAIN')) {
            newCaptain.publicTitles.push('CAPTAIN');
          }

          room.gamePhase = 'ROUND_END';
          room.pendingCardAction = null;
          room.touch();

          return {
            actionType: 'DRUNK',
            oldCaptainId: oldCaptain?.id,
            newCaptainId: newCaptain.id,
            newCaptainName: newCaptain.nickname,
            nextPhase: 'ROUND_END',
            publicMessage: `${oldCaptain?.nickname || 'Thuyền trưởng'} bị Say Rượu! Chức Thuyền trưởng được chuyển giao cho ${newCaptain.nickname}.`,
            room
          };
        }

        room.gamePhase = 'ROUND_END';
        room.touch();
        return {
          actionType: 'DRUNK',
          nextPhase: 'ROUND_END',
          publicMessage: 'Thuyền trưởng bị Say Rượu nhưng không tìm thấy người kế nhiệm hợp lệ.',
          room
        };
      }

      case 'ARMED': {
        // Vũ trang: Tiếp 1 súng cho Hoa tiêu đương nhiệm
        const navigator = room.getPlayer(room.navigatorId);
        if (navigator) {
          navigator.gunCount += 1;
        }

        room.gamePhase = 'ROUND_END';
        room.pendingCardAction = null;
        room.touch();

        return {
          actionType: 'ARMED',
          navigatorId: navigator?.id,
          navigatorName: navigator?.nickname,
          gunCount: navigator?.gunCount,
          nextPhase: 'ROUND_END',
          publicMessage: `Hoa tiêu ${navigator?.nickname || ''} được tiếp thêm 1 khẩu súng!`,
          room
        };
      }

      case 'DISARMED': {
        // Tước vũ khí: Trừ 1 súng của Hoa tiêu đương nhiệm nếu có
        const navigator = room.getPlayer(room.navigatorId);
        if (navigator) {
          navigator.gunCount = Math.max(0, navigator.gunCount - 1);
        }

        room.gamePhase = 'ROUND_END';
        room.pendingCardAction = null;
        room.touch();

        return {
          actionType: 'DISARMED',
          navigatorId: navigator?.id,
          navigatorName: navigator?.nickname,
          gunCount: navigator?.gunCount,
          nextPhase: 'ROUND_END',
          publicMessage: `Hoa tiêu ${navigator?.nickname || ''} bị tước 1 khẩu súng!`,
          room
        };
      }

      case 'MERMAID': {
        // Tiếng hát Tiên cá (AC-2 UC-014): Chờ Thuyền trưởng chỉ định 1 người
        room.gamePhase = 'CARD_ACTION_TARGET_SELECTION';
        room.pendingCardAction = {
          type: 'MERMAID',
          captainId: room.captainId
        };
        room.touch();

        return {
          actionType: 'MERMAID',
          requiresTargetSelection: true,
          captainId: room.captainId,
          nextPhase: 'CARD_ACTION_TARGET_SELECTION',
          publicMessage: 'Tiếng hát Tiên cá vang lên! Thuyền trưởng hãy chỉ định 1 người chơi bí mật lắng nghe.',
          room
        };
      }

      case 'TELESCOPE': {
        // Kính Viễn Vọng (AC-2 UC-014): Chờ Thuyền trưởng chỉ định 1 người
        room.gamePhase = 'CARD_ACTION_TARGET_SELECTION';
        room.pendingCardAction = {
          type: 'TELESCOPE',
          captainId: room.captainId
        };
        room.touch();

        return {
          actionType: 'TELESCOPE',
          requiresTargetSelection: true,
          captainId: room.captainId,
          nextPhase: 'CARD_ACTION_TARGET_SELECTION',
          publicMessage: 'Kính Viễn Vọng được kích hoạt! Thuyền trưởng hãy chỉ định 1 người chơi bí mật soi đỉnh cọc bài.',
          room
        };
      }

      case 'CULT_UPRISING': {
        // Nghi thức Tà giáo (UC-015)
        room.gamePhase = 'CULT_UPRISING';
        room.pendingCardAction = null;
        room.touch();

        return {
          actionType: 'CULT_UPRISING',
          nextPhase: 'CULT_UPRISING',
          publicMessage: 'Nghi thức Tà Giáo (Cult Uprising) bắt đầu trỗi dậy!',
          room
        };
      }

      case 'NONE':
      default: {
        room.gamePhase = 'ROUND_END';
        room.pendingCardAction = null;
        room.touch();

        return {
          actionType: 'NONE',
          nextPhase: 'ROUND_END',
          publicMessage: 'Lá bài không có hiệu ứng đặc biệt.',
          room
        };
      }
    }
  }

  /**
   * Thuyền trưởng chỉ định người nhận hiệu ứng Mermaid hoặc Telescope (AC-2 UC-014)
   * @param {Object} room 
   * @param {string} captainToken 
   * @param {string} targetPlayerId 
   * @returns {Object}
   */
  static designateCardActionTarget(room, captainToken, targetPlayerId) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'CARD_ACTION_TARGET_SELECTION') {
      throw new Error(`Không thể chỉ định mục tiêu ở giai đoạn ${room.gamePhase}`);
    }

    if (!room.pendingCardAction || !room.pendingCardAction.type) {
      throw new Error('Không có hiệu ứng thẻ bài nào đang chờ chỉ định mục tiêu');
    }

    const captain = room.getPlayerByToken(captainToken);
    if (!captain || room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng đương nhiệm mới có quyền chỉ định người nhận hiệu ứng');
    }

    const targetPlayer = room.getPlayer(targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Người chơi mục tiêu không tồn tại trong phòng');
    }

    if (targetPlayer.status === 'ELIMINATED') {
      throw new Error('Không thể chỉ định người chơi đã bị loại khỏi tàu');
    }

    if (targetPlayer.id === room.captainId) {
      throw new Error('Thuyền trưởng không thể tự chỉ định chính mình');
    }

    const actionType = room.pendingCardAction.type;

    if (actionType === 'MERMAID') {
      // Lấy tối đa 3 lá bài bị hủy gần nhất đã xáo trộn
      const mermaidCards = room.navigationDeck.peekRecentDiscard(3);
      room.pendingMermaidInspection = {
        targetPlayerId: targetPlayer.id,
        cards: mermaidCards
      };
      room.gamePhase = 'MERMAID_INSPECTION';
      room.touch();

      return {
        actionType: 'MERMAID',
        targetPlayerId: targetPlayer.id,
        targetPlayerName: targetPlayer.nickname,
        cards: mermaidCards,
        nextPhase: 'MERMAID_INSPECTION',
        publicMessage: `Thuyền trưởng đã chỉ định ${targetPlayer.nickname} lắng nghe Tiếng hát Tiên cá.`,
        room
      };
    }

    if (actionType === 'TELESCOPE') {
      // Lấy lá bài trên cùng của draw_pile
      const topCard = room.navigationDeck.peekTopDrawPile();
      room.pendingTelescopeInspection = {
        targetPlayerId: targetPlayer.id,
        card: topCard
      };
      room.gamePhase = 'TELESCOPE_INSPECTION';
      room.touch();

      return {
        actionType: 'TELESCOPE',
        targetPlayerId: targetPlayer.id,
        targetPlayerName: targetPlayer.nickname,
        card: topCard,
        nextPhase: 'TELESCOPE_INSPECTION',
        publicMessage: `Thuyền trưởng đã trao Kính viễn vọng cho ${targetPlayer.nickname} soi đỉnh cọc bài.`,
        room
      };
    }

    throw new Error(`Loại hiệu ứng không hỗ trợ chỉ định mục tiêu: ${actionType}`);
  }

  /**
   * Người được chỉ định Kính viễn vọng quyết định GIỮ hoặc VỨT lá bài trên đỉnh cọc bài (AC-3 UC-014)
   * @param {Object} room 
   * @param {string} playerToken 
   * @param {'KEEP'|'DISCARD'} decision 
   * @returns {Object}
   */
  static resolveTelescopeDecision(room, playerToken, decision) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'TELESCOPE_INSPECTION') {
      throw new Error(`Không thể giải quyết Kính viễn vọng ở giai đoạn ${room.gamePhase}`);
    }

    const player = room.getPlayerByToken(playerToken);
    if (!player || !room.pendingTelescopeInspection || room.pendingTelescopeInspection.targetPlayerId !== player.id) {
      throw new Error('Bạn không phải là người được chỉ định sử dụng Kính viễn vọng');
    }

    let publicMessage;
    if (decision === 'DISCARD') {
      const discarded = room.navigationDeck.discardTopDrawPile();
      publicMessage = `${player.nickname} đã dùng Kính viễn vọng và quyết định VỨT lá bài trên đỉnh vào Discard Pile.`;
    } else {
      // 'KEEP'
      publicMessage = `${player.nickname} đã dùng Kính viễn vọng và quyết định GIỮ lá bài trên đỉnh.`;
    }

    room.pendingTelescopeInspection = null;
    room.pendingCardAction = null;
    room.gamePhase = 'ROUND_END';
    room.touch();

    return {
      success: true,
      decision,
      nextPhase: 'ROUND_END',
      publicMessage,
      room
    };
  }

  /**
   * Người được chỉ định Tiếng hát tiên cá xác nhận đã xem xong các lá bài bị hủy (AC-2 UC-014)
   * @param {Object} room 
   * @param {string} playerToken 
   * @returns {Object}
   */
  static acknowledgeMermaidInspection(room, playerToken) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'MERMAID_INSPECTION') {
      throw new Error(`Không thể xác nhận Tiên cá ở giai đoạn ${room.gamePhase}`);
    }

    const player = room.getPlayerByToken(playerToken);
    if (!player || !room.pendingMermaidInspection || room.pendingMermaidInspection.targetPlayerId !== player.id) {
      throw new Error('Bạn không phải là người được chỉ định lắng nghe Tiếng hát Tiên cá');
    }

    room.pendingMermaidInspection = null;
    room.pendingCardAction = null;
    room.gamePhase = 'ROUND_END';
    room.touch();

    return {
      success: true,
      nextPhase: 'ROUND_END',
      publicMessage: `${player.nickname} đã nghe xong Tiếng hát Tiên cá.`,
      room
    };
  }

  /**
   * Bắt đầu Nghi thức Tà giáo (Cult Uprising - UC-015)
   * Rút 1 lá từ cultRitualDeck và chuyển sang phase CULT_UPRISING_BLIND
   * @param {Object} room 
   * @returns {Object}
   */
  static startCultUprising(room) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'CULT_UPRISING') {
      throw new Error(`Không thể bắt đầu Nghi thức Tà giáo ở giai đoạn ${room.gamePhase}`);
    }

    // Đảm bảo MapBoard đã được khởi tạo
    if (!room.mapBoard) {
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: room.mapType || 'QUICK_JOURNEY'
      });
    }

    const ritualCard = room.mapBoard.drawCultRitualCard();
    if (!ritualCard) {
      room.gamePhase = 'ROUND_END';
      room.pendingCultRitual = null;
      room.revealedCultRitual = null;
      room.touch();

      return {
        ritualCard: null,
        isDeckEmpty: true,
        nextPhase: 'ROUND_END',
        publicMessage: 'Cult Ritual deck is empty! Proceeding to next round.',
        room
      };
    }

    // Tìm Giáo chủ (Cult Leader)
    const cultLeader = room.getPlayers().find(p => p.factionRole === 'CULT_LEADER' && p.status !== 'ELIMINATED');
    if (!cultLeader) {
      room.gamePhase = 'ROUND_END';
      room.pendingCultRitual = null;
      room.revealedCultRitual = null;
      room.touch();

      return {
        ritualCard,
        isLeaderEliminated: true,
        nextPhase: 'ROUND_END',
        publicMessage: `Cult Ritual card [${ritualCard}] was drawn, but the Cult Leader is eliminated! Ritual ends.`,
        room
      };
    }

    // Chuẩn bị dữ liệu riêng tư nếu là CULT_CABIN_SEARCH
    let inspectionData = null;
    if (ritualCard === 'CULT_CABIN_SEARCH') {
      const capt = room.getPlayer(room.captainId);
      const lt = room.getPlayer(room.lieutenantId);
      const nav = room.getPlayer(room.navigatorId);
      inspectionData = {
        captain: { id: capt?.id, name: capt?.nickname, role: capt?.factionRole },
        lieutenant: { id: lt?.id, name: lt?.nickname, role: lt?.factionRole },
        navigator: { id: nav?.id, name: nav?.nickname, role: nav?.factionRole }
      };
    }

    const ritualMeta = {
      GUNS_STASH: {
        name: 'Guns Stash (Phát Súng Tà Giáo)',
        description: 'Dark energy summons 3 firearms from the abyss! During the night, the Cult Leader will secretly distribute 3 guns among the crew.'
      },
      CULT_CABIN_SEARCH: {
        name: 'Cult Cabin Search (Thị Kiến Ban Điều Hướng)',
        description: 'The Cult Leader opens their third eye in darkness to secretly peer into the true allegiance of the Captain, Lieutenant, and Navigator!'
      },
      CONVERSION: {
        name: 'Conversion (Thu Nạp Giáo Đồ)',
        description: 'The whispering shadows seek a new vessel! During the night, the Cult Leader will secretly convert one eligible crew member into a loyal Cultist!'
      }
    };

    room.revealedCultRitual = {
      type: ritualCard,
      name: ritualMeta[ritualCard]?.name || ritualCard,
      description: ritualMeta[ritualCard]?.description || ''
    };

    room.pendingCultRitual = {
      type: ritualCard,
      cultLeaderId: cultLeader.id,
      inspectionData
    };

    // Note: Remains in CULT_UPRISING for the public reveal step so all players see the ritual card!
    room.gamePhase = 'CULT_UPRISING';
    room.touch();

    return {
      ritualCard,
      ritualName: room.revealedCultRitual.name,
      ritualDescription: room.revealedCultRitual.description,
      cultLeaderId: cultLeader.id,
      inspectionData,
      nextPhase: 'CULT_UPRISING',
      publicMessage: `Cult Ritual card [${room.revealedCultRitual.name}] was drawn! Prepare for the night ritual...`,
      room
    };
  }

  /**
   * Thuyền trưởng xác nhận bắt đầu Màn đêm Tà giáo (CULT_UPRISING_BLIND) sau khi cả phòng đã xem thẻ bài nghi thức
   * @param {Object} room 
   * @param {string} captainToken 
   * @returns {Object}
   */
  static startCultNight(room, captainToken) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'CULT_UPRISING') {
      throw new Error(`Không thể bắt đầu Màn đêm Tà giáo ở giai đoạn ${room.gamePhase}`);
    }

    const captain = room.getPlayerByToken(captainToken);
    if (!captain || room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng mới có quyền kích hoạt Màn đêm');
    }

    if (!room.pendingCultRitual) {
      room.gamePhase = 'ROUND_END';
      room.revealedCultRitual = null;
    } else {
      room.gamePhase = 'CULT_UPRISING_BLIND';
    }

    room.touch();

    return {
      nextPhase: room.gamePhase,
      publicMessage: 'Night descends... All crew members must close their eyes in fear.',
      room
    };
  }

  /**
   * Giáo chủ thực thi phân phát 3 súng ẩn danh (AC-2 UC-015)
   * @param {Object} room 
   * @param {string} leaderToken 
   * @param {Array<{playerId: string, count: number}>} allocations 
   * @returns {Object}
   */
  static resolveCultGunsStash(room, leaderToken, allocations) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'CULT_UPRISING_BLIND') {
      throw new Error(`Không thể phát súng ở giai đoạn ${room.gamePhase}`);
    }

    if (!room.pendingCultRitual || room.pendingCultRitual.type !== 'GUNS_STASH') {
      throw new Error('Hiện không phải lượt phát súng của Nghi thức Tà giáo');
    }

    const leader = room.getPlayerByToken(leaderToken);
    if (!leader || room.pendingCultRitual.cultLeaderId !== leader.id) {
      throw new Error('Chỉ có Giáo chủ mới có quyền thực thi quyền năng này');
    }

    if (!Array.isArray(allocations) || allocations.length === 0) {
      throw new Error('Danh sách phân phối súng không hợp lệ');
    }

    const totalAllocated = allocations.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
    if (totalAllocated !== 3) {
      throw new Error(`Tổng số súng cấp phải đúng bằng 3 (hiện tại: ${totalAllocated})`);
    }

    allocations.forEach(({ playerId, count }) => {
      const player = room.getPlayer(playerId);
      if (player && player.status !== 'ELIMINATED' && count > 0) {
        player.gunCount += Number(count);
      }
    });

    room.pendingCultRitual = null;
    room.revealedCultRitual = null;
    room.gamePhase = 'ROUND_END';
    room.touch();

    return {
      success: true,
      nextPhase: 'ROUND_END',
      publicMessage: 'Cult Ritual has ended. Dawn arrives upon the ship!',
      room
    };
  }

  /**
   * Giáo chủ xác nhận đã xem xong thông tin phe của ban điều hướng (CULT_CABIN_SEARCH - UC-015)
   * @param {Object} room 
   * @param {string} leaderToken 
   * @returns {Object}
   */
  static resolveCultCabinSearch(room, leaderToken) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'CULT_UPRISING_BLIND') {
      throw new Error(`Không thể kết thúc Thị kiến ở giai đoạn ${room.gamePhase}`);
    }

    if (!room.pendingCultRitual || room.pendingCultRitual.type !== 'CULT_CABIN_SEARCH') {
      throw new Error('Hiện không phải lượt Thị kiến của Nghi thức Tà giáo');
    }

    const leader = room.getPlayerByToken(leaderToken);
    if (!leader || room.pendingCultRitual.cultLeaderId !== leader.id) {
      throw new Error('Chỉ có Giáo chủ mới có quyền thực thi quyền năng này');
    }

    room.pendingCultRitual = null;
    room.revealedCultRitual = null;
    room.gamePhase = 'ROUND_END';
    room.touch();

    return {
      success: true,
      nextPhase: 'ROUND_END',
      publicMessage: 'Cult Leader has concluded their secret vision. Dawn arrives!',
      room
    };
  }

  /**
   * Giáo chủ thu nạp 1 người chơi thành Cultist (AC-3 UC-015)
   * @param {Object} room 
   * @param {string} leaderToken 
   * @param {string} targetPlayerId 
   * @returns {Object}
   */
  static resolveCultConversion(room, leaderToken, targetPlayerId) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.gamePhase !== 'CULT_UPRISING_BLIND') {
      throw new Error(`Không thể thu nạp giáo đồ ở giai đoạn ${room.gamePhase}`);
    }

    if (!room.pendingCultRitual || room.pendingCultRitual.type !== 'CONVERSION') {
      throw new Error('Hiện không phải lượt Thu nạp của Nghi thức Tà giáo');
    }

    const leader = room.getPlayerByToken(leaderToken);
    if (!leader || room.pendingCultRitual.cultLeaderId !== leader.id) {
      throw new Error('Chỉ có Giáo chủ mới có quyền thực thi quyền năng này');
    }

    // Trường hợp không có người chơi thỏa mãn (hoặc Cult Leader bỏ qua)
    if (!targetPlayerId) {
      room.pendingCultRitual = null;
      room.revealedCultRitual = null;
      room.gamePhase = 'ROUND_END';
      room.touch();

      return {
        success: true,
        noConversion: true,
        convertedPlayerId: null,
        convertedPlayerName: null,
        cultLeaderId: leader.id,
        cultLeaderName: leader.nickname,
        nextPhase: 'ROUND_END',
        publicMessage: 'Conversion Ritual has concluded. Dawn arrives upon the ship!',
        room
      };
    }

    const targetPlayer = room.getPlayer(targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Người chơi mục tiêu không tồn tại');
    }

    if (targetPlayer.status !== 'ACTIVE') {
      throw new Error('Chỉ có thể thu nạp người chơi đang ở trạng thái ACTIVE');
    }

    if (!targetPlayer.isConvertible) {
      throw new Error('Người chơi này đã được miễn nhiễm (từng bị Cabin Search hoặc Flogging)');
    }

    if (targetPlayer.id === leader.id) {
      throw new Error('Giáo chủ không thể tự thu nạp chính mình');
    }

    // Thực hiện chuyển phe
    targetPlayer.originalFactionRole = targetPlayer.originalFactionRole || targetPlayer.factionRole;
    targetPlayer.factionRole = 'CULTIST';
    targetPlayer.isConvertible = false; // Đã thu nạp thì không bị thu nạp lại

    room.pendingCultRitual = null;
    room.revealedCultRitual = null;
    room.gamePhase = 'ROUND_END';
    room.touch();

    return {
      success: true,
      convertedPlayerId: targetPlayer.id,
      convertedPlayerName: targetPlayer.nickname,
      cultLeaderId: leader.id,
      cultLeaderName: leader.nickname,
      nextPhase: 'ROUND_END',
      publicMessage: 'Conversion Ritual has concluded. Dawn arrives upon the ship!',
      room
    };
  }
}

export default ExecutionService;
