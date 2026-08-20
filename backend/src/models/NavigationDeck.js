import crypto from 'crypto';

/**
 * NavigationDeck Entity (ENT-004)
 * Quản lý kho bài điều hướng, chồng bài bốc (draw_pile),
 * chồng bài bỏ (discard_pile), và nhật ký hành trình (logbook_cards).
 */
export class NavigationDeck {
  /**
   * Khởi tạo NavigationDeck
   * @param {Object} params
   * @param {string} [params.id] - UUID của deck
   * @param {string} params.roomId - Mã phòng chơi
   * @param {string} [params.mapType='QUICK_JOURNEY'] - 'QUICK_JOURNEY' | 'LONG_JOURNEY'
   * @param {Array} [params.drawPile] - Chồng bài bốc
   * @param {Array} [params.discardPile] - Chồng bài bỏ
   * @param {Array} [params.logbookCards] - Thẻ trong Nhật ký hành trình (tối đa 2 lá)
   */
  constructor({
    id = crypto.randomUUID(),
    roomId,
    mapType = 'QUICK_JOURNEY',
    drawPile,
    discardPile = [],
    logbookCards = []
  } = {}) {
    this.id = id;
    this.roomId = roomId;
    this.mapType = mapType;
    this.discardPile = discardPile;
    this.logbookCards = logbookCards;

    if (drawPile) {
      this.drawPile = drawPile;
    } else {
      this.drawPile = this.generateDeck(this.mapType);
      this.shuffleArray(this.drawPile);
    }
  }

