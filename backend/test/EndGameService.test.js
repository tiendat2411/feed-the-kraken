import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EndGameService } from '../src/services/EndGameService.js';
import { Room } from '../src/models/Room.js';
import { Player } from '../src/models/Player.js';
import { MapBoard } from '../src/models/MapBoard.js';

describe('BR-005: EndGameService Flow & Invariants (UC-018)', () => {
  function setupTestRoom() {
    const room = new Room({ id: 'ROOM_END_TEST', hostId: 'p1', mapType: 'QUICK_JOURNEY' });

    const p1 = new Player({ id: 'p1', nickname: 'Host Alice', sessionToken: 'tok1' });
    p1.factionRole = 'SAILOR';
    p1.initialFactionRole = 'SAILOR';
    p1.publicTitles = ['CAPTAIN'];
    p1.gunCount = 2;

    const p2 = new Player({ id: 'p2', nickname: 'Pirate Bob', sessionToken: 'tok2' });
    p2.factionRole = 'PIRATE';
    p2.initialFactionRole = 'PIRATE';
    p2.publicTitles = ['LIEUTENANT'];
    p2.gunCount = 1;

    const p3 = new Player({ id: 'p3', nickname: 'Cult Leader Charlie', sessionToken: 'tok3' });
    p3.factionRole = 'CULT_LEADER';
    p3.initialFactionRole = 'CULT_LEADER';
    p3.speechRestricted = true;

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);

    room.status = 'IN_GAME';
    room.gamePhase = 'EXECUTE_ACTIONS';
    room.captainId = 'p1';
    room.lieutenantId = 'p2';
    room.navigatorId = 'p3';
    room.pendingMapAction = { type: 'CABIN_SEARCH' };
    room.phaseDeadline = Date.now() + 60000;

    room.mapBoard = new MapBoard({
      roomId: room.id,
      mapMode: 'QUICK_JOURNEY',
      shipPosition: 'Q_R7_C6'
    });

    return { room, p1, p2, p3 };
  }

  test('AC-1: endGame đóng băng toàn bộ Game State và tạo GameResult đầy đủ', () => {
    const { room } = setupTestRoom();

    const result = EndGameService.endGame(room, 'SAILOR', 'SHIP_REACHED_SAILOR_DESTINATION');

    assert.equal(result.isGameOver, true);
    assert.equal(result.winningFaction, 'SAILOR');
    assert.equal(room.status, 'FINISHED');
    assert.equal(room.gamePhase, 'END_GAME');
    assert.equal(room.winnerFaction, 'SAILOR');
    assert.equal(room.winReason, 'SHIP_REACHED_SAILOR_DESTINATION');
    assert.equal(room.phaseDeadline, null);
    assert.equal(room.pendingMapAction, null);

    // Kiểm tra GameResult được tạo và đính kèm
    assert.ok(room.gameResult);
    assert.equal(room.gameResult.winningFaction, 'SAILOR');
    assert.equal(room.gameResult.playersSnapshot.length, 3);

    const aliceSnap = room.gameResult.playersSnapshot.find(p => p.id === 'p1');
    assert.equal(aliceSnap.isWinner, true);
    assert.equal(aliceSnap.originalFaction, 'SAILOR');

    const bobSnap = room.gameResult.playersSnapshot.find(p => p.id === 'p2');
    assert.equal(bobSnap.isWinner, false);
  });

  test('returnToLobby (UC-018 Step 6): Host đưa toàn phòng quay về Sảnh chờ và reset dữ liệu người chơi', () => {
    const { room } = setupTestRoom();
    EndGameService.endGame(room, 'PIRATE', 'SHIP_REACHED_PIRATE_DESTINATION');

    // Host gọi returnToLobby
    const res = EndGameService.returnToLobby(room, 'tok1');

    assert.equal(res.success, true);
    assert.equal(room.status, 'LOBBY');
    assert.equal(room.gamePhase, 'LOBBY');
    assert.equal(room.winnerFaction, null);
    assert.equal(room.winReason, null);
    assert.equal(room.gameResult, null);
    assert.equal(room.mapBoard, null);
    assert.equal(room.captainId, null);

    // Người chơi được reset về sạch sẽ
    const p1 = room.getPlayer('p1');
    assert.equal(p1.status, 'ACTIVE');
    assert.equal(p1.factionRole, null);
    assert.equal(p1.gunCount, 0);
    assert.deepEqual(p1.publicTitles, []);

    const p3 = room.getPlayer('p3');
    assert.equal(p3.speechRestricted, false);
    assert.equal(p3.isCultist, false);
  });

  test('Defensive Programming: Throw lỗi khi người không phải Host gọi returnToLobby hoặc thiếu tham số', () => {
    const { room } = setupTestRoom();

    // p2 (không phải Host) cố gọi returnToLobby
    assert.throws(() => {
      EndGameService.returnToLobby(room, 'tok2');
    }, /Chỉ Chủ phòng \(Host\) mới có quyền/);

    // endGame với phe thắng không hợp lệ
    assert.throws(() => {
      EndGameService.endGame(room, 'INVALID_FACTION', 'REASON');
    }, /Phe thắng không hợp lệ/);
  });
});
