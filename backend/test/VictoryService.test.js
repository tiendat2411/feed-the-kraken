import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { VictoryService } from '../src/services/VictoryService.js';
import { Room } from '../src/models/Room.js';
import { Player } from '../src/models/Player.js';
import { MapBoard } from '../src/models/MapBoard.js';

describe('BR-005: VictoryService Flow & Invariants (UC-017)', () => {
  function setupTestRoom(shipPosition = 'START') {
    const room = new Room({ id: 'ROOM_VIC_TEST', hostId: 'p1', mapType: 'QUICK_JOURNEY' });

    const p1 = new Player({ id: 'p1', nickname: 'Alice', sessionToken: 'tok1' });
    p1.factionRole = 'SAILOR';

    const p2 = new Player({ id: 'p2', nickname: 'Bob', sessionToken: 'tok2' });
    p2.factionRole = 'PIRATE';

    const p3 = new Player({ id: 'p3', nickname: 'Cult Leader Charlie', sessionToken: 'tok3' });
    p3.factionRole = 'CULT_LEADER';

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);

    room.status = 'IN_GAME';
    room.gamePhase = 'NAVIGATION';
    room.mapBoard = new MapBoard({
      roomId: room.id,
      mapMode: 'QUICK_JOURNEY',
      shipPosition
    });

    return { room, p1, p2, p3 };
  }

  test('AC-1: Bỏ qua Jump Overboard - Cult Leader tự nhảy tàu không kích hoạt thắng cho phe Cult', () => {
    const { p3 } = setupTestRoom();
    p3.status = 'ELIMINATED';
    p3.eliminationReason = 'JUMPED_OVERBOARD';

    const result = VictoryService.checkEliminationVictory(p3, 'JUMPED_OVERBOARD');

    assert.equal(result.isGameOver, false);
    assert.equal(result.winningFaction, null);
    assert.equal(result.winReason, null);
  });

  test('AC-2: Cán đích Bluewater Bay (Phía Đông) -> Phe Thủy thủ (SAILOR) chiến thắng', () => {
    const { room } = setupTestRoom('Q_R7_C6');

    const result = VictoryService.checkVictory(room);

    assert.equal(result.isGameOver, true);
    assert.equal(result.winningFaction, 'SAILOR');
    assert.equal(result.winReason, 'SHIP_REACHED_SAILOR_DESTINATION');
  });

  test('AC-2: Cán đích Crimson Cove (Phía Tây) -> Phe Hải tặc (PIRATE) chiến thắng', () => {
    const { room } = setupTestRoom('Q_R7_C0');

    const result = VictoryService.checkVictory(room);

    assert.equal(result.isGameOver, true);
    assert.equal(result.winningFaction, 'PIRATE');
    assert.equal(result.winReason, 'SHIP_REACHED_PIRATE_DESTINATION');
  });

  test('AC-2: Cán đích Hang ổ Kraken (Phía Bắc) -> Phe Tà giáo (CULT) chiến thắng', () => {
    const { room } = setupTestRoom('Q_R10_C3');

    const result = VictoryService.checkVictory(room);

    assert.equal(result.isGameOver, true);
    assert.equal(result.winningFaction, 'CULT');
    assert.equal(result.winReason, 'SHIP_REACHED_CULT_DESTINATION');
  });

  test('Hiến tế Cult Leader qua FEED_THE_KRAKEN -> Phe Tà giáo (CULT) chiến thắng ngay lập tức', () => {
    const { room, p3 } = setupTestRoom('Q_R1_C2');
    p3.status = 'ELIMINATED';
    p3.eliminationReason = 'FEED_THE_KRAKEN';

    const result = VictoryService.checkVictory(room);

    assert.equal(result.isGameOver, true);
    assert.equal(result.winningFaction, 'CULT');
    assert.equal(result.winReason, 'CULT_LEADER_SACRIFICED_TO_KRAKEN');
    assert.equal(result.cultLeaderId, p3.id);
  });

  test('Hiến tế người không phải Cult Leader (Sailor / Pirate) -> Game tiếp tục bình thường', () => {
    const { room, p1 } = setupTestRoom('Q_R1_C2');
    p1.status = 'ELIMINATED';
    p1.eliminationReason = 'FEED_THE_KRAKEN';

    const result = VictoryService.checkVictory(room);

    assert.equal(result.isGameOver, false);
    assert.equal(result.winningFaction, null);
  });

  test('Trạng thái đang đi bình thường giữa biển -> Không có phe nào thắng', () => {
    const { room } = setupTestRoom('Q_R1_C2');

    const result = VictoryService.checkVictory(room);

    assert.equal(result.isGameOver, false);
    assert.equal(result.winningFaction, null);
  });

  test('Validation / Defensive Programming: Ném lỗi khi gọi hàm không truyền phòng', () => {
    assert.throws(() => {
      VictoryService.checkVictory(null);
    }, /Phòng không tồn tại/);
  });
});
