import MutinySession from '../models/MutinySession.js';

/**
 * MutinyService
 * Xử lý toàn bộ logic nghiệp vụ cho BR-002:
 * 1. Bổ nhiệm ban điều hướng (Appoint Team - UC-006)
 * 2. Biểu quyết nộp súng nổi loạn (Mutiny Vote - UC-007)
 * 3. Phân giải kết quả & Trừ súng (Mutiny Resolution - UC-008)
 * 4. Chuỗi loại trừ hòa liên hoàn (Tie-breaker Chain Elimination - UC-008)
 * 5. Timer Logic & Nút xác nhận của Captain (Game Pace Logic - Constitution)
 */
export class MutinyService {
  /**
   * Thuyền trưởng đề xuất Ban điều hướng (Lieutenant & Navigator)
   * @param {Object} room - Instance Room
   * @param {string} captainToken - sessionToken của Thuyền trưởng
   * @param {string} lieutenantId - ID người được chọn làm Thuyền phó
   * @param {string} navigatorId - ID người được chọn làm Hoa tiêu
   * @returns {Object}
   */
  static appointTeam(room, captainToken, lieutenantId, navigatorId) {
    if (!room) throw new Error('Phòng không tồn tại');

    const captain = room.getPlayerByToken(captainToken);
    if (!captain) throw new Error('Người chơi không tồn tại trong phòng');

    if (room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng đương nhiệm mới có quyền bổ nhiệm ban điều hướng');
    }

    if (room.gamePhase !== 'DAY_1_CREW_SELECTION' && room.gamePhase !== 'APPOINT_TEAM') {
      throw new Error(`Không thể bổ nhiệm ban điều hướng ở giai đoạn ${room.gamePhase}`);
    }

    // 1. Kiểm tra tính hợp lệ của ứng viên
    const lieutenant = room.getPlayer(lieutenantId);
    const navigator = room.getPlayer(navigatorId);

    if (!lieutenant || !navigator) {
      throw new Error('Thuyền phó hoặc Hoa tiêu chỉ định không tồn tại');
    }

    // Ràng buộc bất biến (Invariants):
    // - Không được tự chọn bản thân Captain
    if (lieutenantId === captain.id || navigatorId === captain.id) {
      throw new Error('Thuyền trưởng không thể tự bổ nhiệm chính mình vào Ban điều hướng');
    }

    // - Thuyền phó và Hoa tiêu không được trùng nhau
    if (lieutenantId === navigatorId) {
      throw new Error('Thuyền phó và Hoa tiêu không thể là cùng một người');
    }

    // - Người có status OFF_DUTY hoặc ELIMINATED không được bổ nhiệm
    if (lieutenant.status === 'OFF_DUTY' || lieutenant.status === 'ELIMINATED') {
      throw new Error(`Không thể chọn ${lieutenant.nickname} vì đang ở trạng thái ${lieutenant.status}`);
    }
    if (navigator.status === 'OFF_DUTY' || navigator.status === 'ELIMINATED') {
      throw new Error(`Không thể chọn ${navigator.nickname} vì đang ở trạng thái ${navigator.status}`);
    }

    // 2. Kiểm tra kho súng toàn phòng (Alternative Flow 1a - UC-007)
    // Nếu ngoại trừ Captain, không ai có súng (tất cả gunCount === 0), tự động thông qua Ban điều hướng
    const nonCaptainPlayers = room.getPlayers().filter(p => p.id !== captain.id && p.status !== 'ELIMINATED');
    const totalGunsAvailable = nonCaptainPlayers.reduce((sum, p) => sum + (p.gunCount || 0), 0);

    if (totalGunsAvailable === 0) {
      // Auto-skip Mutiny Vote, chính thức nhậm chức và chuyển sang Điều hướng
      room.nominatedLieutenantId = null;
      room.nominatedNavigatorId = null;
      room.lieutenantId = lieutenantId;
      room.navigatorId = navigatorId;
      room.mutinySession = null;
      room.phaseDeadline = null;

      // Cập nhật chức danh công khai
      this.updateOfficerTitles(room, room.captainId, lieutenantId, navigatorId);

      room.gamePhase = 'NAVIGATION';
      room.touch();

      return {
        autoSkipped: true,
        reason: 'NO_GUNS_AVAILABLE',
        lieutenantId,
        navigatorId,
        gamePhase: room.gamePhase,
        room
      };
    }

    // 3. Khởi tạo phiên biểu quyết nổi loạn (Normal Flow)
    room.nominatedLieutenantId = lieutenantId;
    room.nominatedNavigatorId = navigatorId;

    const mutinySession = new MutinySession({
      roomId: room.id,
      captainId: captain.id,
      playerCount: room.getPlayers().length,
      nominatedLieutenantId: lieutenantId,
      nominatedNavigatorId: navigatorId
    });

    room.mutinySession = mutinySession;
    room.gamePhase = 'LOYALTY_CHECK';

    // Cập nhật timer: Chỉ đếm ngược khi có người rớt mạng (Constitution Rule)
    this.updateVotingDeadline(room);
    room.touch();

    return {
      autoSkipped: false,
      session: mutinySession,
      nominatedLieutenantId: lieutenantId,
      nominatedNavigatorId: navigatorId,
      gamePhase: room.gamePhase,
      phaseDeadline: room.phaseDeadline,
      room
    };
  }