  /**
   * Sinh danh sách bài điều hướng theo cấu hình chế độ bản đồ (Map Mode)
   * @param {string} mapType 
   * @returns {Array<Object>}
   */
  generateDeck(mapType) {
    const cards = [];

    if (mapType === 'LONG_JOURNEY') {
      // LONG_JOURNEY: Tổng 23 lá
      // 1. 6 lá YELLOW (Cult): 100% CULT_UPRISING
      for (let i = 0; i < 6; i++) {
        cards.push(this.createCard('YELLOW', 'CULT_UPRISING'));
      }

      // 2. 6 lá BLUE (Sailor): 4 DRUNK, 2 DISARMED
      for (let i = 0; i < 4; i++) {
        cards.push(this.createCard('BLUE', 'DRUNK'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('BLUE', 'DISARMED'));
      }

      // 3. 11 lá RED (Pirate): 5 DRUNK, 2 MERMAID, 2 TELESCOPE, 2 ARMED (Tổng 11 lá)
      for (let i = 0; i < 5; i++) {
        cards.push(this.createCard('RED', 'DRUNK'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('RED', 'MERMAID'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('RED', 'TELESCOPE'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('RED', 'ARMED'));
      }
    } else {
      // QUICK_JOURNEY: Tổng 19 lá
      // 1. 5 lá YELLOW (Cult): 100% CULT_UPRISING
      for (let i = 0; i < 5; i++) {
        cards.push(this.createCard('YELLOW', 'CULT_UPRISING'));
      }

      // 2. 5 lá BLUE (Sailor): 3 DRUNK, 2 DISARMED
      for (let i = 0; i < 3; i++) {
        cards.push(this.createCard('BLUE', 'DRUNK'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('BLUE', 'DISARMED'));
      }

      // 3. 9 lá RED (Pirate): 5 DRUNK, 2 MERMAID, 2 TELESCOPE
      for (let i = 0; i < 5; i++) {
        cards.push(this.createCard('RED', 'DRUNK'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('RED', 'MERMAID'));
      }
      for (let i = 0; i < 2; i++) {
        cards.push(this.createCard('RED', 'TELESCOPE'));
      }
    }

    return cards;
  }

  /**
   * Tạo 1 thẻ bài điều hướng
   * @param {'BLUE'|'RED'|'YELLOW'} direction 
   * @param {string} action 
   * @returns {Object}
   */
  createCard(direction, action = 'NONE') {
    return {
      id: crypto.randomUUID(),
      direction, // 'BLUE' | 'RED' | 'YELLOW'
      color: direction, // Alias for frontend
      action // 'NONE' | 'DRUNK' | 'CULT_UPRISING' | 'ARMED' | 'DISARMED' | 'MERMAID' | 'TELESCOPE'
    };
  }

  /**
   * Rút `count` lá bài từ đầu chồng bài bốc (drawPile)
   * Tự động kích hoạt Auto-Reshuffle nếu drawPile không đủ số lượng bài.
   * @param {number} [count=1] 
   * @returns {Array<Object>}
   */
  draw(count = 1) {
    if (count <= 0) return [];

    const drawn = [];

    while (drawn.length < count) {
      if (this.drawPile.length === 0) {
        // Nếu draw_pile hết, tự động lấy discard_pile xáo lại
        if (this.discardPile.length === 0) {
          // Không còn bài nào trong cả draw_pile lẫn discard_pile
          break;
        }
        this.reshuffleDiscardIntoDraw();
      }

      const card = this.drawPile.shift();
      if (card) {
        drawn.push(card);
      }
    }

    return drawn;
  }

  /**
   * Chuyển toàn bộ discard_pile vào đáy của draw_pile sau khi xáo trộn
   * (Tuân thủ Invariant Rule 3.4 / Reshuffle Rule: Không chạm vào logbookCards)
   */
  reshuffleDiscardIntoDraw() {
    if (this.discardPile.length === 0) return;

    const cardsToShuffle = [...this.discardPile];
    this.discardPile = [];
    this.shuffleArray(cardsToShuffle);

    // Nối vào bên dưới các lá bài còn sót lại
    this.drawPile = [...this.drawPile, ...cardsToShuffle];
  }

  /**
   * Đưa 1 hoặc nhiều lá bài vào chồng bài bỏ (discardPile)
   * @param {Object|Array<Object>} cards 
   */
  discard(cards) {
    if (!cards) return;
    if (Array.isArray(cards)) {
      this.discardPile.push(...cards);
    } else {
      this.discardPile.push(cards);
    }
  }

  /**
   * Thêm 1 lá bài vào Hộp Nhật ký hành trình (Logbook)
   * @param {Object} card 
   */
  addToLogbook(card) {
    if (!card) return;
    if (this.logbookCards.length >= 2) {
      throw new Error('Hộp Nhật ký hành trình đã đủ tối đa 2 lá bài');
    }
    this.logbookCards.push(card);
  }

  /**
   * Xáo trộn bí mật 2 lá bài trong Logbook trước khi gửi cho Navigator
   */
  shuffleLogbook() {
    this.shuffleArray(this.logbookCards);
  }

  /**
   * Xóa sạch các lá bài trong Logbook
   */
  clearLogbook() {
    this.logbookCards = [];
  }

  /**
   * Xem bí mật lá bài trên cùng của draw_pile (Hiệu ứng TELESCOPE)
   * @returns {Object|null}
   */
  peekTopDrawPile() {
    if (this.drawPile.length === 0 && this.discardPile.length > 0) {
      this.reshuffleDiscardIntoDraw();
    }
    return this.drawPile[0] || null;
  }

  /**
   * Lấy danh sách tối đa `count` lá bài bị hủy gần nhất trong discard_pile,
   * sau khi đã xáo trộn chúng (Hiệu ứng MERMAID)
   * @param {number} [count=3] 
   * @returns {Array<Object>}
   */
  peekRecentDiscard(count = 3) {
    const recent = this.discardPile.slice(-count);
    const shuffledRecent = [...recent];
    this.shuffleArray(shuffledRecent);
    return shuffledRecent;
  }

  /**
   * Thuật toán xáo mảng Fisher-Yates
   * @private
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Trả về dữ liệu an toàn cho client công khai (Không để lộ nội dung các lá bài úp)
   * @returns {Object}
   */
  toSanitizedJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      mapType: this.mapType,
      drawPileCount: this.drawPile.length,
      discardPileCount: this.discardPile.length,
      logbookCount: this.logbookCards.length
    };
  }

  /**
   * Serialization đầy đủ cho Server lưu trữ Snapshot
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      mapType: this.mapType,
      drawPile: this.drawPile,
      discardPile: this.discardPile,
      logbookCards: this.logbookCards
    };
  }

  /**
   * Deserialization khôi phục từ snapshot
   * @param {Object} data 
   * @returns {NavigationDeck}
   */
  static fromJSON(data) {
    if (!data) return null;
    return new NavigationDeck({
      id: data.id,
      roomId: data.roomId,
      mapType: data.mapType,
      drawPile: data.drawPile,
      discardPile: data.discardPile || [],
      logbookCards: data.logbookCards || []
    });
  }
}

export default NavigationDeck;
