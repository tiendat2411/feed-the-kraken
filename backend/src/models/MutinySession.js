import { randomUUID } from 'crypto';

/**
 * ENT-003: MutinySession (Phiên Nổi Loạn)
 * Quản lý chu trình bỏ phiếu nộp súng, phân giải kết quả và chuỗi loại trừ hòa (Tie-breaker).
 */
export class MutinySession {
  /**
   * Khởi tạo phiên biểu quyết nổi loạn mới
   * @param {Object} params
   * @param {string} params.roomId - ID phòng chơi
   * @param {string} params.captainId - ID Thuyền trưởng đang bị thử thách
   * @param {number} params.playerCount - Tổng số người chơi trong phòng
   * @param {string} [params.nominatedLieutenantId] - Thuyền phó được đề xuất
   * @param {string} [params.nominatedNavigatorId] - Hoa tiêu được đề xuất
   */
  constructor({
    roomId,
    captainId,
    playerCount,
    nominatedLieutenantId = null,
    nominatedNavigatorId = null
  }) {
    this.id = randomUUID();
    this.roomId = roomId;
    this.captainId = captainId;
    this.playerCount = playerCount;
    this.nominatedLieutenantId = nominatedLieutenantId;
    this.nominatedNavigatorId = nominatedNavigatorId;

    // Ngưỡng súng thành công theo quy mô phòng
    this.requiredGuns = MutinySession.calculateRequiredGuns(playerCount);

    // Lưu trữ số súng bỏ phiếu Map<playerId, gunCount>
    this.votes = new Map();

    // Trạng thái: 'VOTING' | 'RESOLVING' | 'TIE_BREAKER' | 'COMPLETED'
    this.status = 'VOTING';

    this.isSuccess = null;
    this.winnerId = null;
    this.tieCandidates = [];
    this.currentChooser = null;
    this.eliminatedCandidates = [];
    this.createdAt = Date.now();
    this.deadline = null;
  }

  /**
   * Tính số súng tối thiểu cần thiết để lật đổ Thuyền trưởng
   * @param {number} playerCount 
   * @returns {number}
   */
  static calculateRequiredGuns(playerCount) {
    if (playerCount >= 10) return 5;
    if (playerCount >= 8) return 4;
    return 3; // 5-7 players
  }

  /**
   * Ghi nhận lượt bỏ phiếu nộp súng của người chơi
   * @param {string} playerId 
   * @param {number} gunCount 
   * @param {Object} playerObj 
   * @returns {number} Số súng hợp lệ được ghi nhận
   */
  recordVote(playerId, gunCount, playerObj) {
    if (this.status !== 'VOTING') {
      throw new Error('Phiên biểu quyết đã kết thúc hoặc đang được phân giải');
    }

    if (playerId === this.captainId) {
      throw new Error('Thuyền trưởng đương nhiệm không được quyền bỏ phiếu nổi loạn');
    }

    const availableGuns = typeof playerObj?.gunCount === 'number' ? playerObj.gunCount : 3;
    // Ràng buộc bất biến: 0 <= guns <= availableGuns
    const validGuns = Math.max(0, Math.min(Number(gunCount) || 0, availableGuns));

    this.votes.set(playerId, validGuns);
    return validGuns;
  }

  /**
   * Kiểm tra người chơi đã nộp súng chưa
   * @param {string} playerId 
   * @returns {boolean}
   */
  hasPlayerVoted(playerId) {
    return this.votes.has(playerId);
  }

  /**
   * Kiểm tra tất cả người chơi hợp lệ đã vote xong chưa
   * @param {number} eligibleVoterCount - Số lượng người vote hợp lệ (total - 1 Captain)
   * @returns {boolean}
   */
  isVotingComplete(eligibleVoterCount) {
    return this.votes.size >= eligibleVoterCount;
  }

