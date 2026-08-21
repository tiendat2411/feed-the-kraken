import MapBoard from '../models/MapBoard.js';

/**
 * ExecutionService (BR-004 / UC-012)
 * Xử lý việc di chuyển con tàu trên bản đồ lục giác (Ship Movement),
 * nạp đạn khi cắt qua Tuyến tiếp tế (Supply Line),
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
}

export default ExecutionService;
