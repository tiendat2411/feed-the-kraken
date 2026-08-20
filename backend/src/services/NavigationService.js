import NavigationDeck from '../models/NavigationDeck.js';

/**
 * NavigationService
 * Xử lý toàn bộ logic nghiệp vụ cho BR-003:
 * 1. Rút bài bí mật cho Captain (UC-009)
 * 2. Rút bài bí mật cho Lieutenant (UC-009)
 * 3. Xáo trộn Logbook và gửi bài cho Navigator (UC-010)
 * 4. Navigator chốt bài hoặc Tự nhảy tàu (Jump Overboard - UC-010, UC-011)
 * 5. Bổ nhiệm Hoa tiêu khẩn cấp (Emergency Navigator - UC-011)
 * 6. Xử lý Auto-Reshuffle khi hết bài bốc
 */
export class NavigationService {
  /**
   * Khởi động Giai đoạn Điều hướng (Captain bắt đầu bốc 2 lá đầu tiên)
   * @param {Object} room - Instance Room
   * @returns {Object}
   */
  static startNavigation(room) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (!room.captainId || !room.lieutenantId || !room.navigatorId) {
      throw new Error('Ban điều hướng chưa đủ 3 chức danh (Captain, Lieutenant, Navigator)');
    }

    // Đảm bảo NavigationDeck đã được khởi tạo
    if (!room.navigationDeck) {
      room.navigationDeck = new NavigationDeck({
        roomId: room.id,
        mapType: room.mapType
      });
    }

    // Xóa sạch logbook cũ nếu có
    room.navigationDeck.clearLogbook();

    // Rút 2 lá bài cho Thuyền trưởng
    const captainCards = room.navigationDeck.draw(2);
    if (captainCards.length < 2) {
      throw new Error('Không đủ bài trong bộ bài điều hướng');
    }

    room.navigationHand = {
      playerId: room.captainId,
      role: 'CAPTAIN',
      cards: captainCards
    };

    room.gamePhase = 'NAVIGATION_CAPTAIN_DRAW';
    room.touch();

