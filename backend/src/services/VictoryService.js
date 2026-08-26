/**
 * VictoryService (BR-005 / UC-017)
 * Quản lý kiểm tra các điều kiện thắng cuộc (Victory Check) trong trò chơi Feed the Kraken.
 */
export class VictoryService {
  /**
   * Kiểm tra điều kiện thắng tổng thể của phòng chơi (UC-017)
   * @param {Object} room - Instance Room
   * @returns {Object} { isGameOver: boolean, winningFaction: string|null, winReason: string|null }
   */
  static checkVictory(room) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    // 1. Kiểm tra vị trí tàu trên bản đồ (Victory Nodes: Bluewater Bay, Crimson Cove, Kraken)
    if (room.mapBoard && typeof room.mapBoard.checkVictory === 'function') {
      const mapWinner = room.mapBoard.checkVictory();
      if (mapWinner) {
        return {
          isGameOver: true,
          winningFaction: mapWinner,
          winReason: `SHIP_REACHED_${mapWinner}_DESTINATION`
        };
      }
    }

    // 2. Kiểm tra Cult Leader có bị hiến tế qua FEED_THE_KRAKEN không (AC-2)
    const players = room.getPlayers ? room.getPlayers() : (room.players ? Array.from(room.players.values()) : []);
    const sacrificedCultLeader = players.find(p => 
      p.factionRole === 'CULT_LEADER' &&
      p.status === 'ELIMINATED' &&
      p.eliminationReason === 'FEED_THE_KRAKEN'
    );

    if (sacrificedCultLeader) {
      return {
        isGameOver: true,
        winningFaction: 'CULT',
        winReason: 'CULT_LEADER_SACRIFICED_TO_KRAKEN',
        cultLeaderId: sacrificedCultLeader.id,
        cultLeaderName: sacrificedCultLeader.nickname
      };
    }

    // Không có điều kiện thắng nào thỏa mãn
    return {
      isGameOver: false,
      winningFaction: null,
      winReason: null
    };
  }

  /**
   * Kiểm tra riêng khi có một sự kiện loại bỏ người chơi (Elimination)
   * @param {Object} player - Instance Player bị loại
   * @param {string} eliminationReason - Lý do loại ('FEED_THE_KRAKEN' | 'JUMPED_OVERBOARD')
   * @returns {Object}
   */
  static checkEliminationVictory(player, eliminationReason) {
    if (!player) return { isGameOver: false, winningFaction: null, winReason: null };

    // AC-1: Bỏ qua Navigator tự nhảy tàu (Jump Overboard) - không kích hoạt thắng cho Cult
    if (eliminationReason === 'JUMPED_OVERBOARD') {
      return {
        isGameOver: false,
        winningFaction: null,
        winReason: null
      };
    }

    // AC-2: Hiến tế Cult Leader cho Kraken -> Phe Cult thắng
    if (eliminationReason === 'FEED_THE_KRAKEN' && player.factionRole === 'CULT_LEADER') {
      return {
        isGameOver: true,
        winningFaction: 'CULT',
        winReason: 'CULT_LEADER_SACRIFICED_TO_KRAKEN',
        cultLeaderId: player.id,
        cultLeaderName: player.nickname
      };
    }

    return {
      isGameOver: false,
      winningFaction: null,
      winReason: null
    };
  }
}

export default VictoryService;
