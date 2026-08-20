/**
 * AutoResponder Engine: Tự động phân tích các sự kiện yêu cầu từ Server
 * và sinh phản hồi hợp lệ sau một khoảng delay ngẫu nhiên.
 */
export class AutoResponder {
  /**
   * Sinh khoảng trễ ngẫu nhiên (mili-giây)
   * @param {number} [min=500] 
   * @param {number} [max=1500] 
   * @returns {number}
   */
  static getRandomDelay(min = 500, max = 1500) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Helper sleep
   * @param {number} ms 
   * @returns {Promise<void>}
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Xử lý tự động bỏ phiếu Nổi loạn (Mutiny Voting / Loyalty Check)
   * @param {BotClient} bot 
   * @param {Object} [payload] 
   */
  static async handleMutinyVote(bot, payload) {
    // Không vote nếu là Captain
    if (bot.currentRoomState?.captainId === bot.id) return;

    // Kiểm tra xem đã vote chưa
    const session = bot.currentRoomState?.mutinySession;
    if (session) {
      const myVote = session.votes?.find(v => v.playerId === bot.id);
      if (myVote && myVote.hasVoted) return;
    }

    const maxGuns = bot.guns || 0;
    let gunsToVote = 0;

    if (maxGuns > 0) {
      // 60% khả năng vote 0 súng (ủng hộ/tiết kiệm), 30% vote 1 súng, 10% vote 2 súng
      const rand = Math.random();
      if (rand < 0.6) {
        gunsToVote = 0;
      } else if (rand < 0.9) {
        gunsToVote = Math.min(1, maxGuns);
      } else {
        gunsToVote = Math.min(2, maxGuns);
      }
    }

    await this.delay(this.getRandomDelay(600, 1800));

    if (!bot.socket || !bot.socket.connected) return;

    bot.socket.emit('submit_mutiny_vote', { gunCount: gunsToVote }, (res) => {
      if (res?.success) {
        console.log(`[Auto-Responder] [${bot.nickname}] Đã bỏ phiếu Mutiny với ${gunsToVote} súng 🔫`);
      }
    });
  }

  /**
   * Xử lý tự động khi Bot là Thuyền trưởng và cần bổ nhiệm Thuyền phó + Hoa tiêu
   * @param {BotClient} bot 
   * @param {Object} [payload] 
   */
  static async handleTeamAppointment(bot, payload) {
    const players = bot.currentRoomState?.players || [];
    const candidates = players.filter(p => p.id !== bot.id && p.status !== 'OFF_DUTY' && p.status !== 'ELIMINATED');

    if (candidates.length < 2) return;

    // Trộn ngẫu nhiên danh sách ứng viên
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const lieutenantId = shuffled[0].id;
    const navigatorId = shuffled[1].id;

    await this.delay(this.getRandomDelay(800, 2000));

    if (!bot.socket || !bot.socket.connected) return;

    bot.socket.emit('appoint_team', {
      lieutenantId,
      navigatorId
    }, (res) => {
      if (res?.success) {
        console.log(`[Auto-Responder] [${bot.nickname}] (Captain) Đã bổ nhiệm: Lt=${shuffled[0].nickname}, Nav=${shuffled[1].nickname}`);
      }
    });
  }

  /**
   * Xử lý tự động khi Bot là Thuyền trưởng và cần bấm xác nhận chuyển phase (MUTINY_REVEALED)
   * @param {BotClient} bot 
   */
  static async handleConfirmOutcome(bot) {
    if (bot.currentRoomState?.captainId !== bot.id) return;

    await this.delay(this.getRandomDelay(1200, 2500));

    if (!bot.socket || !bot.socket.connected) return;

    bot.socket.emit('confirm_mutiny_outcome', (res) => {
      if (res?.success) {
        console.log(`[Auto-Responder] [${bot.nickname}] (Captain) Đã bấm xác nhận chuyển sang phase tiếp theo ➡️`);
      }
    });
  }

  /**
   * Xử lý tự động khi Bot cần loại ứng viên hòa súng (Tie-breaker)
   * @param {BotClient} bot 
   */
  static async handleEliminateTieCandidate(bot) {
    const session = bot.currentRoomState?.mutinySession;
    if (!session || session.currentChooser !== bot.id) return;

    const candidates = (session.tieCandidates || []).filter(id => id !== bot.id);
    if (!candidates.length) return;

    const targetCandidateId = candidates[Math.floor(Math.random() * candidates.length)];

    await this.delay(this.getRandomDelay(800, 2000));

    if (!bot.socket || !bot.socket.connected) return;

    bot.socket.emit('eliminate_tie_candidate', { targetCandidateId }, (res) => {
      if (res?.success) {
        console.log(`[Auto-Responder] [${bot.nickname}] Đã loại ứng viên hòa súng [${targetCandidateId}] ⚔️`);
      }
    });
  }

