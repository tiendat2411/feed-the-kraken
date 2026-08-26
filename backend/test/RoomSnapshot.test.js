import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager } from '../src/services/RoomManager.js';
import { Room } from '../src/models/Room.js';
import { Player } from '../src/models/Player.js';
import { MapBoard } from '../src/models/MapBoard.js';
import { NavigationDeck } from '../src/models/NavigationDeck.js';
import { MutinySession } from '../src/models/MutinySession.js';

describe('Phase 8: Room Snapshot Integration & Fault-Tolerance (T036)', () => {
  beforeEach(() => {
    RoomManager.clearAll();
  });

  function createFullGameRoom(roomId = 'ROOM_SNAP_1') {
    const room = new Room({ id: roomId, hostId: 'host1', mapType: 'QUICK_JOURNEY' });

    const p1 = new Player({ id: 'host1', roomId, sessionToken: 'tok_host', nickname: 'Captain Alice', avatar: '🧑‍✈️' });
    p1.factionRole = 'SAILOR';
    p1.publicTitles = ['CAPTAIN'];
    p1.gunCount = 3;

    const p2 = new Player({ id: 'p2', roomId, sessionToken: 'tok_p2', nickname: 'Lt Bob', avatar: '👨‍🍳' });
    p2.factionRole = 'PIRATE';
    p2.publicTitles = ['LIEUTENANT'];
    p2.gunCount = 2;

    const p3 = new Player({ id: 'p3', roomId, sessionToken: 'tok_p3', nickname: 'Nav Charlie', avatar: '🥷' });
    p3.factionRole = 'CULT_LEADER';
    p3.publicTitles = ['NAVIGATOR'];
    p3.gunCount = 1;

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);

    room.status = 'IN_GAME';
    room.gamePhase = 'NAVIGATION';
    room.captainId = 'host1';
    room.lieutenantId = 'p2';
    room.navigatorId = 'p3';

    room.mapBoard = new MapBoard({
      roomId,
      mapMode: 'QUICK_JOURNEY',
      shipPosition: 'Q_R2_C3'
    });

    room.navigationDeck = new NavigationDeck({
      mapMode: 'QUICK_JOURNEY'
    });
    room.navigationDeck.draw(2);

    room.mutinySession = new MutinySession({
      roomId,
      captainId: 'host1',
      playerCount: 3,
      nominatedLieutenantId: 'p2',
      nominatedNavigatorId: 'p3'
    });
    room.mutinySession.recordVote('p2', 1);

    return room;
  }

  test('Serialization Parity: Room.toJSON và Room.fromJSON bảo toàn 100% dữ liệu game state', () => {
    const originalRoom = createFullGameRoom('TEST_PARITY');
    const json = originalRoom.toJSON();

    const restoredRoom = Room.fromJSON(json);

    assert.equal(restoredRoom.id, originalRoom.id);
    assert.equal(restoredRoom.status, 'IN_GAME');
    assert.equal(restoredRoom.gamePhase, 'NAVIGATION');
    assert.equal(restoredRoom.captainId, 'host1');
    assert.equal(restoredRoom.lieutenantId, 'p2');
    assert.equal(restoredRoom.navigatorId, 'p3');

    // Kiểm tra Players
    assert.equal(restoredRoom.getPlayers().length, 3);
    const p3 = restoredRoom.getPlayer('p3');
    assert.equal(p3.nickname, 'Nav Charlie');
    assert.equal(p3.factionRole, 'CULT_LEADER');
    assert.deepEqual(p3.publicTitles, ['NAVIGATOR']);

    // Kiểm tra MapBoard
    assert.ok(restoredRoom.mapBoard);
    assert.equal(restoredRoom.mapBoard.shipPosition, 'Q_R2_C3');

    // Kiểm tra NavigationDeck
    assert.ok(restoredRoom.navigationDeck);
    assert.equal(restoredRoom.navigationDeck.drawPile.length, 17);

    // Kiểm tra MutinySession
    assert.ok(restoredRoom.mutinySession);
    assert.equal(restoredRoom.mutinySession.votes.get('p2'), 1);
  });

  test('In-Memory Fallback: getRoomInstance trả về room từ memory map khi không có Redis', () => {
    const room = createFullGameRoom('MEM_ROOM');
    RoomManager.setRoomInstance('MEM_ROOM', room);

    const fetched = RoomManager.getRoomInstance('MEM_ROOM');
    assert.ok(fetched);
    assert.equal(fetched.id, 'MEM_ROOM');
  });

  test('Graceful Degradation: saveSnapshot và deleteSnapshot chạy an toàn mà không quăng lỗi khi Redis đóng', async () => {
    const room = createFullGameRoom('SAFE_ROOM');
    RoomManager.setRoomInstance('SAFE_ROOM', room);

    // Gọi các hàm snapshot khi redis client không mở
    await assert.doesNotReject(async () => {
      await RoomManager.saveSnapshot('SAFE_ROOM');
      await RoomManager.loadSnapshot('SAFE_ROOM');
      await RoomManager.restoreAllRooms();
      await RoomManager.deleteSnapshot('SAFE_ROOM');
    });
  });

  test('Sanitization Check: toSanitizedJSON từ snapshot không làm lộ vai trò mật của người chơi khác', () => {
    const originalRoom = createFullGameRoom('SANITIZE_TEST');

    const sanitizedForP1 = originalRoom.toSanitizedJSON('tok_host');

    // P1 thấy vai trò của chính mình
    assert.equal(sanitizedForP1.myRole, 'SAILOR');

    // P1 không được thấy vai trò của P2 (Pirate) hay P3 (Cult Leader)
    const p2Public = sanitizedForP1.players.find(p => p.id === 'p2');
    assert.equal(p2Public.factionRole, undefined);
    assert.equal(p2Public.isCultist, undefined);
  });
});