  /**
   * Người chơi nộp súng biểu quyết (Loyalty Check / Mutiny Vote)
   * @param {Object} room - Instance Room
   * @param {string} voterToken - sessionToken của người bỏ phiếu
   * @param {number} gunCount - Số súng muốn nộp
   * @returns {Object}
   */
  static submitVote(room, voterToken, gunCount) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (!room.mutinySession || room.mutinySession.status !== 'VOTING') {
      throw new Error('Hiện không có phiên biểu quyết nổi loạn nào đang mở');
    }

    const voter = room.getPlayerByToken(voterToken);
    if (!voter) throw new Error('Người chơi không tồn tại trong phòng');

    if (voter.id === room.captainId) {
      throw new Error('Thuyền trưởng không được phép tham gia bỏ phiếu nổi loạn');
    }

    if (voter.status === 'ELIMINATED') {
      throw new Error('Người chơi đã bị loại không thể tham gia biểu quyết');
    }

    const recordedGuns = room.mutinySession.recordVote(voter.id, gunCount, voter);

    // Tính số người vote hợp lệ (tất cả người chơi trừ Captain và ELIMINATED)
    const eligibleVoters = room.getPlayers().filter(p => p.id !== room.captainId && p.status !== 'ELIMINATED');
    const isVotingComplete = room.mutinySession.isVotingComplete(eligibleVoters.length);

    this.updateVotingDeadline(room);
    room.touch();

