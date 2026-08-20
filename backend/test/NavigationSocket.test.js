import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Room from '../src/models/Room.js';
import Player from '../src/models/Player.js';
import { RoomManager } from '../src/services/RoomManager.js';
import { NavigationService } from '../src/services/NavigationService.js';
import { emitPrivate } from '../src/socket/index.js';

describe('BR-003: Navigation Socket Privacy & Private Emit Verification (AC-1)', () => {
  let room;
  let captain;
  let lieutenant;
  let navigator;

  beforeEach(() => {
    room = new Room({ id: 'ROOM_SOCKET_TEST', hostId: 'cap_1' });

    captain = new Player({ roomId: 'ROOM_SOCKET_TEST', sessionToken: 'tok_cap', nickname: 'Captain' });
    captain.id = 'cap_1';
    captain.publicTitles = ['CAPTAIN'];

    lieutenant = new Player({ roomId: 'ROOM_SOCKET_TEST', sessionToken: 'tok_lt', nickname: 'Lieutenant' });
    lieutenant.id = 'lt_1';
    lieutenant.publicTitles = ['LIEUTENANT'];

    navigator = new Player({ roomId: 'ROOM_SOCKET_TEST', sessionToken: 'tok_nav', nickname: 'Navigator' });
    navigator.id = 'nav_1';
    navigator.publicTitles = ['NAVIGATOR'];

    room.addPlayer(captain);
    room.addPlayer(lieutenant);
    room.addPlayer(navigator);

    room.status = 'IN_GAME';
    room.captainId = captain.id;
    room.lieutenantId = lieutenant.id;
    room.navigatorId = navigator.id;

    RoomManager.setRoomInstance(room.id, room);
  });

  test('emitPrivate delivers card payload exclusively to the target session token', () => {
    const receivedEvents = {};

    const mockIo = {
      of: () => ({
        sockets: new Map([
          ['sock_1', { sessionToken: 'tok_cap', emit: (evt, data) => { receivedEvents['tok_cap'] = { evt, data }; } }],
          ['sock_2', { sessionToken: 'tok_lt', emit: (evt, data) => { receivedEvents['tok_lt'] = { evt, data }; } }],
          ['sock_3', { sessionToken: 'tok_nav', emit: (evt, data) => { receivedEvents['tok_nav'] = { evt, data }; } }]
        ])
      })
    };

    const navRes = NavigationService.startNavigation(room);

    // Emit cards only to Captain
    emitPrivate(mockIo, room.id, room.captainId, 'CARDS_DRAWN_SECRET', {
      role: 'CAPTAIN',
      cards: navRes.cards
    });

    // Captain received cards
    assert.ok(receivedEvents['tok_cap']);
    assert.equal(receivedEvents['tok_cap'].evt, 'CARDS_DRAWN_SECRET');
    assert.equal(receivedEvents['tok_cap'].data.cards.length, 2);

    // Lieutenant and Navigator DID NOT receive cards
    assert.equal(receivedEvents['tok_lt'], undefined);
    assert.equal(receivedEvents['tok_nav'], undefined);
  });
});
