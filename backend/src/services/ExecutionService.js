import MapBoard from '../models/MapBoard.js';

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
      room.status = 'FINISHED';
      room.gamePhase = 'END_GAME';
      room.winnerFaction = victoryFaction;
      room.winReason = `SHIP_REACHED_${victoryFaction}_DESTINATION`;
      room.touch();

      return {
        isGameOver: true,
        winnerFaction: victoryFaction,
        winReason: room.winReason,
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
        resultPayload.publicMessage = `Thuyền trưởng đã bí mật khám xét cabin của ${targetPlayer.nickname}.`;
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
        const falseFactionLabel = falseFaction === 'SAILOR' ? 'Thủy thủ (Sailor)' : falseFaction === 'PIRATE' ? 'Hải tặc (Pirate)' : 'Giáo chủ (Cult Leader)';

        resultPayload.isPrivate = false;
        resultPayload.falseFaction = falseFaction;
        resultPayload.publicStatement = `Người này không phải là ${falseFactionLabel}`;
        resultPayload.publicMessage = `Sau khi tra khảo, Thuyền trưởng công khai: "${targetPlayer.nickname} không phải là ${falseFactionLabel}".`;
        break;
      }

      case 'OFF_WITH_THE_TONGUE': {
        // Cắt lưỡi (Speech Restriction)
        targetPlayer.speechRestricted = true;
        resultPayload.isPrivate = false;
        resultPayload.publicMessage = `${targetPlayer.nickname} đã bị cắt lưỡi! (Khóa chat vĩnh viễn và mất quyền làm Thuyền trưởng).`;
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
          room.status = 'FINISHED';
          room.gamePhase = 'END_GAME';
          room.winnerFaction = 'CULT';
          room.winReason = 'CULT_LEADER_SACRIFICED_TO_KRAKEN';
          room.touch();

          resultPayload.isGameOver = true;
          resultPayload.winnerFaction = 'CULT';
          resultPayload.winReason = room.winReason;
          resultPayload.publicMessage = `${targetPlayer.nickname} đã bị hiến tế cho thần Kraken! Thần Kraken trỗi dậy, phe Tà Giáo (Cult) giành CHIẾN THẮNG!`;

          room.lastMapActionResult = resultPayload;
          return {
            actionType,
            resultPayload,
            isGameOver: true,
            winnerFaction: 'CULT',
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
}

export default ExecutionService;
