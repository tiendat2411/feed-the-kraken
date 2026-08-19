import { randomInt } from 'crypto';

export const FACTIONS = {
  SAILOR: 'SAILOR',
  PIRATE: 'PIRATE',
  CULT_LEADER: 'CULT_LEADER',
  CULTIST: 'CULTIST',
};

export class RoleDistributionService {
  /**
   * Sinh danh sách vai trò dựa theo số lượng người chơi (5 - 11)
   * @param {number} playerCount 
   * @returns {Array<string>}
   */
  static getRolePool(playerCount) {
    if (playerCount < 5 || playerCount > 11) {
      throw new Error(`Số lượng người chơi không hợp lệ (${playerCount}). Cần từ 5 đến 11 người.`);
    }

    // Quy tắc đặc biệt cho 5 người chơi:
    // Trộn 3 Sailor + 2 Pirate, rút bỏ ngẫu nhiên 1 thẻ, sau đó thêm 1 Cult Leader
    if (playerCount === 5) {
      const basePool = [
        FACTIONS.SAILOR,
        FACTIONS.SAILOR,
        FACTIONS.SAILOR,
        FACTIONS.PIRATE,
        FACTIONS.PIRATE
      ];
      this.shuffle(basePool);
      basePool.pop(); // Rút bỏ ngẫu nhiên 1 thẻ ra khỏi game
      basePool.push(FACTIONS.CULT_LEADER);
      return basePool;
    }

    // Bảng cấu hình chuẩn (6 - 11 người) theo luật chơi chính thức
    const roleTable = {
      6: { sailors: 3, pirates: 2, cultLeader: 1, cultists: 0 },
      7: { sailors: 4, pirates: 2, cultLeader: 1, cultists: 0 },
      8: { sailors: 4, pirates: 3, cultLeader: 1, cultists: 0 },
      9: { sailors: 5, pirates: 3, cultLeader: 1, cultists: 0 },
      10: { sailors: 5, pirates: 4, cultLeader: 1, cultists: 0 },
      11: { sailors: 5, pirates: 4, cultLeader: 1, cultists: 1 },
    };

    const config = roleTable[playerCount];
    const pool = [];

    for (let i = 0; i < config.sailors; i++) pool.push(FACTIONS.SAILOR);
    for (let i = 0; i < config.pirates; i++) pool.push(FACTIONS.PIRATE);
    for (let i = 0; i < config.cultLeader; i++) pool.push(FACTIONS.CULT_LEADER);
    for (let i = 0; i < config.cultists; i++) pool.push(FACTIONS.CULTIST);

    return pool;
  }

  /**
   * Thuật toán xáo trộn Fisher-Yates an toàn (Cryptographic Shuffle)
   * @param {Array} array 
   * @returns {Array}
   */
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Phân bổ vai trò bí mật cho danh sách Player và khởi tạo trạng thái đầu trận
   * @param {Array<Player>} players 
   * @returns {Map<string, string>} Map playerId -> factionRole
   */
  static distributeRoles(players) {
    if (!Array.isArray(players) || players.length < 5 || players.length > 11) {
      throw new Error(`Cần từ 5 đến 11 người chơi để bắt đầu chia vai (hiện có: ${players?.length || 0})`);
    }

    const pool = this.getRolePool(players.length);
    this.shuffle(pool);

    const assignments = new Map();

    players.forEach((player, index) => {
      const role = pool[index];
      player.factionRole = role;
      player.gunCount = 3; // Mỗi người bắt đầu với 3 khẩu súng
      player.status = 'ACTIVE';
      player.speechRestricted = false;
      assignments.set(player.id, role);
    });

    return assignments;
  }
}
