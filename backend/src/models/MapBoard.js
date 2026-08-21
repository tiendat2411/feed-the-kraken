import crypto from 'crypto';

export const CULT_RITUAL_TYPES = {
  GUNS_STASH: 'GUNS_STASH',
  CULT_CABIN_SEARCH: 'CULT_CABIN_SEARCH',
  CONVERSION: 'CONVERSION'
};

/**
 * MapBoard Entity (ENT-005)
 * Quản lý vị trí hiện tại của con tàu, chế độ bản đồ,
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
   */
  constructor({
    id = crypto.randomUUID(),
    roomId,
    mapMode = 'QUICK_JOURNEY',
    shipPosition = 'START',
    hasCrossedSupplyLine = false,
    cultRitualDeck,
    visitedNodes = ['START']
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

    if (cultRitualDeck && Array.isArray(cultRitualDeck)) {
      this.cultRitualDeck = [...cultRitualDeck];
    } else {
      this.cultRitualDeck = this.generateCultRitualDeck();
      this.shuffleArray(this.cultRitualDeck);
    }
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
   */
  moveShip(targetNodeId) {
    if (!targetNodeId || typeof targetNodeId !== 'string') {
      throw new Error('targetNodeId không hợp lệ');
    }
    this.shipPosition = targetNodeId;
    this.visitedNodes.push(targetNodeId);
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
      visitedNodes: [...this.visitedNodes]
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
      visitedNodes: [...this.visitedNodes]
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
      visitedNodes: data.visitedNodes
    });
  }
}

export default MapBoard;