    return {
      voterId: voter.id,
      voterName: voter.nickname,
      recordedGuns,
      isVotingComplete,
      votedCount: room.mutinySession.votes.size,
      totalEligible: eligibleVoters.length,
      session: room.mutinySession
    };
  }

  /**
   * Phân giải kết quả biểu quyết nổi loạn
   * Dừng lại ở phase 'MUTINY_REVEALED' để người chơi thảo luận trước khi Captain bấm xác nhận
   * @param {Object} room - Instance Room
   * @returns {Object}
   */
  static resolveMutiny(room) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (!room.mutinySession) {
      throw new Error('Không có phiên nổi loạn nào để phân giải');
    }

    const session = room.mutinySession;
    const resolution = session.resolve(room.players);
    room.phaseDeadline = null; // Tắt timer khi đã có kết quả

    // 1. Phân giải NỔI LOẠN THÀNH CÔNG
    if (resolution.isSuccess) {
      // Trừ súng của những người đã nộp súng > 0 (AC-1)
      const deductedPlayers = [];
      for (const [playerId, guns] of session.votes.entries()) {
        if (guns > 0) {
          const player = room.getPlayer(playerId);
          if (player) {
            player.gunCount = Math.max(0, (player.gunCount || 0) - guns);
            deductedPlayers.push({
              playerId: player.id,
              nickname: player.nickname,
              gunsDeducted: guns,
              newGunCount: player.gunCount
            });
          }
        }
      }

      // 1a. Thành công đơn nhất (Không hòa)
      if (!resolution.isTie) {
        const newCaptainId = resolution.winnerId;
        room.captainId = newCaptainId;

        // Cập nhật chức danh: Xóa mọi chức vụ cũ, chỉ định Captain mới
        this.updateOfficerTitles(room, newCaptainId, null, null);

        // Dừng lại ở MUTINY_REVEALED để Thuyền trưởng mới xem kết quả và bấm xác nhận
        room.gamePhase = 'MUTINY_REVEALED';
        room.touch();

        return {
          isSuccess: true,
          isTie: false,
          newCaptainId,
          totalGuns: resolution.totalGuns,
          requiredGuns: resolution.requiredGuns,
          deductedPlayers,
          gamePhase: room.gamePhase,
          session: session.toSanitizedJSON()
        };
      }

      // 1b. Thành công nhưng HÒA (Tie-breaker Chain Elimination)
      room.gamePhase = 'MUTINY_TIE_BREAKER';
      this.updateTieBreakerDeadline(room);
      room.touch();

      return {
        isSuccess: true,
        isTie: true,
        tieCandidates: resolution.tieCandidates,
        currentChooser: resolution.currentChooser,
        totalGuns: resolution.totalGuns,
        requiredGuns: resolution.requiredGuns,
        deductedPlayers,
        gamePhase: room.gamePhase,
        phaseDeadline: room.phaseDeadline,
        session: session.toSanitizedJSON()
      };
    }

    // 2. Phân giải NỔI LOẠN THẤT BẠI
    // Không ai bị trừ súng (AC-2). Ban điều hướng đề xuất chính thức nhậm chức.
    room.lieutenantId = session.nominatedLieutenantId;
    room.navigatorId = session.nominatedNavigatorId;

    // Cập nhật chức danh công khai
    this.updateOfficerTitles(room, room.captainId, room.lieutenantId, room.navigatorId);

    // Dừng lại ở MUTINY_REVEALED để Captain cũ xác nhận chuyển sang Điều hướng
    room.gamePhase = 'MUTINY_REVEALED';
    room.touch();

    return {
      isSuccess: false,
      isTie: false,
      captainId: room.captainId,
      appointedLieutenantId: room.lieutenantId,
      appointedNavigatorId: room.navigatorId,
      totalGuns: resolution.totalGuns,
      requiredGuns: resolution.requiredGuns,
      deductedPlayers: [],
      gamePhase: room.gamePhase,
      session: session.toSanitizedJSON()
    };
  }

  /**
   * Thuyền trưởng (hoặc Tân Thuyền trưởng) bấm nút xác nhận chuyển sang phase kế tiếp
   * (Tuân thủ nguyên tắc Game Pace & Captain Button trong Constitution)
   * @param {Object} room - Instance Room
   * @param {string} captainToken - sessionToken của Thuyền trưởng
   * @returns {Object}
   */
  static confirmMutinyOutcome(room, captainToken) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (room.gamePhase !== 'MUTINY_REVEALED') {
      throw new Error('Hiện tại không ở màn hình kết quả biểu quyết');
    }

    const caller = room.getPlayerByToken(captainToken);
    if (!caller) throw new Error('Người chơi không tồn tại');

    if (room.captainId !== caller.id) {
      throw new Error('Chỉ có Thuyền trưởng mới có quyền xác nhận chuyển tiếp hành trình');
    }

    const isMutinySuccess = room.mutinySession?.isSuccess;

    if (isMutinySuccess) {
      // Nổi loạn thành công -> Tân Thuyền trưởng bắt đầu chọn Ban điều hướng mới
      room.nominatedLieutenantId = null;
      room.nominatedNavigatorId = null;
      room.lieutenantId = null;
      room.navigatorId = null;
      room.mutinySession = null;
      room.phaseDeadline = null;
      room.gamePhase = 'APPOINT_TEAM';
      room.touch();

      return {
        nextPhase: 'APPOINT_TEAM',
        captainId: room.captainId,
        room
      };
    } else {
      // Nổi loạn thất bại -> Chuyển sang giai đoạn Điều hướng chính thức (BR-003)
      room.nominatedLieutenantId = null;
      room.nominatedNavigatorId = null;
      room.mutinySession = null;
      room.phaseDeadline = null;
      room.gamePhase = 'NAVIGATION';
      room.touch();

      return {
        nextPhase: 'NAVIGATION',
        captainId: room.captainId,
        lieutenantId: room.lieutenantId,
        navigatorId: room.navigatorId,
        room
      };
    }
  }

  /**
   * Thực hiện một lượt loại trừ trong chuỗi hòa (Tie-breaker)
   * @param {Object} room - Instance Room
   * @param {string} chooserToken - sessionToken của người đang có quyền loại trừ
   * @param {string} targetCandidateId - ID người bị loại
   * @returns {Object}
   */
  static eliminateTieCandidate(room, chooserToken, targetCandidateId) {
    if (!room) throw new Error('Phòng không tồn tại');

    if (!room.mutinySession || room.mutinySession.status !== 'TIE_BREAKER') {
      throw new Error('Hiện không có phiên hòa (Tie-breaker) nào đang diễn ra');
    }

    const chooser = room.getPlayerByToken(chooserToken);
    if (!chooser) throw new Error('Người chơi không tồn tại trong phòng');

    const session = room.mutinySession;
    const stepResult = session.eliminateCandidate(chooser.id, targetCandidateId);

    // Nếu đã hoàn tất (chỉ còn 1 người duy nhất)
    if (stepResult.completed) {
      const newCaptainId = stepResult.winnerId;
      room.captainId = newCaptainId;

      this.updateOfficerTitles(room, newCaptainId, null, null);

      // Chuyển sang MUTINY_REVEALED để hiển thị kết quả và chờ Tân Captain xác nhận
      room.gamePhase = 'MUTINY_REVEALED';
      room.phaseDeadline = null;
      room.touch();

      return {
        completed: true,
        newCaptainId,
        eliminatedId: targetCandidateId,
        gamePhase: room.gamePhase,
        session: session.toSanitizedJSON()
      };
    }

    // Nếu vẫn còn >= 2 người -> Chuyển lượt loại trừ tiếp theo
    this.updateTieBreakerDeadline(room);
    room.touch();
    return {
      completed: false,
      eliminatedId: targetCandidateId,
      nextChooserId: stepResult.nextChooser,
      remainingCandidates: stepResult.remainingCandidates,
      gamePhase: room.gamePhase,
      phaseDeadline: room.phaseDeadline,
      session: session.toSanitizedJSON()
    };
  }

  /**
   * Tự động hoàn tất lượt cho người chơi rớt mạng khi hết timer (Time-out Logic - Constitution)
   * @param {Object} room
   * @returns {Object|null}
   */
  static autoResolveOfflineVoters(room) {
    if (!room || !room.mutinySession) return null;

    if (room.mutinySession.status === 'VOTING') {
      const eligibleVoters = room.getPlayers().filter(p => p.id !== room.captainId && p.status !== 'ELIMINATED');
      let autoVoted = false;

      for (const player of eligibleVoters) {
        if (!room.mutinySession.hasPlayerVoted(player.id) && player.connectionStatus === 'OFFLINE') {
          room.mutinySession.recordVote(player.id, 0, player);
          autoVoted = true;
        }
      }

      if (autoVoted && room.mutinySession.isVotingComplete(eligibleVoters.length)) {
        return this.resolveMutiny(room);
      }
    }

    if (room.mutinySession.status === 'TIE_BREAKER') {
      const chooserId = room.mutinySession.currentChooser;
      const chooser = room.getPlayer(chooserId);

      if (chooser && chooser.connectionStatus === 'OFFLINE') {
        // Chọn ngẫu nhiên 1 ứng viên khác trong danh sách hòa để loại
        const candidates = room.mutinySession.tieCandidates;
        const target = candidates.find(id => id !== chooserId) || candidates[0];
        return this.eliminateTieCandidate(room, chooser.sessionToken, target);
      }
    }

    return null;
  }

  /**
   * Cập nhật thời hạn biểu quyết (Chỉ đếm 90s khi có người rớt mạng)
   * @private
   */
  static updateVotingDeadline(room) {
    if (!room || !room.mutinySession || room.mutinySession.status !== 'VOTING') {
      room.phaseDeadline = null;
      return;
    }

    const eligibleVoters = room.getPlayers().filter(p => p.id !== room.captainId && p.status !== 'ELIMINATED');
    const hasOfflineUnvoted = eligibleVoters.some(p => !room.mutinySession.hasPlayerVoted(p.id) && p.connectionStatus === 'OFFLINE');

    if (hasOfflineUnvoted) {
      if (!room.phaseDeadline) {
        room.phaseDeadline = Date.now() + 90000; // 90s đếm ngược cho người offline
      }
    } else {
      room.phaseDeadline = null; // Tất cả online -> Thời gian tự do
    }
  }

  /**
   * Cập nhật thời hạn tie-breaker (Chỉ đếm 120s khi người đang chọn bị offline)
   * @private
   */
  static updateTieBreakerDeadline(room) {
    if (!room || !room.mutinySession || room.mutinySession.status !== 'TIE_BREAKER') {
      room.phaseDeadline = null;
      return;
    }

    const chooser = room.getPlayer(room.mutinySession.currentChooser);
    if (chooser && chooser.connectionStatus === 'OFFLINE') {
      room.phaseDeadline = Date.now() + 120000; // 120s đếm ngược
    } else {
      room.phaseDeadline = null;
    }
  }

  /**
   * Áp dụng hiệu ứng Cắt Lưỡi (Off with the tongue)
   * Người bị cắt lưỡi vĩnh viễn không bao giờ được làm Captain (nhưng vẫn được nộp súng).
   * @param {Object} room
   * @param {string} captainToken - sessionToken của người ra quyết định (Thuyền trưởng)
   * @param {string} targetPlayerId - ID người bị cắt lưỡi
   * @returns {Object}
   */
  static applyCutTongue(room, captainToken, targetPlayerId) {
    if (!room) throw new Error('Phòng không tồn tại');

    const captain = room.getPlayerByToken(captainToken);
    if (!captain) throw new Error('Người chơi không tồn tại');

    if (room.captainId !== captain.id) {
      throw new Error('Chỉ có Thuyền trưởng đương nhiệm mới có quyền ra lệnh Cắt Lưỡi');
    }

    const targetPlayer = room.getPlayer(targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Người chơi chỉ định không tồn tại trong phòng');
    }

    if (targetPlayer.id === captain.id) {
      throw new Error('Thuyền trưởng không thể tự cắt lưỡi chính mình');
    }

    targetPlayer.speechRestricted = true;
    room.touch();

    return {
      success: true,
      targetId: targetPlayer.id,
      targetName: targetPlayer.nickname,
      speechRestricted: true,
      room
    };
  }

  /**
   * Cập nhật danh sách publicTitles của các thuyền viên
   * @private
   */
  static updateOfficerTitles(room, captainId, lieutenantId, navigatorId) {
    for (const player of room.getPlayers()) {
      const titles = [];
      if (player.id === captainId) titles.push('CAPTAIN');
      if (player.id === lieutenantId) titles.push('LIEUTENANT');
      if (player.id === navigatorId) titles.push('NAVIGATOR');
      player.publicTitles = titles;
    }
  }
}

export default MutinyService;