  /**
   * Tính tổng số súng đã nộp
   * @returns {number}
   */
  getTotalGuns() {
    let total = 0;
    for (const count of this.votes.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Phân giải kết quả biểu quyết nổi loạn
   * @param {Map<string, Object>|Array<Object>} playersList - Danh sách Players trong phòng
   * @returns {Object} Kết quả phân giải
   */
  resolve(playersList) {
    this.status = 'RESOLVING';
    const totalGuns = this.getTotalGuns();
    const playersMap = Array.isArray(playersList) 
      ? new Map(playersList.map(p => [p.id, p])) 
      : playersList;

    // 1. Kiểm tra Ngưỡng thành công
    if (totalGuns < this.requiredGuns) {
      // NỔI LOẠN THẤT BẠI: Thuyền trưởng giữ nguyên vị trí, ban điều hướng nhậm chức
      this.isSuccess = false;
      this.winnerId = this.captainId;
      this.status = 'COMPLETED';
      return {
        isSuccess: false,
        totalGuns,
        requiredGuns: this.requiredGuns,
        winnerId: this.captainId,
        isTie: false,
        appointedLieutenantId: this.nominatedLieutenantId,
        appointedNavigatorId: this.nominatedNavigatorId
      };
    }

    // 2. NỔI LOẠN THÀNH CÔNG: Tìm người nộp nhiều súng nhất KHÔNG bị cắt lưỡi (speechRestricted)
    this.isSuccess = true;
    let maxGuns = -1;

    // Tìm số súng cao nhất của người chơi hợp lệ (chưa bị cắt lưỡi)
    for (const [playerId, guns] of this.votes.entries()) {
      const player = playersMap.get ? playersMap.get(playerId) : playersMap[playerId];
      if (player && !player.speechRestricted) {
        if (guns > maxGuns) {
          maxGuns = guns;
        }
      }
    }

    // Tìm danh sách ứng viên đạt maxGuns
    const topCandidates = [];
    if (maxGuns >= 0) {
      for (const [playerId, guns] of this.votes.entries()) {
        const player = playersMap.get ? playersMap.get(playerId) : playersMap[playerId];
        if (player && !player.speechRestricted && guns === maxGuns) {
          topCandidates.push(playerId);
        }
      }
    }

    // Nếu không ai hợp lệ (hoặc tất cả đều bị cắt lưỡi), fallback
    if (topCandidates.length === 0) {
      this.winnerId = this.captainId;
      this.status = 'COMPLETED';
      return {
        isSuccess: true,
        totalGuns,
        requiredGuns: this.requiredGuns,
        winnerId: this.winnerId,
        isTie: false
      };
    }

    // Luồng duy nhất 1 người cao nhất -> Trở thành Captain mới
    if (topCandidates.length === 1) {
      this.winnerId = topCandidates[0];
      this.status = 'COMPLETED';
      return {
        isSuccess: true,
        totalGuns,
        requiredGuns: this.requiredGuns,
        winnerId: this.winnerId,
        isTie: false
      };
    }

    // Luồng HÒA (Tie-breaker Chain Elimination): >= 2 người nộp bằng nhau
    this.status = 'TIE_BREAKER';
    this.tieCandidates = [...topCandidates];
    this.currentChooser = this.captainId; // Thuyền trưởng cũ là người đầu tiên chọn loại

    return {
      isSuccess: true,
      totalGuns,
      requiredGuns: this.requiredGuns,
      isTie: true,
      tieCandidates: this.tieCandidates,
      currentChooser: this.currentChooser
    };
  }

  /**
   * Xử lý một lượt loại trừ trong chuỗi Tie-breaker
   * @param {string} chooserId - Người đang thực hiện quyền loại trừ
   * @param {string} targetCandidateId - Ứng viên bị loại
   * @returns {Object}
   */
  eliminateCandidate(chooserId, targetCandidateId) {
    if (this.status !== 'TIE_BREAKER') {
      throw new Error('Hiện tại không ở trong giai đoạn phân giải hòa (Tie-breaker)');
    }

    if (chooserId !== this.currentChooser) {
      throw new Error('Bạn không có quyền loại trừ ứng viên trong lượt này');
    }

    if (!this.tieCandidates.includes(targetCandidateId)) {
      throw new Error('Ứng viên chỉ định không nằm trong danh sách hòa hoặc đã bị loại');
    }

    // Loại bỏ ứng viên khỏi danh sách hòa
    this.tieCandidates = this.tieCandidates.filter(id => id !== targetCandidateId);
    this.eliminatedCandidates.push(targetCandidateId);

    // Nếu chỉ còn 1 người duy nhất -> Người đó chiến thắng làm Captain mới
    if (this.tieCandidates.length === 1) {
      this.winnerId = this.tieCandidates[0];
      this.status = 'COMPLETED';
      this.currentChooser = null;

      return {
        completed: true,
        winnerId: this.winnerId,
        eliminatedId: targetCandidateId,
        remainingCandidates: this.tieCandidates
      };
    }

    // Nếu vẫn còn >= 2 người -> Người vừa bị loại trở thành người chọn kế tiếp
    this.currentChooser = targetCandidateId;

    return {
      completed: false,
      eliminatedId: targetCandidateId,
      nextChooser: this.currentChooser,
      remainingCandidates: this.tieCandidates
    };
  }

  /**
   * Xuất dữ liệu bảo mật cho Client
   * @param {string} [requestingPlayerId]
   * @returns {Object}
   */
  toSanitizedJSON(requestingPlayerId) {
    const isRevealed = (this.status !== 'VOTING');

    const votesList = [];
    for (const [pId, guns] of this.votes.entries()) {
      votesList.push({
        playerId: pId,
        hasVoted: true,
        guns: isRevealed || pId === requestingPlayerId ? guns : undefined
      });
    }

    return {
      id: this.id,
      roomId: this.roomId,
      captainId: this.captainId,
      status: this.status,
      requiredGuns: this.requiredGuns,
      totalGuns: isRevealed ? this.getTotalGuns() : undefined,
      votes: votesList,
      isSuccess: this.isSuccess,
      winnerId: this.winnerId,
      tieCandidates: this.tieCandidates,
      currentChooser: this.currentChooser,
      nominatedLieutenantId: this.nominatedLieutenantId,
      nominatedNavigatorId: this.nominatedNavigatorId
    };
  }

  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      captainId: this.captainId,
      playerCount: this.playerCount,
      nominatedLieutenantId: this.nominatedLieutenantId,
      nominatedNavigatorId: this.nominatedNavigatorId,
      requiredGuns: this.requiredGuns,
      votes: Array.from(this.votes.entries()),
      status: this.status,
      isSuccess: this.isSuccess,
      winnerId: this.winnerId,
      tieCandidates: this.tieCandidates,
      currentChooser: this.currentChooser,
      eliminatedCandidates: this.eliminatedCandidates,
      createdAt: this.createdAt,
      deadline: this.deadline
    };
  }

  static fromJSON(data) {
    const session = new MutinySession({
      roomId: data.roomId,
      captainId: data.captainId,
      playerCount: data.playerCount,
      nominatedLieutenantId: data.nominatedLieutenantId,
      nominatedNavigatorId: data.nominatedNavigatorId
    });

    session.id = data.id;
    session.requiredGuns = data.requiredGuns;
    session.status = data.status;
    session.isSuccess = data.isSuccess;
    session.winnerId = data.winnerId;
    session.tieCandidates = data.tieCandidates || [];
    session.currentChooser = data.currentChooser || null;
    session.eliminatedCandidates = data.eliminatedCandidates || [];
    session.createdAt = data.createdAt;
    session.deadline = data.deadline;

    if (Array.isArray(data.votes)) {
      session.votes = new Map(data.votes);
    }

    return session;
  }
}

export default MutinySession;
