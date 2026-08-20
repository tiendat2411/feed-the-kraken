import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import MutinySession from '../src/models/MutinySession.js';

describe('ENT-003: MutinySession Domain Logic & Invariants', () => {

  test('Required guns calculation by player count', () => {
    assert.equal(MutinySession.calculateRequiredGuns(5), 3);
    assert.equal(MutinySession.calculateRequiredGuns(6), 3);
    assert.equal(MutinySession.calculateRequiredGuns(7), 3);
    assert.equal(MutinySession.calculateRequiredGuns(8), 4);
    assert.equal(MutinySession.calculateRequiredGuns(9), 4);
    assert.equal(MutinySession.calculateRequiredGuns(10), 5);
    assert.equal(MutinySession.calculateRequiredGuns(11), 5);
  });

  test('Captain cannot vote in mutiny session', () => {
    const session = new MutinySession({
      roomId: 'TEST_ROOM',
      captainId: 'captain_1',
      playerCount: 5
    });

    assert.throws(() => {
      session.recordVote('captain_1', 2, { gunCount: 3 });
    }, /Thuyền trưởng đương nhiệm không được quyền bỏ phiếu/);
  });

  test('Gun count is clamped to available inventory', () => {
    const session = new MutinySession({
      roomId: 'TEST_ROOM',
      captainId: 'captain_1',
      playerCount: 5
    });

    const recorded = session.recordVote('player_1', 5, { gunCount: 2 });
    assert.equal(recorded, 2);
    assert.equal(session.votes.get('player_1'), 2);
  });

  test('Mutiny fails when total guns < required threshold', () => {
    const session = new MutinySession({
      roomId: 'TEST_ROOM',
      captainId: 'captain_1',
      playerCount: 5,
      nominatedLieutenantId: 'lt_1',
      nominatedNavigatorId: 'nav_1'
    });

    const players = [
      { id: 'p1', gunCount: 2, speechRestricted: false },
      { id: 'p2', gunCount: 2, speechRestricted: false },
      { id: 'p3', gunCount: 2, speechRestricted: false },
      { id: 'p4', gunCount: 2, speechRestricted: false }
    ];

    session.recordVote('p1', 1, players[0]);
    session.recordVote('p2', 1, players[1]);
    session.recordVote('p3', 0, players[2]);
    session.recordVote('p4', 0, players[3]);

    const result = session.resolve(players);

    assert.equal(result.isSuccess, false);
    assert.equal(result.totalGuns, 2);
    assert.equal(result.winnerId, 'captain_1');
    assert.equal(session.status, 'COMPLETED');
    assert.equal(result.appointedLieutenantId, 'lt_1');
    assert.equal(result.appointedNavigatorId, 'nav_1');
  });

  test('Mutiny succeeds with single highest contributor becoming Captain', () => {
    const session = new MutinySession({
      roomId: 'TEST_ROOM',
      captainId: 'captain_1',
      playerCount: 5
    });

    const players = [
      { id: 'p1', gunCount: 3, speechRestricted: false },
      { id: 'p2', gunCount: 3, speechRestricted: false },
      { id: 'p3', gunCount: 3, speechRestricted: false },
      { id: 'p4', gunCount: 3, speechRestricted: false }
    ];

    session.recordVote('p1', 2, players[0]);
    session.recordVote('p2', 1, players[1]);
    session.recordVote('p3', 0, players[2]);
    session.recordVote('p4', 0, players[3]);

    const result = session.resolve(players);

    assert.equal(result.isSuccess, true);
    assert.equal(result.isTie, false);
    assert.equal(result.totalGuns, 3);
    assert.equal(result.winnerId, 'p1');
    assert.equal(session.status, 'COMPLETED');
  });

  test('Speech-restricted player (cut tongue) cannot become Captain even if highest contributor', () => {
    const session = new MutinySession({
      roomId: 'TEST_ROOM',
      captainId: 'captain_1',
      playerCount: 5
    });

    const players = [
      { id: 'p_cut_tongue', gunCount: 3, speechRestricted: true },
      { id: 'p_normal', gunCount: 3, speechRestricted: false },
      { id: 'p3', gunCount: 3, speechRestricted: false },
      { id: 'p4', gunCount: 3, speechRestricted: false }
    ];

    session.recordVote('p_cut_tongue', 3, players[0]);
    session.recordVote('p_normal', 1, players[1]);
    session.recordVote('p3', 0, players[2]);
    session.recordVote('p4', 0, players[3]);

    const result = session.resolve(players);

    assert.equal(result.isSuccess, true);
    assert.equal(result.isTie, false);
    assert.equal(result.winnerId, 'p_normal'); // Skipped p_cut_tongue
  });

  test('Tie-breaker chain elimination process until single survivor', () => {
    const session = new MutinySession({
      roomId: 'TEST_ROOM',
      captainId: 'captain_1',
      playerCount: 6
    });

    const players = [
      { id: 'cand_A', gunCount: 3, speechRestricted: false },
      { id: 'cand_B', gunCount: 3, speechRestricted: false },
      { id: 'cand_C', gunCount: 3, speechRestricted: false },
      { id: 'p4', gunCount: 3, speechRestricted: false },
      { id: 'p5', gunCount: 3, speechRestricted: false }
    ];

    session.recordVote('cand_A', 2, players[0]);
    session.recordVote('cand_B', 2, players[1]);
    session.recordVote('cand_C', 2, players[2]);
    session.recordVote('p4', 0, players[3]);
    session.recordVote('p5', 0, players[4]);

    const result = session.resolve(players);

    assert.equal(result.isSuccess, true);
    assert.equal(result.isTie, true);
    assert.deepEqual(result.tieCandidates, ['cand_A', 'cand_B', 'cand_C']);
    assert.equal(result.currentChooser, 'captain_1');
    assert.equal(session.status, 'TIE_BREAKER');

    // Round 1: Old captain eliminates cand_A
    const step1 = session.eliminateCandidate('captain_1', 'cand_A');
    assert.equal(step1.completed, false);
    assert.equal(step1.eliminatedId, 'cand_A');
    assert.equal(step1.nextChooser, 'cand_A'); // Eliminated cand_A chooses next
    assert.deepEqual(step1.remainingCandidates, ['cand_B', 'cand_C']);

    // Round 2: cand_A eliminates cand_B
    const step2 = session.eliminateCandidate('cand_A', 'cand_B');
    assert.equal(step2.completed, true);
    assert.equal(step2.winnerId, 'cand_C'); // Last survivor is cand_C!
    assert.equal(session.status, 'COMPLETED');
  });

  test('JSON serialization & sanitized output for clients', () => {
    const session = new MutinySession({
      roomId: 'ROOM_ABC',
      captainId: 'cap_1',
      playerCount: 5
    });

    session.recordVote('p1', 2, { gunCount: 2 });
    session.recordVote('p2', 1, { gunCount: 2 });

    // While VOTING: other players cannot see exact gun counts
    const sanitizedForP2 = session.toSanitizedJSON('p2');
    assert.equal(sanitizedForP2.status, 'VOTING');
    assert.equal(sanitizedForP2.totalGuns, undefined);
    
    const p1Vote = sanitizedForP2.votes.find(v => v.playerId === 'p1');
    const p2Vote = sanitizedForP2.votes.find(v => v.playerId === 'p2');
    assert.equal(p1Vote.guns, undefined); // Hidden
    assert.equal(p2Vote.guns, 1); // Revealed to self
  });

});