    return {
      gamePhase: room.gamePhase,
      captainId: room.captainId,
      cards: captainCards,
      room
    };
  }

  /**
   * Thuyền trưởng chọn 1 lá giữ vào Logbook, 1 lá hủy vào Discard Pile (UC-009)
   * @param {Object} room 
   * @param {string} captainToken - sessionToken của Thuyền trưởng
   * @param {string} keptCardId - ID lá bài Thuyền trưởng muốn bỏ vào Logbook
   * @returns {Object}
   */
  static captainSelectCard(room, captainToken, keptCardId) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (room.gamePhase !== 'NAVIGATION_CAPTAIN_DRAW') {
      throw new Error(`Không thể chọn bài ở giai đoạn ${room.gamePhase}`);
    }

    const captain = room.getPlayerByToken(captainToken);
    if (!captain || room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng đương nhiệm mới có quyền chọn bài ở giai đoạn này');
    }

    const currentHand = room.navigationHand?.cards || [];
    const keptCard = currentHand.find(c => c.id === keptCardId);
    const discardedCard = currentHand.find(c => c.id !== keptCardId);

    if (!keptCard || !discardedCard) {
      throw new Error('Lá bài được chọn không hợp lệ hoặc không nằm trên tay');
    }

    // 1. Thêm lá giữ vào Logbook
    room.navigationDeck.addToLogbook(keptCard);

    // 2. Thêm lá loại vào Discard Pile (Úp)
    room.navigationDeck.discard(discardedCard);

    // 3. Rút 2 lá tiếp theo cho Thuyền phó
    const ltCards = room.navigationDeck.draw(2);
    if (ltCards.length < 2) {
      throw new Error('Không đủ bài trong bộ bài điều hướng cho Thuyền phó');
    }

    room.navigationHand = {
      playerId: room.lieutenantId,
      role: 'LIEUTENANT',
      cards: ltCards
    };

    room.gamePhase = 'NAVIGATION_LIEUTENANT_DRAW';
    room.touch();

    return {
      gamePhase: room.gamePhase,
      lieutenantId: room.lieutenantId,
      cards: ltCards,
      room
    };
  }

  /**
   * Thuyền phó chọn 1 lá giữ vào Logbook, 1 lá hủy vào Discard Pile (UC-009)
   * @param {Object} room 
   * @param {string} lieutenantToken - sessionToken của Thuyền phó
   * @param {string} keptCardId - ID lá bài Thuyền phó muốn bỏ vào Logbook
   * @returns {Object}
   */
  static lieutenantSelectCard(room, lieutenantToken, keptCardId) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (room.gamePhase !== 'NAVIGATION_LIEUTENANT_DRAW') {
      throw new Error(`Không thể chọn bài ở giai đoạn ${room.gamePhase}`);
    }

    const lieutenant = room.getPlayerByToken(lieutenantToken);
    if (!lieutenant || room.lieutenantId !== lieutenant.id) {
      throw new Error('Chỉ có Thuyền phó đương nhiệm mới có quyền chọn bài ở giai đoạn này');
    }

    const currentHand = room.navigationHand?.cards || [];
    const keptCard = currentHand.find(c => c.id === keptCardId);
    const discardedCard = currentHand.find(c => c.id !== keptCardId);

    if (!keptCard || !discardedCard) {
      throw new Error('Lá bài được chọn không hợp lệ hoặc không nằm trên tay');
    }

    // 1. Thêm lá giữ vào Logbook
    room.navigationDeck.addToLogbook(keptCard);

    // 2. Thêm lá loại vào Discard Pile (Úp)
    room.navigationDeck.discard(discardedCard);

    // 3. Xáo trộn bí mật 2 lá bài trong Logbook để che giấu nguồn gốc (AC-1 UC-010)
    room.navigationDeck.shuffleLogbook();

    const logbookCards = room.navigationDeck.logbookCards;

    room.navigationHand = {
      playerId: room.navigatorId,
      role: 'NAVIGATOR',
      cards: logbookCards
    };

    room.gamePhase = 'NAVIGATION_NAVIGATOR_DECISION';
    room.touch();

    return {
      gamePhase: room.gamePhase,
      navigatorId: room.navigatorId,
      cards: logbookCards,
      room
    };
  }

  /**
   * Hoa tiêu chốt 1 lá bài để con tàu di chuyển (UC-010)
   * @param {Object} room 
   * @param {string} navigatorToken - sessionToken của Hoa tiêu
   * @param {string} chosenCardId - ID lá bài được chọn để thực thi
   * @returns {Object}
   */
  static navigatorSelectCard(room, navigatorToken, chosenCardId) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (room.gamePhase !== 'NAVIGATION_NAVIGATOR_DECISION') {
      throw new Error(`Không thể chốt bài ở giai đoạn ${room.gamePhase}`);
    }

    const navigator = room.getPlayerByToken(navigatorToken);
    if (!navigator || room.navigatorId !== navigator.id) {
      throw new Error('Chỉ có Hoa tiêu đương nhiệm mới có quyền chốt hướng đi');
    }

    const logbookCards = room.navigationDeck?.logbookCards || [];
    const chosenCard = logbookCards.find(c => c.id === chosenCardId);
    const discardedCard = logbookCards.find(c => c.id !== chosenCardId);

    if (!chosenCard || !discardedCard) {
      throw new Error('Lá bài được chọn không hợp lệ trong Nhật ký');
    }

    // Đưa lá không chọn vào Discard Pile
    room.navigationDeck.discard(discardedCard);
    room.navigationDeck.clearLogbook();
    room.navigationHand = null;

    // Lưu lá bài vừa chọn vào ván để phục vụ BR-004 thực thi di chuyển
    room.executedNavigationCard = chosenCard;
    room.gamePhase = 'EXECUTE_ACTIONS';
    room.touch();

    return {
      gamePhase: room.gamePhase,
      chosenCard,
      discardedCardId: discardedCard.id,
      room
    };
  }

  /**
   * Hoa tiêu quyết định Tự Nhảy Tàu (Jump Overboard - UC-011)
   * @param {Object} room 
   * @param {string} navigatorToken - sessionToken của Hoa tiêu
   * @returns {Object}
   */
  static navigatorJumpOverboard(room, navigatorToken) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (room.gamePhase !== 'NAVIGATION_NAVIGATOR_DECISION') {
      throw new Error(`Không thể nhảy tàu ở giai đoạn ${room.gamePhase}`);
    }

    const navigator = room.getPlayerByToken(navigatorToken);
    if (!navigator || room.navigatorId !== navigator.id) {
      throw new Error('Chỉ có Hoa tiêu đương nhiệm mới có thể kích hoạt Nhảy tàu');
    }

    // 1. Trừng phạt nhảy tàu (AC-1 UC-011)
    navigator.status = 'ELIMINATED';
    navigator.gunCount = 0;
    navigator.publicTitles = [];
    room.navigatorId = null;

    // 2. Hủy toàn bộ bài trong Logbook vào Discard Pile mà không lật mở
    if (room.navigationDeck) {
      room.navigationDeck.discard(room.navigationDeck.logbookCards);
      room.navigationDeck.clearLogbook();
    }
    room.navigationHand = null;

    // 3. Chuyển sang chọn Hoa tiêu khẩn cấp
    room.gamePhase = 'EMERGENCY_NAVIGATOR_SELECTION';
    room.touch();

    return {
      gamePhase: room.gamePhase,
      eliminatedNavigatorId: navigator.id,
      eliminatedNavigatorName: navigator.nickname,
      captainId: room.captainId,
      room
    };
  }

  /**
   * Thuyền trưởng bổ nhiệm Hoa tiêu khẩn cấp (Emergency Navigator - UC-011)
   * Cho phép chọn cả người đang OFF_DUTY, nhưng không chọn Captain, Lieutenant, hoặc người ELIMINATED.
   * @param {Object} room 
   * @param {string} captainToken 
   * @param {string} newNavigatorId 
   * @returns {Object}
   */
  static appointEmergencyNavigator(room, captainToken, newNavigatorId) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (room.gamePhase !== 'EMERGENCY_NAVIGATOR_SELECTION') {
      throw new Error(`Không thể bổ nhiệm hoa tiêu khẩn cấp ở giai đoạn ${room.gamePhase}`);
    }

    const captain = room.getPlayerByToken(captainToken);
    if (!captain || room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng mới có quyền bổ nhiệm hoa tiêu khẩn cấp');
    }

    const targetPlayer = room.getPlayer(newNavigatorId);
    if (!targetPlayer) {
      throw new Error('Người chơi chỉ định không tồn tại');
    }

    // Ràng buộc bất biến:
    // - Không được chọn chính mình (Captain)
    if (newNavigatorId === captain.id) {
      throw new Error('Thuyền trưởng không thể tự bổ nhiệm chính mình làm Hoa tiêu khẩn cấp');
    }

    // - Không được chọn Thuyền phó hiện tại
    if (newNavigatorId === room.lieutenantId) {
      throw new Error('Thuyền phó hiện tại không thể kiêm nhiệm làm Hoa tiêu');
    }

    // - Không được chọn người đã bị loại (ELIMINATED)
    if (targetPlayer.status === 'ELIMINATED') {
      throw new Error('Không thể chọn người chơi đã bị loại khỏi ván đấu');
    }

    // Bổ nhiệm thành công (kể cả khi targetPlayer.status === 'OFF_DUTY' - AC-2 UC-011)
    room.navigatorId = newNavigatorId;
    targetPlayer.publicTitles = ['NAVIGATOR'];

    // Bắt đầu lại vòng rút bài mới ngay lập tức (Captain -> Lieut -> Nav) mà không Mutiny
    return this.startNavigation(room);
  }

  /**
   * Tự động chọn bài khi hết thời gian chờ cho người chơi đang Online (Auto-play timeout)
   * @param {Object} room 
   * @returns {Object|null}
   */
  static autoPlayTimeout(room) {
    if (!room || !room.navigationHand) return null;

    const cards = room.navigationHand.cards || [];
    if (cards.length < 2) return null;

    // Chọn ngẫu nhiên lá đầu tiên
    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    if (room.gamePhase === 'NAVIGATION_CAPTAIN_DRAW') {
      const captain = room.getPlayer(room.captainId);
      if (captain) {
        return this.captainSelectCard(room, captain.sessionToken, randomCard.id);
      }
    }

    if (room.gamePhase === 'NAVIGATION_LIEUTENANT_DRAW') {
      const lt = room.getPlayer(room.lieutenantId);
      if (lt) {
        return this.lieutenantSelectCard(room, lt.sessionToken, randomCard.id);
      }
    }

    if (room.gamePhase === 'NAVIGATION_NAVIGATOR_DECISION') {
      const nav = room.getPlayer(room.navigatorId);
      if (nav) {
        return this.navigatorSelectCard(room, nav.sessionToken, randomCard.id);
      }
    }

    return null;
  }
}

export default NavigationService;
