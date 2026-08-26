/**
 * OffDutyService (BR-005 / UC-016)
 * Quản lý chu trình hoán đổi thẻ Nghỉ Phép (Off-Duty Shift) sau mỗi vòng điều hướng thành công,
 * thu hồi thẻ cũ, phân bổ thẻ mới theo quy mô Lobby Size và khởi tạo vòng chơi mới (APPOINT_TEAM).
 */
export class OffDutyService {
  /**
   * Thực hiện hoán đổi ca trực Off-Duty khi kết thúc một vòng điều hướng (UC-016)
   * @param {Object} room - Instance Room hiện tại
   * @returns {Object} Kết quả hoán đổi ca trực
   */
  static shiftOffDuty(room) {
    if (!room) {
      throw new Error('Phòng không tồn tại');
    }

    if (room.status !== 'IN_GAME') {
      throw new Error(`Không thể hoán đổi ca trực khi phòng ở trạng thái ${room.status}`);
    }

    if (room.gamePhase !== 'ROUND_END') {
      throw new Error(`Chỉ có thể hoán đổi ca trực ở giai đoạn ROUND_END, hiện tại là: ${room.gamePhase}`);
    }

    const allPlayers = room.getPlayers();
    const lobbySize = allPlayers.length;

    // Xác định thành viên Ban điều hướng đã phục vụ vòng vừa qua
    const lastCaptainId = room.captainId;
    const lastLieutenantId = room.lieutenantId || room.nominatedLieutenantId;
    const lastNavigatorId = room.navigatorId || room.nominatedNavigatorId;

    // 1. Thu hồi thẻ cũ (CLEAR_OLD - AC-1): Phục hồi những người đang OFF_DUTY về ACTIVE
    const newlyActivePlayerIds = [];
    allPlayers.forEach(player => {
      if (player.status === 'OFF_DUTY') {
        player.status = 'ACTIVE';
        newlyActivePlayerIds.push(player.id);
      }
    });

    // 2. Phân bổ thẻ mới (ASSIGN_NEW - AC-2):
    // - 5-6 người: Chỉ Navigator bị OFF_DUTY
    // - 7-8 người: Navigator + Lieutenant bị OFF_DUTY
    // - 9-11 người: Captain + Lieutenant + Navigator đều bị OFF_DUTY
    const targetOffDutyIds = [];

    if (lobbySize >= 9) {
      if (lastCaptainId) targetOffDutyIds.push(lastCaptainId);
      if (lastLieutenantId) targetOffDutyIds.push(lastLieutenantId);
      if (lastNavigatorId) targetOffDutyIds.push(lastNavigatorId);
    } else if (lobbySize >= 7) {
      if (lastLieutenantId) targetOffDutyIds.push(lastLieutenantId);
      if (lastNavigatorId) targetOffDutyIds.push(lastNavigatorId);
    } else {
      // 5-6 players
      if (lastNavigatorId) targetOffDutyIds.push(lastNavigatorId);
    }

    const newlyOffDutyPlayerIds = [];
    targetOffDutyIds.forEach(targetId => {
      const player = room.getPlayer(targetId);
      // Không gán OFF_DUTY cho người đã bị loại khỏi cuộc chơi (ELIMINATED)
      if (player && player.status !== 'ELIMINATED') {
        player.status = 'OFF_DUTY';
        newlyOffDutyPlayerIds.push(player.id);
      }
    });

    // 3. Xóa bỏ danh hiệu chức vụ vòng cũ (chỉ giữ lại danh hiệu CAPTAIN cho Thuyền trưởng)
    allPlayers.forEach(player => {
      player.publicTitles = player.publicTitles.filter(t => t === 'CAPTAIN');
    });

    // 4. Reset trạng thái tạm của vòng vừa kết thúc và chuyển về pha APPOINT_TEAM
    room.nominatedLieutenantId = null;
    room.nominatedNavigatorId = null;
    room.lieutenantId = null;
    room.navigatorId = null;
    room.mutinySession = null;
    room.executedNavigationCard = null;
    room.pendingMapAction = null;
    room.lastMapActionResult = null;
    room.pendingCardAction = null;
    room.lastCardActionResult = null;
    room.pendingMermaidInspection = null;
    room.pendingTelescopeInspection = null;
    room.pendingCultRitual = null;
    room.navigationHand = null;

    room.gamePhase = 'APPOINT_TEAM';
    room.touch();

    return {
      newlyActivePlayerIds,
      newlyOffDutyPlayerIds,
      nextPhase: 'APPOINT_TEAM',
      room
    };
  }
}

export default OffDutyService;
