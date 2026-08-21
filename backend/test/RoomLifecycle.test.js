import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Room from '../src/models/Room.js';
import Player from '../src/models/Player.js';
import { RoomManager } from '../src/services/RoomManager.js';

describe('Room Lifecycle & Sanitized State Snapshot (Issue Fix Verification)', () => {
  let room;
  let hostPlayer;
  let normalPlayer;

  beforeEach(async () => {
    // Reset room
    room = new Room({ id: 'LIFECYCLE_TEST', hostId: 'host_1' });

    hostPlayer = new Player({ roomId: 'LIFECYCLE_TEST', sessionToken: 'tok_host', nickname: 'HostPlayer' });
    hostPlayer.id = 'host_1';
    hostPlayer.factionRole = 'SAILOR';

    normalPlayer = new Player({ roomId: 'LIFECYCLE_TEST', sessionToken: 'tok_player', nickname: 'NormalPlayer' });
    normalPlayer.id = 'player_2';
    normalPlayer.factionRole = 'PIRATE';

    room.addPlayer(hostPlayer);
    room.addPlayer(normalPlayer);

    RoomManager.setRoomInstance(room.id, room);
  });

  test('toSanitizedJSON correctly attaches myId, myRole, executedNavigationCard and myNavigationCards', () => {
    room.gamePhase = 'EXECUTE_ACTIONS';
    room.executedNavigationCard = { id: 'card_1', color: 'BLUE', direction: 'BLUE', action: 'NONE' };
    room.navigationHand = {
      playerId: 'host_1',
      role: 'CAPTAIN',
      cards: [{ id: 'card_1', color: 'BLUE', direction: 'BLUE' }]
    };

    const hostSanitized = room.toSanitizedJSON('tok_host');
    assert.equal(hostSanitized.myId, 'host_1');
    assert.equal(hostSanitized.myRole, 'SAILOR');
    assert.deepEqual(hostSanitized.executedNavigationCard, { id: 'card_1', color: 'BLUE', direction: 'BLUE', action: 'NONE' });
    assert.equal(hostSanitized.myNavigationCards.length, 1);

    const otherSanitized = room.toSanitizedJSON('tok_player');
    assert.equal(otherSanitized.myId, 'player_2');
    assert.equal(otherSanitized.myRole, 'PIRATE');
    assert.deepEqual(otherSanitized.executedNavigationCard, { id: 'card_1', color: 'BLUE', direction: 'BLUE', action: 'NONE' });
    // Other player must not receive private hand of host
    assert.equal(otherSanitized.myNavigationCards.length, 0);
  });

  test('Host dissolveRoom dissolves room and frees memory immediately', async () => {
    const res = await RoomManager.dissolveRoom('tok_host');
    assert.equal(res.isDissolved, true);
    assert.equal(res.roomId, 'LIFECYCLE_TEST');

    // Verify room is removed from active memory
    const checkInstance = RoomManager.getRoomInstance('LIFECYCLE_TEST');
    assert.equal(checkInstance, null);
  });

  test('Player leaveRoom marks player as left and dissolves when empty', async () => {
    const res1 = await RoomManager.leaveRoom('tok_player');
    assert.equal(res1.isDissolved, false);
    assert.equal(res1.leftPlayerId, 'player_2');

    const res2 = await RoomManager.leaveRoom('tok_host');
    assert.equal(res2.isDissolved, true);

    const checkInstance = RoomManager.getRoomInstance('LIFECYCLE_TEST');
    assert.equal(checkInstance, null);
  });
});
