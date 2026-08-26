import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GameResult } from '../src/models/GameResult.js';
import { Room } from '../src/models/Room.js';
import { Player } from '../src/models/Player.js';
import { MapBoard } from '../src/models/MapBoard.js';

describe('ENT-006: GameResult Entity Domain Logic & Invariants', () => {
  const mockPlayers = [
    {
      id: 'p1',
      nickname: 'Captain Jack',
      avatar: 'avatar_1',
      originalFaction: 'SAILOR',
      currentFaction: 'SAILOR',
      isCultLeader: false,
      isCultist: false,
      isWinner: true,
      status: 'ACTIVE',
      gunCount: 3,
      publicTitles: ['CAPTAIN'],
      speechRestricted: false
    },
    {
      id: 'p2',
      nickname: 'Blackbeard',
      avatar: 'avatar_2',
      originalFaction: 'PIRATE',
      currentFaction: 'PIRATE',
      isCultLeader: false,
      isCultist: false,
      isWinner: false,
      status: 'ACTIVE',
      gunCount: 1,
      publicTitles: [],
      speechRestricted: false
    },
    {
      id: 'p3',
      nickname: 'Dagon High Priest',
      avatar: 'avatar_3',
      originalFaction: 'CULT_LEADER',
      currentFaction: 'CULT_LEADER',
      isCultLeader: true,
      isCultist: true,
      isWinner: false,
      status: 'ACTIVE',
      gunCount: 2,
      publicTitles: [],
      speechRestricted: false
    }
  ];

  test('Khởi tạo thành công GameResult với đầy đủ thuộc tính', () => {
    const result = new GameResult({
      roomId: 'ROOM_TEST_01',
      winningFaction: 'SAILOR',
      winReason: 'SHIP_REACHED_SAILOR_DESTINATION',
      playersSnapshot: mockPlayers,
      terminalNode: { id: 'Q_R7_C6', name: 'Bluewater Bay' },
      visitedNodes: ['START', 'Q_R1_C4', 'Q_R3_C4', 'Q_R7_C6'],
      mapType: 'QUICK_JOURNEY',
      totalRounds: 3
    });

    assert.ok(result.id);
    assert.equal(result.roomId, 'ROOM_TEST_01');
    assert.equal(result.winningFaction, 'SAILOR');
    assert.equal(result.winReason, 'SHIP_REACHED_SAILOR_DESTINATION');
    assert.equal(result.playersSnapshot.length, 3);
    assert.equal(result.terminalNode.id, 'Q_R7_C6');
    assert.deepEqual(result.visitedNodes, ['START', 'Q_R1_C4', 'Q_R3_C4', 'Q_R7_C6']);
    assert.equal(result.totalRounds, 3);
    assert.ok(result.createdAt);
  });

  test('Validation / Invariants: Throw lỗi khi thiếu trường bắt buộc hoặc dữ liệu sai quy chuẩn', () => {
    // Thiếu roomId
    assert.throws(() => {
      new GameResult({
        winningFaction: 'SAILOR',
        winReason: 'TEST',
        playersSnapshot: mockPlayers
      });
    }, /roomId là bắt buộc/);

    // winningFaction không hợp lệ
    assert.throws(() => {
      new GameResult({
        roomId: 'ROOM_ERR',
        winningFaction: 'ALIEN',
        winReason: 'TEST',
        playersSnapshot: mockPlayers
      });
    }, /winningFaction không hợp lệ/);

    // Thiếu winReason
    assert.throws(() => {
      new GameResult({
        roomId: 'ROOM_ERR',
        winningFaction: 'PIRATE',
        playersSnapshot: mockPlayers
      });
    }, /winReason là bắt buộc/);

    // playersSnapshot rỗng
    assert.throws(() => {
      new GameResult({
        roomId: 'ROOM_ERR',
        winningFaction: 'CULT',
        winReason: 'TEST',
        playersSnapshot: []
      });
    }, /playersSnapshot phải là một mảng và không được để trống/);
  });

  test('Factory method fromRoom: Trích xuất snapshot và tính toán chính xác người thắng cho phe SAILOR', () => {
    const room = new Room({ id: 'ROOM_SAILOR_WIN', hostId: 'p1', mapType: 'QUICK_JOURNEY' });
    
    const p1 = new Player({ id: 'p1', nickname: 'Sailor Alice', sessionToken: 'tok1' });
    p1.factionRole = 'SAILOR';
    p1.initialFactionRole = 'SAILOR';

    const p2 = new Player({ id: 'p2', nickname: 'Pirate Bob', sessionToken: 'tok2' });
    p2.factionRole = 'PIRATE';
    p2.initialFactionRole = 'PIRATE';

    const p3 = new Player({ id: 'p3', nickname: 'Converted Sailor Charlie', sessionToken: 'tok3' });
    p3.factionRole = 'CULTIST';
    p3.initialFactionRole = 'SAILOR';
    p3.isCultist = true;

    const p4 = new Player({ id: 'p4', nickname: 'Cult Leader Dave', sessionToken: 'tok4' });
    p4.factionRole = 'CULT_LEADER';
    p4.initialFactionRole = 'CULT_LEADER';

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);
    room.addPlayer(p4);

    room.mapBoard = new MapBoard({
      roomId: room.id,
      mapMode: 'QUICK_JOURNEY',
      shipPosition: 'Q_R7_C6'
    });

    const gameResult = GameResult.fromRoom(room, 'SAILOR', 'SHIP_REACHED_SAILOR_DESTINATION');

    assert.equal(gameResult.roomId, 'ROOM_SAILOR_WIN');
    assert.equal(gameResult.winningFaction, 'SAILOR');
    assert.equal(gameResult.playersSnapshot.length, 4);

    // Alice (Thủy thủ chân chính) -> Thắng
    const aliceSnap = gameResult.playersSnapshot.find(p => p.id === 'p1');
    assert.equal(aliceSnap.isWinner, true);
    assert.equal(aliceSnap.originalFaction, 'SAILOR');
    assert.equal(aliceSnap.currentFaction, 'SAILOR');

    // Bob (Hải tặc) -> Thua
    const bobSnap = gameResult.playersSnapshot.find(p => p.id === 'p2');
    assert.equal(bobSnap.isWinner, false);

    // Charlie (Thủy thủ bị thu nạp làm Cultist) -> Thua (vì phe Sailor thắng)
    const charlieSnap = gameResult.playersSnapshot.find(p => p.id === 'p3');
    assert.equal(charlieSnap.isWinner, false);
    assert.equal(charlieSnap.originalFaction, 'SAILOR');
    assert.equal(charlieSnap.currentFaction, 'CULTIST');
    assert.equal(charlieSnap.isCultist, true);

    // Dave (Cult Leader) -> Thua
    const daveSnap = gameResult.playersSnapshot.find(p => p.id === 'p4');
    assert.equal(daveSnap.isWinner, false);
    assert.equal(daveSnap.isCultLeader, true);
  });

  test('Factory method fromRoom: Trích xuất snapshot và tính toán chính xác người thắng cho phe CULT (bao gồm cả Cultist được cải đạo)', () => {
    const room = new Room({ id: 'ROOM_CULT_WIN', hostId: 'p1', mapType: 'QUICK_JOURNEY' });
    
    const p1 = new Player({ id: 'p1', nickname: 'Sailor Alice', sessionToken: 'tok1' });
    p1.factionRole = 'SAILOR';
    p1.initialFactionRole = 'SAILOR';

    const p2 = new Player({ id: 'p2', nickname: 'Pirate Bob Converted', sessionToken: 'tok2' });
    p2.factionRole = 'CULTIST';
    p2.initialFactionRole = 'PIRATE';
    p2.isCultist = true;

    const p3 = new Player({ id: 'p3', nickname: 'Cult Leader Dave', sessionToken: 'tok3' });
    p3.factionRole = 'CULT_LEADER';
    p3.initialFactionRole = 'CULT_LEADER';

    room.addPlayer(p1);
    room.addPlayer(p2);
    room.addPlayer(p3);

    room.mapBoard = new MapBoard({
      roomId: room.id,
      mapMode: 'QUICK_JOURNEY',
      shipPosition: 'Q_R10_C3'
    });

    const gameResult = GameResult.fromRoom(room, 'CULT', 'SHIP_REACHED_CULT_DESTINATION');

    assert.equal(gameResult.winningFaction, 'CULT');
    
    // Alice -> Thua
    assert.equal(gameResult.playersSnapshot.find(p => p.id === 'p1').isWinner, false);

    // Bob (Hải tặc đã cải đạo thành Cultist) -> Thắng cùng phe Cult!
    const bobSnap = gameResult.playersSnapshot.find(p => p.id === 'p2');
    assert.equal(bobSnap.isWinner, true);
    assert.equal(bobSnap.originalFaction, 'PIRATE');
    assert.equal(bobSnap.currentFaction, 'CULTIST');

    // Dave (Cult Leader) -> Thắng!
    const daveSnap = gameResult.playersSnapshot.find(p => p.id === 'p3');
    assert.equal(daveSnap.isWinner, true);
    assert.equal(daveSnap.isCultLeader, true);
  });

  test('Serialization & Deserialization: toJSON, toSanitizedJSON và fromJSON bảo toàn nguyên vẹn dữ liệu', () => {
    const original = new GameResult({
      roomId: 'ROOM_SER_01',
      winningFaction: 'PIRATE',
      winReason: 'SHIP_REACHED_PIRATE_DESTINATION',
      playersSnapshot: mockPlayers,
      terminalNode: { id: 'Q_R7_C0', name: 'Crimson Cove' },
      visitedNodes: ['START', 'Q_R1_C2', 'Q_R7_C0'],
      mapType: 'QUICK_JOURNEY',
      totalRounds: 2
    });

    const json = original.toJSON();
    const sanitized = original.toSanitizedJSON();
    assert.deepEqual(json, sanitized);

    const restored = GameResult.fromJSON(json);
    assert.equal(restored.id, original.id);
    assert.equal(restored.roomId, original.roomId);
    assert.equal(restored.winningFaction, original.winningFaction);
    assert.equal(restored.winReason, original.winReason);
    assert.deepEqual(restored.playersSnapshot, original.playersSnapshot);
    assert.deepEqual(restored.terminalNode, original.terminalNode);
    assert.deepEqual(restored.visitedNodes, original.visitedNodes);
    assert.equal(restored.totalRounds, original.totalRounds);
  });
});
