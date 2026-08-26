import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OffDutyService } from '../src/services/OffDutyService.js';
import { Room } from '../src/models/Room.js';
import { Player } from '../src/models/Player.js';

describe('BR-005: OffDutyService Flow & Invariants (UC-016)', () => {
  function createTestRoom(playerCount = 5) {
    const room = new Room({ id: 'ROOM_OFFDUTY_TEST', hostId: 'p1', mapType: 'QUICK_JOURNEY' });

    for (let i = 1; i <= playerCount; i++) {
      const p = new Player({ id: `p${i}`, nickname: `Player_${i}`, sessionToken: `tok_${i}` });
      p.status = 'ACTIVE';
      room.addPlayer(p);
    }

    room.status = 'IN_GAME';
    room.gamePhase = 'ROUND_END';
    room.captainId = 'p1';
    room.lieutenantId = 'p2';
    room.navigatorId = 'p3';

    room.getPlayer('p1').publicTitles = ['CAPTAIN'];
    room.getPlayer('p2').publicTitles = ['LIEUTENANT'];
    room.getPlayer('p3').publicTitles = ['NAVIGATOR'];

    return room;
  }

  test('AC-1: Thu hồi thẻ OFF_DUTY cũ và phân bổ cho Navigator ở phòng 5 người', () => {
    const room = createTestRoom(5);
    const p4 = room.getPlayer('p4');
    p4.status = 'OFF_DUTY'; // p4 nghỉ phép từ vòng trước

    const result = OffDutyService.shiftOffDuty(room);

    assert.equal(result.nextPhase, 'APPOINT_TEAM');
    assert.equal(room.gamePhase, 'APPOINT_TEAM');

    // p4 được phục hồi về ACTIVE
    assert.equal(p4.status, 'ACTIVE');
    assert.ok(result.newlyActivePlayerIds.includes('p4'));

    // p3 (Navigator vừa rồi) bị chuyển thành OFF_DUTY
    const p3 = room.getPlayer('p3');
    assert.equal(p3.status, 'OFF_DUTY');
    assert.ok(result.newlyOffDutyPlayerIds.includes('p3'));

    // p1 (Captain) và p2 (Lieutenant) vẫn ACTIVE
    assert.equal(room.getPlayer('p1').status, 'ACTIVE');
    assert.equal(room.getPlayer('p2').status, 'ACTIVE');
  });

  test('AC-2: Phân bổ đúng theo quy mô phòng 7-8 người (Navigator + Lieutenant)', () => {
    const room = createTestRoom(8);

    const result = OffDutyService.shiftOffDuty(room);

    // p2 (Lieutenant) và p3 (Navigator) bị OFF_DUTY
    assert.equal(room.getPlayer('p2').status, 'OFF_DUTY');
    assert.equal(room.getPlayer('p3').status, 'OFF_DUTY');
    assert.ok(result.newlyOffDutyPlayerIds.includes('p2'));
    assert.ok(result.newlyOffDutyPlayerIds.includes('p3'));

    // p1 (Captain) vẫn ACTIVE
    assert.equal(room.getPlayer('p1').status, 'ACTIVE');
    assert.ok(!result.newlyOffDutyPlayerIds.includes('p1'));
  });

  test('AC-2: Phân bổ đúng theo quy mô phòng 9-11 người (Captain + Lieutenant + Navigator)', () => {
    const room = createTestRoom(10);

    const result = OffDutyService.shiftOffDuty(room);

    // Cả 3 người đều bị OFF_DUTY
    assert.equal(room.getPlayer('p1').status, 'OFF_DUTY');
    assert.equal(room.getPlayer('p2').status, 'OFF_DUTY');
    assert.equal(room.getPlayer('p3').status, 'OFF_DUTY');

    assert.ok(result.newlyOffDutyPlayerIds.includes('p1'));
    assert.ok(result.newlyOffDutyPlayerIds.includes('p2'));
    assert.ok(result.newlyOffDutyPlayerIds.includes('p3'));

    // Invariant: Captain vẫn giữ danh hiệu CAPTAIN
    assert.equal(room.captainId, 'p1');
    assert.ok(room.getPlayer('p1').publicTitles.includes('CAPTAIN'));
  });

  test('E2: Emergency Navigator - Người thay thế bị phạt OFF_DUTY, người bị ELIMINATED không đổi trạng thái', () => {
    const room = createTestRoom(6);
    
    // p3 (cựu Navigator) đã nhảy tàu
    const p3 = room.getPlayer('p3');
    p3.status = 'ELIMINATED';

    // p4 được bổ nhiệm làm Emergency Navigator
    room.navigatorId = 'p4';
    const p4 = room.getPlayer('p4');
    p4.publicTitles = ['NAVIGATOR'];

    const result = OffDutyService.shiftOffDuty(room);

    // p4 (Emergency Navigator) bị OFF_DUTY
    assert.equal(p4.status, 'OFF_DUTY');
    assert.ok(result.newlyOffDutyPlayerIds.includes('p4'));

    // p3 vẫn giữ nguyên ELIMINATED
    assert.equal(p3.status, 'ELIMINATED');
  });

  test('Invariants & State Clean-up: Reset sạch sẽ các trạng thái tạm và chức vụ cũ', () => {
    const room = createTestRoom(5);
    room.executedNavigationCard = { color: 'RED', action: 'DRUNK' };
    room.lastCardActionResult = { actionType: 'DRUNK', publicMessage: 'Say xỉn' };
    room.mutinySession = { id: 'ms_01' };

    OffDutyService.shiftOffDuty(room);

    assert.equal(room.lieutenantId, null);
    assert.equal(room.navigatorId, null);
    assert.equal(room.nominatedLieutenantId, null);
    assert.equal(room.nominatedNavigatorId, null);
    assert.equal(room.executedNavigationCard, null);
    assert.equal(room.lastCardActionResult, null);
    assert.equal(room.mutinySession, null);

    // Lieutenant và Navigator mất chức danh, Captain giữ chức danh
    assert.deepEqual(room.getPlayer('p1').publicTitles, ['CAPTAIN']);
    assert.deepEqual(room.getPlayer('p2').publicTitles, []);
    assert.deepEqual(room.getPlayer('p3').publicTitles, []);
  });

  test('Defensive Programming: Throw lỗi khi gọi sai trạng thái hoặc phòng không hợp lệ', () => {
    const room = createTestRoom(5);

    // Throw khi không có room
    assert.throws(() => {
      OffDutyService.shiftOffDuty(null);
    }, /Phòng không tồn tại/);

    // Throw khi status !== IN_GAME
    room.status = 'LOBBY';
    assert.throws(() => {
      OffDutyService.shiftOffDuty(room);
    }, /Không thể hoán đổi ca trực/);

    // Throw khi gamePhase !== ROUND_END
    room.status = 'IN_GAME';
    room.gamePhase = 'NAVIGATION';
    assert.throws(() => {
      OffDutyService.shiftOffDuty(room);
    }, /Chỉ có thể hoán đổi ca trực ở giai đoạn ROUND_END/);
  });
});
