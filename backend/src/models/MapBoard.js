import crypto from 'crypto';
import quickJourneyConfig from '../config/maps/quick-journey.json' with { type: 'json' };
import longJourneyConfig from '../config/maps/long-journey.json' with { type: 'json' };

export const CULT_RITUAL_TYPES = {
  GUNS_STASH: 'GUNS_STASH',
  CULT_CABIN_SEARCH: 'CULT_CABIN_SEARCH',
  CONVERSION: 'CONVERSION'
};

export const MAP_CONFIGS = {
  QUICK_JOURNEY: quickJourneyConfig,
  LONG_JOURNEY: longJourneyConfig
};

/**
 * MapBoard Entity (ENT-005)
 * Quản lý vị trí hiện tại của con tàu, cấu hình bản đồ lục giác,
 * bộ bài Nghi thức Tà giáo (Cult Ritual Deck) và trạng thái đường tiếp tế (Supply Line).
 */
export class MapBoard {
  /**
   * Khởi tạo MapBoard
   * @param {Object} params
   * @param {string} [params.id] - UUID của bàn cờ
   * @param {string} params.roomId - Mã phòng chơi
   * @param {string} [params.mapMode='QUICK_JOURNEY'] - 'QUICK_JOURNEY' | 'LONG_JOURNEY'
   * @param {string} [params.shipPosition='START'] - ID node hiện tại của tàu
   * @param {boolean} [params.hasCrossedSupplyLine=false] - Cờ đã qua đường tiếp tế
   * @param {Array<string>} [params.cultRitualDeck] - Bộ bài Nghi thức Tà giáo (5 lá)
   * @param {Array<string>} [params.visitedNodes=['START']] - Lịch sử các node đã đi qua
   * @param {Object|null} [params.lastMovement=null] - Thông tin lượt di chuyển gần nhất { fromNodeId, toNodeId, cardColor }
   */
  constructor({
    id = crypto.randomUUID(),
    roomId,
    mapMode = 'QUICK_JOURNEY',
    shipPosition = 'START',
    hasCrossedSupplyLine = false,
    cultRitualDeck,
    visitedNodes = ['START'],
    lastMovement = null
  } = {}) {
    if (!roomId) {
      throw new Error('roomId là bắt buộc để khởi tạo MapBoard');
    }

    const validModes = ['QUICK_JOURNEY', 'LONG_JOURNEY'];
    if (!validModes.includes(mapMode)) {
      throw new Error(`mapMode không hợp lệ: ${mapMode}. Chỉ chấp nhận QUICK_JOURNEY hoặc LONG_JOURNEY`);
    }

    this.id = id;
    this.roomId = roomId;
    this.mapMode = mapMode;
    this.shipPosition = shipPosition;
    this.hasCrossedSupplyLine = Boolean(hasCrossedSupplyLine);
    this.visitedNodes = Array.isArray(visitedNodes) ? [...visitedNodes] : ['START'];
    this.lastMovement = lastMovement;

    if (cultRitualDeck && Array.isArray(cultRitualDeck)) {
      this.cultRitualDeck = [...cultRitualDeck];
    } else {
      this.cultRitualDeck = this.generateCultRitualDeck();
      this.shuffleArray(this.cultRitualDeck);
    }
  }

  /**
   * Lấy cấu hình đồ thị tĩnh của bản đồ hiện tại
   * @returns {Object}
   */
  getMapConfig() {
    return MAP_CONFIGS[this.mapMode] || MAP_CONFIGS.QUICK_JOURNEY;
  }

  /**
   * Tìm thông tin chi tiết một Node theo ID
   * @param {string} nodeId 
   * @returns {Object|null}
   */
  getNode(nodeId) {
    const config = this.getMapConfig();
    return config.nodes.find(n => n.id === nodeId) || null;
  }

  /**
   * Lấy thông tin chi tiết Node hiện tại của con tàu
   * @returns {Object|null}
   */
  getCurrentNode() {
    return this.getNode(this.shipPosition);
  }

  /**
   * Lấy ID Node tiếp theo dựa trên màu của lá bài điều hướng (RED | YELLOW | BLUE)
   * @param {string} colorDirection 
   * @returns {string|null}
   */
  getNextNodeId(colorDirection) {
    const currentNode = this.getCurrentNode();
    if (!currentNode || !currentNode.transitions) {
      return null;
    }
    return currentNode.transitions[colorDirection] || null;
  }

  /**
   * Kiểm tra xem lượt đi tiếp theo có cắt qua ranh giới tiếp tế (Supply Line) không
   * @param {string} [colorDirection]
   * @returns {boolean}
   */
  willCrossSupplyLine(colorDirection) {
    if (this.mapMode !== 'LONG_JOURNEY' || this.hasCrossedSupplyLine) {
      return false;
    }
    const currentNode = this.getCurrentNode();
    return Boolean(currentNode?.crossesSupplyLine);
  }

  /**
   * Kiểm tra vị trí hiện tại của tàu có phải là Node Thắng Cuộc không
   * @returns {boolean}
   */
  isVictoryNode() {
    const currentNode = this.getCurrentNode();
    return Boolean(currentNode && currentNode.victoryZone);
  }

