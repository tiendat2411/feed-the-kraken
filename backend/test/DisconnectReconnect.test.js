import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager } from '../src/services/RoomManager.js';
import { Room } from '../src/models/Room.js';
import { Player } from '../src/models/Player.js';
import { NavigationDeck } from '../src/models/NavigationDeck.js';
import { MapBoard } from '../src/models/MapBoard.js';

describe('Phase 8: Socket Disconnect & Reconnect Resilience (T037)', () => {
  beforeEach(() => {
    RoomManager.clearAll();
  });

  function setupActiveGameRoom(roomId = 'ROOM_RECON_1') {
    const room = new Room({ id: roomId, hostId: 'host1', mapType: 'QUICK_JOURNEY' });

    const p1 = new Player({ id: 'host1', roomId, sessionToken: 'tok_host', nickname: 'Host Alice', avatar: '🧑‍✈️' });
    p1.factionRole = 'SAILOR';
    p1.publicTitles = ['CAPTAIN'];
    p1.gunCount = 3;
    p1.connectionStatus = 'ONLINE';

    const p2 = new Player({ id: 'p2', roomId, sessionToken: 'tok_p2', nickname: 'Lt Bob', avatar: '👨‍🍳' });
    p2.factionRole = 'PIRATE';
    p2.publicTitles = ['LIEUTENANT'];
    p2.gunCount = 2;
    p2.connectionStatus = 'ONLINE';

    const p3 = new Player({ id: 'p3', roomId, sessionToken: 'tok_p3', nickname: 'Nav Charlie', avatar: '🥷' });
    p3.factionRole = 'CULT_LEADER';
    p3.publicTitles = ['NAVIGATOR'];
    p3.gunCount = 1;
    p3.connectionStatus = 'ONLINE';

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);

    room.status = 'IN_GAME';
    room.gamePhase = 'NAVIGATION_CAPTAIN_DRAW';
    room.captainId = 'host1';
    room.lieutenantId = 'p2';
    room.navigatorId = 'p3';

    room.mapBoard = new MapBoard({ roomId, mapMode: 'QUICK_JOURNEY' });
    room.navigationDeck = new NavigationDeck({ mapMode: 'QUICK_JOURNEY' });

    RoomManager.setRoomInstance(roomId, room);
    return { room, p1, p2, p3 };
  }

  test('AC-1: Ngắt kết nối (Disconnect) đánh dấu OFFLINE nhưng bảo toàn toàn bộ vai trò và tài sản người chơi', () => {
    const { room, p2 } = setupActiveGameRoom('DISC_TEST');

    const updatedRoom = RoomManager.disconnectPlayer('tok_p2');

    assert.ok(updatedRoom);
    const disconnectedPlayer = updatedRoom.getPlayer('p2');
    assert.equal(disconnectedPlayer.connectionStatus, 'OFFLINE');
    assert.equal(disconnectedPlayer.factionRole, 'PIRATE');
    assert.equal(disconnectedPlayer.gunCount, 2);
    assert.deepEqual(disconnectedPlayer.publicTitles, ['LIEUTENANT']);
  });

  test('AC-2: Kết nối lại (Reconnect) khôi phục ONLINE và cung cấp sanitized state chính xác cho người chơi', () => {
    const { room, p2 } = setupActiveGameRoom('RECON_TEST');

    // Giả lập rớt mạng
    RoomManager.disconnectPlayer('tok_p2');
    assert.equal(room.getPlayer('p2').connectionStatus, 'OFFLINE');

    // Giả lập F5 / Reconnect với token cũ
    const reconnectedRoom = RoomManager.reconnectPlayer('tok_p2', 'socket_new_123');

    assert.ok(reconnectedRoom);
    const reconnectedPlayer = reconnectedRoom.getPlayer('p2');
    assert.equal(reconnectedPlayer.connectionStatus, 'ONLINE');

    // Kiểm tra dữ liệu trả về cho client
    const sanitized = reconnectedRoom.toSanitizedJSON('tok_p2');
    assert.equal(sanitized.myRole, 'PIRATE');
    assert.equal(sanitized.myId, 'p2');
    assert.equal(sanitized.gamePhase, 'NAVIGATION_CAPTAIN_DRAW');

    // Đảm bảo không lộ vai trò của Host (Sailor) và Charlie (Cult Leader)
    const hostPublic = sanitized.players.find(p => p.id === 'host1');
    assert.equal(hostPublic.factionRole, undefined);
  });

  test('AC-3: Khôi phục bài kín trên tay (Private Navigation Hand) khi Thuyền trưởng / Hoa tiêu reconnect', () => {
    const { room } = setupActiveGameRoom('HAND_RECON_TEST');

    // Thuyền trưởng Alice đang cầm 2 lá bài
    room.navigationHand = {
      playerId: 'host1',
      role: 'CAPTAIN',
      cards: [
        { color: 'RED', action: 'DRUNK' },
        { color: 'BLUE', action: 'NONE' }
      ]
    };

    // Alice bị rớt mạng và reconnect lại
    RoomManager.disconnectPlayer('tok_host');
    const reconnectedRoom = RoomManager.reconnectPlayer('tok_host', 'socket_host_new');

    const sanitizedAlice = reconnectedRoom.toSanitizedJSON('tok_host');
    assert.equal(sanitizedAlice.myRole, 'SAILOR');
    assert.deepEqual(sanitizedAlice.myNavigationCards, [
      { color: 'RED', action: 'DRUNK' },
      { color: 'BLUE', action: 'NONE' }
    ]);

    // Đối với người khác (Bob), myNavigationCards phải trống rỗng []
    const sanitizedBob = reconnectedRoom.toSanitizedJSON('tok_p2');
    assert.deepEqual(sanitizedBob.myNavigationCards, []);
  });

  test('AC-4: Khôi phục dữ liệu soi khám bí mật (Mermaid / Telescope / Cult Inspection) khi reconnect', () => {
    const { room } = setupActiveGameRoom('INSPECT_RECON_TEST');

    // Đang có popup xem hòm bài Mermaid cho Bob
    room.pendingMermaidInspection = {
      targetPlayerId: 'p2',
      cards: [{ color: 'RED', action: 'NONE' }, { color: 'YELLOW', action: 'NONE' }, { color: 'BLUE', action: 'NONE' }]
    };

    // Bob reconnect
    const sanitizedBob = room.toSanitizedJSON('tok_p2');
    assert.equal(sanitizedBob.myMermaidCards.length, 3);

    // Alice không được thấy bài Mermaid của Bob
    const sanitizedAlice = room.toSanitizedJSON('tok_host');
    assert.deepEqual(sanitizedAlice.myMermaidCards, []);
  });

  test('AC-5: Host Disconnect & Reconnect bảo toàn quyền điều khiển phòng', () => {
    const { room } = setupActiveGameRoom('HOST_RECON_TEST');

    RoomManager.disconnectPlayer('tok_host');
    assert.equal(room.getPlayer('host1').connectionStatus, 'OFFLINE');

    // Host kết nối lại
    RoomManager.reconnectPlayer('tok_host', 'socket_host_reconnected');
    assert.equal(room.getPlayer('host1').connectionStatus, 'ONLINE');
    assert.equal(room.hostId, 'host1');
  });
});
