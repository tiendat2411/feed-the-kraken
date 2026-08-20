import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Room from '../src/models/Room.js';
import Player from '../src/models/Player.js';
import NavigationService from '../src/services/NavigationService.js';

describe('BR-003: NavigationService Flow & Invariants (UC-009, UC-010, UC-011)', () => {
  let room;
  let captain;
  let lieutenant;
  let navigator;
  let otherPlayer;

  beforeEach(() => {
    room = new Room({ id: 'ROOM_NAV', hostId: 'cap_1' });

    captain = new Player({ roomId: 'ROOM_NAV', sessionToken: 'tok_cap', nickname: 'Captain' });
    captain.id = 'cap_1';
    captain.publicTitles = ['CAPTAIN'];
    captain.gunCount = 3;

    lieutenant = new Player({ roomId: 'ROOM_NAV', sessionToken: 'tok_lt', nickname: 'Lieutenant' });
    lieutenant.id = 'lt_1';
    lieutenant.publicTitles = ['LIEUTENANT'];
    lieutenant.gunCount = 3;

    navigator = new Player({ roomId: 'ROOM_NAV', sessionToken: 'tok_nav', nickname: 'Navigator' });
    navigator.id = 'nav_1';
    navigator.publicTitles = ['NAVIGATOR'];
    navigator.gunCount = 3;

    otherPlayer = new Player({ roomId: 'ROOM_NAV', sessionToken: 'tok_other', nickname: 'Other' });
    otherPlayer.id = 'other_1';
    otherPlayer.gunCount = 3;

    room.addPlayer(captain);
    room.addPlayer(lieutenant);
    room.addPlayer(navigator);
    room.addPlayer(otherPlayer);

    room.status = 'IN_GAME';
    room.captainId = captain.id;
    room.lieutenantId = lieutenant.id;
    room.navigatorId = navigator.id;
  });

  describe('UC-009: Captain & Lieutenant Draw Flow', () => {
    test('startNavigation draws 2 cards for Captain and enters NAVIGATION_CAPTAIN_DRAW', () => {
      const result = NavigationService.startNavigation(room);

      assert.equal(result.gamePhase, 'NAVIGATION_CAPTAIN_DRAW');
      assert.equal(result.captainId, 'cap_1');
      assert.equal(result.cards.length, 2);
      assert.equal(room.navigationDeck.drawPile.length, 17); // 19 - 2 = 17
    });

    test('Non-captain cannot select card in Captain phase', () => {
      NavigationService.startNavigation(room);
      const capCards = room.navigationHand.cards;

      assert.throws(() => {
        NavigationService.captainSelectCard(room, 'tok_lt', capCards[0].id);
      }, /Chỉ có Thuyền trưởng đương nhiệm mới có quyền/);
    });

    test('Captain keeps 1 card into Logbook and transfers turn to Lieutenant with 2 new cards', () => {
      NavigationService.startNavigation(room);
      const capCards = room.navigationHand.cards;
      const keptCard = capCards[0];
      const discardedCard = capCards[1];

      const result = NavigationService.captainSelectCard(room, 'tok_cap', keptCard.id);

      assert.equal(result.gamePhase, 'NAVIGATION_LIEUTENANT_DRAW');
      assert.equal(result.lieutenantId, 'lt_1');
      assert.equal(result.cards.length, 2);
      assert.equal(room.navigationDeck.logbookCards.length, 1);
      assert.equal(room.navigationDeck.logbookCards[0].id, keptCard.id);
      assert.equal(room.navigationDeck.discardPile.length, 1);
      assert.equal(room.navigationDeck.discardPile[0].id, discardedCard.id);
      assert.equal(room.navigationDeck.drawPile.length, 15); // 17 - 2 = 15
    });

    test('Lieutenant keeps 1 card into Logbook and transfers turn to Navigator with 2 logbook cards', () => {
      NavigationService.startNavigation(room);
      NavigationService.captainSelectCard(room, 'tok_cap', room.navigationHand.cards[0].id);

      const ltCards = room.navigationHand.cards;
      const keptLtCard = ltCards[0];

      const result = NavigationService.lieutenantSelectCard(room, 'tok_lt', keptLtCard.id);

      assert.equal(result.gamePhase, 'NAVIGATION_NAVIGATOR_DECISION');
      assert.equal(result.navigatorId, 'nav_1');
      assert.equal(result.cards.length, 2);
      assert.equal(room.navigationDeck.logbookCards.length, 2);
      assert.equal(room.navigationDeck.discardPile.length, 2);
    });
  });

  describe('UC-010: Navigator Card Selection', () => {
    beforeEach(() => {
      NavigationService.startNavigation(room);
      NavigationService.captainSelectCard(room, 'tok_cap', room.navigationHand.cards[0].id);
      NavigationService.lieutenantSelectCard(room, 'tok_lt', room.navigationHand.cards[0].id);
    });

    test('Navigator chooses 1 card for ship movement and discards the other (AC-1)', () => {
      const logbookCards = room.navigationHand.cards;
      const chosenCard = logbookCards[0];
      const unchosenCard = logbookCards[1];

      const result = NavigationService.navigatorSelectCard(room, 'tok_nav', chosenCard.id);

      assert.equal(result.gamePhase, 'EXECUTE_ACTIONS');
      assert.equal(result.chosenCard.id, chosenCard.id);
      assert.equal(room.executedNavigationCard.id, chosenCard.id);
      assert.equal(room.navigationDeck.logbookCards.length, 0); // Cleared
      assert.equal(room.navigationDeck.discardPile.length, 3); // 1 cap + 1 lt + 1 nav discarded
      assert.equal(room.navigationHand, null);
    });

    test('Non-navigator cannot select card in Navigator phase', () => {
      const chosenCard = room.navigationHand.cards[0];
      assert.throws(() => {
        NavigationService.navigatorSelectCard(room, 'tok_cap', chosenCard.id);
      }, /Chỉ có Hoa tiêu đương nhiệm mới có quyền/);
    });
  });

  describe('UC-011: Navigator Jump Overboard & Emergency Navigator Appointment', () => {
    beforeEach(() => {
      NavigationService.startNavigation(room);
      NavigationService.captainSelectCard(room, 'tok_cap', room.navigationHand.cards[0].id);
      NavigationService.lieutenantSelectCard(room, 'tok_lt', room.navigationHand.cards[0].id);
    });

    test('Navigator jumps overboard: gets ELIMINATED with 0 guns and logbook is discarded', () => {
      navigator.factionRole = 'CULT_LEADER';
      const result = NavigationService.navigatorJumpOverboard(room, 'tok_nav');

      assert.equal(result.gamePhase, 'EMERGENCY_NAVIGATOR_SELECTION');
      assert.equal(result.eliminatedNavigatorId, 'nav_1');
      assert.equal(result.isCultLeader, true);
      assert.equal(navigator.status, 'ELIMINATED');
      assert.equal(navigator.eliminationReason, 'JUMP_OVERBOARD');
      assert.equal(navigator.gunCount, 0);
      assert.deepEqual(navigator.publicTitles, []);
      assert.equal(room.navigatorId, null);
      assert.equal(room.navigationDeck.logbookCards.length, 0);
      assert.equal(room.navigationDeck.discardPile.length, 4); // 1 cap + 1 lt + 2 logbook discarded
    });

    test('Navigator jumps overboard fallback E1: when no candidates left, Captain acts as Navigator', () => {
      // Eliminate otherPlayer so only Captain and Lieutenant remain
      otherPlayer.status = 'ELIMINATED';

      const result = NavigationService.navigatorJumpOverboard(room, 'tok_nav');

      assert.equal(result.gamePhase, 'NAVIGATION_CAPTAIN_DRAW');
      assert.equal(room.navigatorId, room.captainId);
      assert.equal(room.navigationHand.role, 'CAPTAIN');
      assert.equal(room.navigationHand.cards.length, 2);
    });

    test('Captain appoints Emergency Navigator (allows OFF_DUTY, forbids Captain/Lieutenant/ELIMINATED)', () => {
      NavigationService.navigatorJumpOverboard(room, 'tok_nav');

      // Cannot appoint self
      assert.throws(() => {
        NavigationService.appointEmergencyNavigator(room, 'tok_cap', 'cap_1');
      }, /Thuyền trưởng không thể tự bổ nhiệm chính mình/);

      // Cannot appoint lieutenant
      assert.throws(() => {
        NavigationService.appointEmergencyNavigator(room, 'tok_cap', 'lt_1');
      }, /Thuyền phó hiện tại không thể kiêm nhiệm/);

      // Cannot appoint eliminated player
      assert.throws(() => {
        NavigationService.appointEmergencyNavigator(room, 'tok_cap', 'nav_1');
      }, /Không thể chọn người chơi đã bị loại/);

      // Successfully appoints otherPlayer (even if OFF_DUTY)
      otherPlayer.status = 'OFF_DUTY';
      const newRound = NavigationService.appointEmergencyNavigator(room, 'tok_cap', 'other_1');

      assert.equal(newRound.gamePhase, 'NAVIGATION_CAPTAIN_DRAW');
      assert.equal(room.navigatorId, 'other_1');
      assert.deepEqual(otherPlayer.publicTitles, ['NAVIGATOR']);
      assert.equal(room.navigationHand.role, 'CAPTAIN');
      assert.equal(room.navigationHand.cards.length, 2);
    });
  });

  describe('Auto-play timeout handling', () => {
    test('autoPlayTimeout automatically picks card for current hand role', () => {
      NavigationService.startNavigation(room);
      assert.equal(room.gamePhase, 'NAVIGATION_CAPTAIN_DRAW');

      const res1 = NavigationService.autoPlayTimeout(room);
      assert.equal(res1.gamePhase, 'NAVIGATION_LIEUTENANT_DRAW');

      const res2 = NavigationService.autoPlayTimeout(room);
      assert.equal(res2.gamePhase, 'NAVIGATION_NAVIGATOR_DECISION');

      const res3 = NavigationService.autoPlayTimeout(room);
      assert.equal(res3.gamePhase, 'EXECUTE_ACTIONS');
      assert.ok(room.executedNavigationCard);
    });
  });
});
