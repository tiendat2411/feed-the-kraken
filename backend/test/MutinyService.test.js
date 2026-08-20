import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Room from '../src/models/Room.js';
import Player from '../src/models/Player.js';
import MutinyService from '../src/services/MutinyService.js';

describe('BR-002: MutinyService Flow & Invariants (UC-006, UC-007, UC-008)', () => {
  let room;
  let captain;
  let p1;
  let p2;
  let p3;
  let p4;

  beforeEach(() => {
    room = new Room({ id: 'ROOM_TEST', hostId: 'cap_1' });
    
    captain = new Player({ roomId: 'ROOM_TEST', sessionToken: 'tok_cap', nickname: 'Captain' });
    captain.id = 'cap_1';
    captain.publicTitles = ['CAPTAIN'];
    captain.gunCount = 3;

    p1 = new Player({ roomId: 'ROOM_TEST', sessionToken: 'tok_p1', nickname: 'Player 1' });
    p1.id = 'p1_id';
    p1.gunCount = 3;

    p2 = new Player({ roomId: 'ROOM_TEST', sessionToken: 'tok_p2', nickname: 'Player 2' });
    p2.id = 'p2_id';
    p2.gunCount = 3;

    p3 = new Player({ roomId: 'ROOM_TEST', sessionToken: 'tok_p3', nickname: 'Player 3' });
    p3.id = 'p3_id';
    p3.gunCount = 3;

    p4 = new Player({ roomId: 'ROOM_TEST', sessionToken: 'tok_p4', nickname: 'Player 4' });
    p4.id = 'p4_id';
    p4.gunCount = 3;

    room.addPlayer(captain);
    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);
    room.addPlayer(p4);

    room.status = 'IN_GAME';
    room.captainId = captain.id;
    room.gamePhase = 'DAY_1_CREW_SELECTION';
  });

  describe('UC-006: Appoint Navigation Team', () => {
    test('Non-captain cannot appoint team', () => {
      assert.throws(() => {
        MutinyService.appointTeam(room, 'tok_p1', 'p2_id', 'p3_id');
      }, /Chỉ có Thuyền trưởng đương nhiệm mới có quyền bổ nhiệm/);
    });

    test('Captain cannot appoint himself as Lieutenant or Navigator (AC-1)', () => {
      assert.throws(() => {
        MutinyService.appointTeam(room, 'tok_cap', 'cap_1', 'p2_id');
      }, /Thuyền trưởng không thể tự bổ nhiệm chính mình/);

      assert.throws(() => {
        MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'cap_1');
      }, /Thuyền trưởng không thể tự bổ nhiệm chính mình/);
    });

    test('Lieutenant and Navigator cannot be the same person (AC-2)', () => {
      assert.throws(() => {
        MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p1_id');
      }, /Thuyền phó và Hoa tiêu không thể là cùng một người/);
    });

    test('Cannot appoint OFF_DUTY or ELIMINATED player', () => {
      p1.status = 'OFF_DUTY';
      assert.throws(() => {
        MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p2_id');
      }, /đang ở trạng thái OFF_DUTY/);

      p1.status = 'ELIMINATED';
      assert.throws(() => {
        MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p2_id');
      }, /đang ở trạng thái ELIMINATED/);
    });

    test('Auto-skips mutiny when no one in the room has guns (UC-007 Alt 1a)', () => {
      p1.gunCount = 0;
      p2.gunCount = 0;
      p3.gunCount = 0;
      p4.gunCount = 0;

      const result = MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p2_id');

      assert.equal(result.autoSkipped, true);
      assert.equal(result.reason, 'NO_GUNS_AVAILABLE');
      assert.equal(room.lieutenantId, 'p1_id');
      assert.equal(room.navigatorId, 'p2_id');
      assert.equal(room.gamePhase, 'NAVIGATION');
      assert.deepEqual(p1.publicTitles, ['LIEUTENANT']);
      assert.deepEqual(p2.publicTitles, ['NAVIGATOR']);
    });

    test('Successfully creates MutinySession and moves to LOYALTY_CHECK when guns are available', () => {
      const result = MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p2_id');

      assert.equal(result.autoSkipped, false);
      assert.equal(room.gamePhase, 'LOYALTY_CHECK');
      assert.ok(room.mutinySession);
      assert.equal(room.nominatedLieutenantId, 'p1_id');
      assert.equal(room.nominatedNavigatorId, 'p2_id');
    });
  });

  describe('UC-007: Mutiny Vote & Timer Logic', () => {
    beforeEach(() => {
      MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p2_id');
    });

    test('Captain cannot vote in mutiny', () => {
      assert.throws(() => {
        MutinyService.submitVote(room, 'tok_cap', 2);
      }, /Thuyền trưởng không được phép tham gia bỏ phiếu/);
    });

    test('Records player vote and detects vote completion', () => {
      const v1 = MutinyService.submitVote(room, 'tok_p1', 2);
      assert.equal(v1.recordedGuns, 2);
      assert.equal(v1.isVotingComplete, false);

      MutinyService.submitVote(room, 'tok_p2', 0);
      MutinyService.submitVote(room, 'tok_p3', 1);
      const v4 = MutinyService.submitVote(room, 'tok_p4', 0);

      assert.equal(v4.isVotingComplete, true);
    });

    test('All online players have unlimited discussion time (phaseDeadline is null)', () => {
      assert.equal(room.phaseDeadline, null);
      MutinyService.submitVote(room, 'tok_p1', 1);
      assert.equal(room.phaseDeadline, null);
    });

    test('Offline player triggers 90s countdown and auto-resolves with 0 guns', () => {
      p4.connectionStatus = 'OFFLINE';
      MutinyService.updateVotingDeadline(room);

      assert.ok(room.phaseDeadline > Date.now());

      MutinyService.submitVote(room, 'tok_p1', 1);
      MutinyService.submitVote(room, 'tok_p2', 1);
      MutinyService.submitVote(room, 'tok_p3', 0);

      // Auto-resolve offline player p4
      const timeoutRes = MutinyService.autoResolveOfflineVoters(room);
      assert.ok(timeoutRes);
      assert.equal(room.mutinySession.votes.get('p4_id'), 0);
      assert.equal(room.gamePhase, 'MUTINY_REVEALED');
    });
  });

  describe('UC-008: Mutiny Resolution & Captain Confirmation (Game Pace)', () => {
    beforeEach(() => {
      MutinyService.appointTeam(room, 'tok_cap', 'p1_id', 'p2_id');
    });

    test('Failed mutiny: Pauses at MUTINY_REVEALED until Captain confirms advancement to NAVIGATION', () => {
      MutinyService.submitVote(room, 'tok_p1', 1);
      MutinyService.submitVote(room, 'tok_p2', 1);
      MutinyService.submitVote(room, 'tok_p3', 0);
      MutinyService.submitVote(room, 'tok_p4', 0);

      const result = MutinyService.resolveMutiny(room);

      assert.equal(result.isSuccess, false);
      assert.equal(result.totalGuns, 2);
      assert.equal(room.gamePhase, 'MUTINY_REVEALED'); // Pauses for discussion

      // Guns are NOT deducted
      assert.equal(p1.gunCount, 3);
      assert.equal(p2.gunCount, 3);

      // Non-captain cannot confirm
      assert.throws(() => {
        MutinyService.confirmMutinyOutcome(room, 'tok_p1');
      }, /Chỉ có Thuyền trưởng mới có quyền xác nhận/);

      // Captain confirms -> advances to NAVIGATION
      const confirmRes = MutinyService.confirmMutinyOutcome(room, 'tok_cap');
      assert.equal(confirmRes.nextPhase, 'NAVIGATION');
      assert.equal(room.gamePhase, 'NAVIGATION');
      assert.equal(room.lieutenantId, 'p1_id');
      assert.equal(room.navigatorId, 'p2_id');
      assert.equal(room.mutinySession, null);
    });

    test('Successful mutiny: Pauses at MUTINY_REVEALED until New Captain confirms advancement to APPOINT_TEAM', () => {
      MutinyService.submitVote(room, 'tok_p1', 2);
      MutinyService.submitVote(room, 'tok_p2', 1);
      MutinyService.submitVote(room, 'tok_p3', 0);
      MutinyService.submitVote(room, 'tok_p4', 0);

      const result = MutinyService.resolveMutiny(room);

      assert.equal(result.isSuccess, true);
      assert.equal(result.isTie, false);
      assert.equal(result.newCaptainId, 'p1_id');
      assert.equal(room.captainId, 'p1_id');
      assert.equal(room.gamePhase, 'MUTINY_REVEALED'); // Pauses for discussion

      // Guns deducted
      assert.equal(p1.gunCount, 1);
      assert.equal(p2.gunCount, 2);

      // Old captain cannot confirm anymore
      assert.throws(() => {
        MutinyService.confirmMutinyOutcome(room, 'tok_cap');
      }, /Chỉ có Thuyền trưởng mới có quyền xác nhận/);

      // New Captain (p1) confirms -> advances to APPOINT_TEAM
      const confirmRes = MutinyService.confirmMutinyOutcome(room, 'tok_p1');
      assert.equal(confirmRes.nextPhase, 'APPOINT_TEAM');
      assert.equal(room.gamePhase, 'APPOINT_TEAM');
      assert.equal(room.mutinySession, null);
    });

    test('Successful mutiny (Tie-breaker Chain Elimination)', () => {
      MutinyService.submitVote(room, 'tok_p1', 2);
      MutinyService.submitVote(room, 'tok_p2', 2);
      MutinyService.submitVote(room, 'tok_p3', 2);
      MutinyService.submitVote(room, 'tok_p4', 0);

      const result = MutinyService.resolveMutiny(room);

      assert.equal(result.isSuccess, true);
      assert.equal(result.isTie, true);
      assert.deepEqual(result.tieCandidates, ['p1_id', 'p2_id', 'p3_id']);
      assert.equal(result.currentChooser, 'cap_1');
      assert.equal(room.gamePhase, 'MUTINY_TIE_BREAKER');

      // Round 1: Old Captain eliminates p1
      const step1 = MutinyService.eliminateTieCandidate(room, 'tok_cap', 'p1_id');
      assert.equal(step1.completed, false);
      assert.equal(step1.eliminatedId, 'p1_id');
      assert.equal(step1.nextChooserId, 'p1_id');
      assert.deepEqual(step1.remainingCandidates, ['p2_id', 'p3_id']);

      // Round 2: Eliminated p1 eliminates p2
      const step2 = MutinyService.eliminateTieCandidate(room, 'tok_p1', 'p2_id');
      assert.equal(step2.completed, true);
      assert.equal(step2.newCaptainId, 'p3_id'); // Last survivor p3 is new Captain!
      assert.equal(room.captainId, 'p3_id');
      assert.equal(room.gamePhase, 'MUTINY_REVEALED');
      assert.deepEqual(p3.publicTitles, ['CAPTAIN']);

      // New Captain confirms
      const confirmRes = MutinyService.confirmMutinyOutcome(room, 'tok_p3');
      assert.equal(confirmRes.nextPhase, 'APPOINT_TEAM');
      assert.equal(room.gamePhase, 'APPOINT_TEAM');
    });
  });

  describe('BR-002: Speech Restriction (Cut Tongue / Off with the tongue) Invariants', () => {
    test('Captain can apply cut tongue on a player', () => {
      const res = MutinyService.applyCutTongue(room, 'tok_cap', 'p1_id');
      assert.equal(res.success, true);
      assert.equal(p1.speechRestricted, true);
    });

    test('Non-captain cannot apply cut tongue', () => {
      assert.throws(() => {
        MutinyService.applyCutTongue(room, 'tok_p1', 'p2_id');
      }, /Chỉ có Thuyền trưởng đương nhiệm mới có quyền/);
    });

    test('Captain cannot cut his own tongue', () => {
      assert.throws(() => {
        MutinyService.applyCutTongue(room, 'tok_cap', 'cap_1');
      }, /Thuyền trưởng không thể tự cắt lưỡi chính mình/);
    });

    test('Cut tongue player can vote guns but is NEVER appointed Captain (AC-4)', () => {
      // Cut p1's tongue
      MutinyService.applyCutTongue(room, 'tok_cap', 'p1_id');
      assert.equal(p1.speechRestricted, true);

      MutinyService.appointTeam(room, 'tok_cap', 'p2_id', 'p3_id');

      // p1 votes 3 guns (highest), p2 votes 1 gun (second highest)
      MutinyService.submitVote(room, 'tok_p1', 3);
      MutinyService.submitVote(room, 'tok_p2', 1);
      MutinyService.submitVote(room, 'tok_p3', 0);
      MutinyService.submitVote(room, 'tok_p4', 0);

      const result = MutinyService.resolveMutiny(room);

      assert.equal(result.isSuccess, true);
      assert.equal(result.totalGuns, 4); // 3 + 1 = 4 guns

      // Both contributors have guns deducted
      assert.equal(p1.gunCount, 0); // 3 - 3 = 0
      assert.equal(p2.gunCount, 2); // 3 - 1 = 2

      // New Captain MUST be p2, not p1 (p1 is skipped because speechRestricted is true)
      assert.equal(result.newCaptainId, 'p2_id');
      assert.equal(room.captainId, 'p2_id');
      assert.deepEqual(p2.publicTitles, ['CAPTAIN']);
      assert.deepEqual(p1.publicTitles, []);
    });
  });
});