  /**
   * Lấy phe chiến thắng nếu tàu đã cập bến đích
   * @returns {'PIRATE'|'CULT'|'SAILOR'|null}
   */
  getVictoryFaction() {
    const currentNode = this.getCurrentNode();
    if (!currentNode || !currentNode.victoryZone) return null;

    if (currentNode.victoryZone === 'PIRATE_VICTORY') return 'PIRATE';
    if (currentNode.victoryZone === 'CULT_VICTORY') return 'CULT';
    if (currentNode.victoryZone === 'SAILOR_VICTORY') return 'SAILOR';
    return null;
  }

  /**
   * Sinh bộ 5 lá bài Nghi thức Tà giáo (1 Guns Stash, 1 Cult Cabin Search, 3 Conversion)
   * @returns {Array<string>}
   */
  generateCultRitualDeck() {
    return [
      CULT_RITUAL_TYPES.GUNS_STASH,
      CULT_RITUAL_TYPES.CULT_CABIN_SEARCH,
      CULT_RITUAL_TYPES.CONVERSION,
      CULT_RITUAL_TYPES.CONVERSION,
      CULT_RITUAL_TYPES.CONVERSION
    ];
  }

  /**
   * Xáo trộn mảng ngẫu nhiên (Fisher-Yates)
   * @param {Array} array 
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Rút 1 lá bài Nghi thức Tà giáo (dùng cho sự kiện CULT_UPRISING - UC-015)
   * @returns {string|null} Trả về tên loại bài ritual hoặc null nếu đã hết bài
   */
  drawCultRitualCard() {
    if (this.cultRitualDeck.length === 0) {
      return null;
    }
    return this.cultRitualDeck.pop();
  }

  /**
   * Di chuyển tàu đến node mục tiêu trên bản đồ (UC-012)
   * @param {string} targetNodeId 
   * @param {string|null} [cardColor=null]
   */
  moveShip(targetNodeId, cardColor = null) {
    if (!targetNodeId || typeof targetNodeId !== 'string') {
      throw new Error('targetNodeId không hợp lệ');
    }
    const previousPosition = this.shipPosition;
    this.shipPosition = targetNodeId;
    this.visitedNodes.push(targetNodeId);
    this.lastMovement = {
      fromNodeId: previousPosition,
      toNodeId: targetNodeId,
      cardColor
    };
  }

  /**
   * Di chuyển tàu theo màu của lá bài điều hướng
   * @param {string} colorDirection - 'RED' | 'YELLOW' | 'BLUE'
   * @returns {Object} Kết quả di chuyển { previousNode, currentNode, crossedSupplyLine, victoryFaction }
   */
  moveByDirection(colorDirection) {
    const validColors = ['RED', 'YELLOW', 'BLUE'];
    if (!validColors.includes(colorDirection)) {
      throw new Error(`Màu điều hướng không hợp lệ: ${colorDirection}`);
    }

    const previousNode = this.getCurrentNode();
    const nextNodeId = this.getNextNodeId(colorDirection);
    if (!nextNodeId) {
      throw new Error(`Không tìm thấy đường đi tiếp theo từ ô ${this.shipPosition} với màu ${colorDirection}`);
    }

    // Kiểm tra và xử lý đường tiếp tế nếu có
    let crossedSupplyLine = false;
    if (this.willCrossSupplyLine(colorDirection)) {
      crossedSupplyLine = this.crossSupplyLine();
    }

    this.moveShip(nextNodeId, colorDirection);
    const currentNode = this.getCurrentNode();
    const victoryFaction = this.getVictoryFaction();

    return {
      previousNode,
      currentNode,
      crossedSupplyLine,
      victoryFaction
    };
  }

  /**
   * Đánh dấu tàu đã cắt qua đường tiếp tế (Supply Line - UC-013)
   * @returns {boolean} true nếu là lần đầu tiên kích hoạt thành công, false nếu đã từng qua trước đó
   */
  crossSupplyLine() {
    if (this.hasCrossedSupplyLine) {
      return false;
    }
    this.hasCrossedSupplyLine = true;
    return true;
  }

  /**
   * Trả về JSON bảo mật cho Client (giấu thứ tự bài ritual chưa rút)
   * @returns {Object}
   */
  toSanitizedJSON() {
    return {
      id: this.id,
      mapMode: this.mapMode,
      shipPosition: this.shipPosition,
      hasCrossedSupplyLine: this.hasCrossedSupplyLine,
      cultRitualCount: this.cultRitualDeck.length,
      visitedNodes: [...this.visitedNodes],
      lastMovement: this.lastMovement ? { ...this.lastMovement } : null,
      currentNode: this.getCurrentNode()
    };
  }

  /**
   * Trả về JSON đầy đủ cho lưu trữ Snapshot
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      mapMode: this.mapMode,
      shipPosition: this.shipPosition,
      hasCrossedSupplyLine: this.hasCrossedSupplyLine,
      cultRitualDeck: [...this.cultRitualDeck],
      visitedNodes: [...this.visitedNodes],
      lastMovement: this.lastMovement ? { ...this.lastMovement } : null
    };
  }

  /**
   * Khởi tạo instance từ dữ liệu Snapshot JSON
   * @param {Object} data 
   * @returns {MapBoard}
   */
  static fromJSON(data) {
    if (!data) return null;
    return new MapBoard({
      id: data.id,
      roomId: data.roomId,
      mapMode: data.mapMode,
      shipPosition: data.shipPosition,
      hasCrossedSupplyLine: data.hasCrossedSupplyLine,
      cultRitualDeck: data.cultRitualDeck,
      visitedNodes: data.visitedNodes,
      lastMovement: data.lastMovement
    });
  }
}

export default MapBoard;