  /**
   * Xử lý tự động khi Bot cần chọn / bỏ thẻ bài điều hướng
   * @param {BotClient} bot 
   * @param {Object} payload 
   */
  static async handleCardSelection(bot, payload) {
    const cards = payload?.cards || [];
    if (!cards.length) return;

    let chosenCard = cards[0];

    // Nếu bot có secret role, ưu tiên chọn màu phù hợp với mục tiêu của phe
    if (bot.secretRole === 'PIRATE') {
      chosenCard = cards.find(c => c.direction === 'RED' || c.color === 'RED') || cards[0];
    } else if (bot.secretRole === 'SAILOR') {
      chosenCard = cards.find(c => c.direction === 'BLUE' || c.color === 'BLUE') || cards[0];
    } else if (bot.secretRole === 'CULT_LEADER' || bot.secretRole === 'CULTIST') {
      chosenCard = cards.find(c => c.direction === 'YELLOW' || c.color === 'YELLOW') || cards[0];
    } else {
      chosenCard = cards[Math.floor(Math.random() * cards.length)];
    }

    await this.delay(this.getRandomDelay(700, 1600));

    if (!bot.socket || !bot.socket.connected) return;

    bot.socket.emit('select_navigation_card', {
      cardId: chosenCard.id || chosenCard
    }, (res) => {
      if (res?.success) {
        console.log(`[Auto-Responder] [${bot.nickname}] Đã chọn thẻ điều hướng [${chosenCard.direction || chosenCard}]`);
      }
    });
  }

  /**
   * Xử lý tự động khi Bot là Cult Leader thực hiện nghi thức nạp giáo đồ
   * @param {BotClient} bot 
   * @param {Object} payload 
   */
  static async handleCultConversion(bot, payload) {
    const players = bot.currentRoomState?.players || [];
    const candidates = players.filter(p => p.id !== bot.id && !p.isCultist);
    if (!candidates.length) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];

    await this.delay(this.getRandomDelay(1000, 2000));

    if (!bot.socket || !bot.socket.connected) return;

    bot.socket.emit('cult_convert', { targetId: target.id }, (res) => {
      if (res?.success) {
        console.log(`[Auto-Responder] [${bot.nickname}] (Cult Leader) Đã chọn nạp [${target.nickname}] vào Giáo phái`);
      }
    });
  }

  /**
   * Điểm tiếp nhận sự kiện trung tâm (Central Dispatcher)
   * @param {BotClient} bot 
   * @param {string} eventName 
   * @param {Object} [payload] 
   */
  static async dispatch(bot, eventName, payload = {}) {
    if (!bot.autoMode) {
      return; // Bỏ qua nếu bot đang ở chế độ điều khiển thủ công
    }

    switch (eventName) {
      case 'REQUIRE_VOTE':
      case 'MUTINY_VOTING_STARTED':
      case 'LOYALTY_CHECK':
        await this.handleMutinyVote(bot, payload);
        break;

      case 'REQUIRE_TEAM_APPOINTMENT':
      case 'APPOINT_TEAM_PHASE':
      case 'DAY_1_CREW_SELECTION':
      case 'APPOINT_TEAM':
        if (bot.id && bot.currentRoomState?.captainId === bot.id) {
          await this.handleTeamAppointment(bot, payload);
        }
        break;

      case 'MUTINY_REVEALED':
        if (bot.id && bot.currentRoomState?.captainId === bot.id) {
          await this.handleConfirmOutcome(bot);
        }
        break;

      case 'MUTINY_TIE_BREAKER':
        if (bot.id && bot.currentRoomState?.mutinySession?.currentChooser === bot.id) {
          await this.handleEliminateTieCandidate(bot);
        }
        break;

      case 'REQUIRE_CARD_DISCARD':
      case 'REQUIRE_NAVIGATION_SELECTION':
        await this.handleCardSelection(bot, payload);
        break;

      case 'REQUIRE_CULT_CONVERSION':
        if (bot.secretRole === 'CULT_LEADER') {
          await this.handleCultConversion(bot, payload);
        }
        break;

      default:
        break;
    }
  }
}

export default AutoResponder;
