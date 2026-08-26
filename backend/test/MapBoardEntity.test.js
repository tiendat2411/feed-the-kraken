import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MapBoard, CULT_RITUAL_TYPES } from '../src/models/MapBoard.js';

describe('ENT-005: MapBoard Entity Domain Logic & Invariants', () => {
  test('Khởi tạo thành công MapBoard với giá trị mặc định cho QUICK_JOURNEY', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_01', mapMode: 'QUICK_JOURNEY' });

    assert.equal(board.roomId, 'ROOM_MAP_01');
    assert.equal(board.mapMode, 'QUICK_JOURNEY');
    assert.equal(board.shipPosition, 'START');
    assert.equal(board.hasCrossedSupplyLine, false);
    assert.deepEqual(board.visitedNodes, ['START']);
    assert.equal(board.cultRitualDeck.length, 5);

    const currentNode = board.getCurrentNode();
    assert.ok(currentNode);
    assert.equal(currentNode.id, 'START');
    assert.equal(currentNode.row, 0);
  });

  test('Bộ bài Nghi thức Tà giáo (Cult Ritual Deck) luôn gồm đúng 5 lá (1 Guns, 1 Search, 3 Conversion)', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_02', mapMode: 'LONG_JOURNEY' });

    const guns = board.cultRitualDeck.filter(c => c === CULT_RITUAL_TYPES.GUNS_STASH);
    const search = board.cultRitualDeck.filter(c => c === CULT_RITUAL_TYPES.CULT_CABIN_SEARCH);
    const conversion = board.cultRitualDeck.filter(c => c === CULT_RITUAL_TYPES.CONVERSION);

    assert.equal(guns.length, 1);
    assert.equal(search.length, 1);
    assert.equal(conversion.length, 3);
  });

  test('drawCultRitualCard rút từng lá bài một và trả về null khi hết bài', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_03' });

    const drawnCards = [];
    for (let i = 0; i < 5; i++) {
      const card = board.drawCultRitualCard();
      assert.ok(card);
      drawnCards.push(card);
    }

    assert.equal(board.cultRitualDeck.length, 0);
    assert.equal(drawnCards.length, 5);

    // Rút thêm khi đã hết 5 lá
    const emptyDraw = board.drawCultRitualCard();
    assert.equal(emptyDraw, null);
  });

  test('getNextNodeId tra cứu chính xác node tiếp theo theo màu bài điều hướng', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_NAV', mapMode: 'QUICK_JOURNEY' });

    assert.equal(board.getNextNodeId('RED'), 'Q_R1_C2');
    assert.equal(board.getNextNodeId('YELLOW'), 'Q_R2_C3');
    assert.equal(board.getNextNodeId('BLUE'), 'Q_R1_C4');
  });

  test('moveByDirection cập nhật vị trí tàu, lưu vết lastMovement và lịch sử visitedNodes', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_04', mapMode: 'QUICK_JOURNEY' });

    const result = board.moveByDirection('BLUE');
    assert.equal(result.previousNode.id, 'START');
    assert.equal(result.currentNode.id, 'Q_R1_C4');
    assert.equal(board.shipPosition, 'Q_R1_C4');
    assert.deepEqual(board.visitedNodes, ['START', 'Q_R1_C4']);
    assert.deepEqual(board.lastMovement, {
      fromNodeId: 'START',
      toNodeId: 'Q_R1_C4',
      cardColor: 'BLUE'
    });
  });

  test('Phát hiện chính xác Victory Node và trả về Faction thắng cuộc', () => {
    const board = new MapBoard({
      roomId: 'ROOM_MAP_WIN',
      mapMode: 'QUICK_JOURNEY',
      shipPosition: 'Q_R7_C6'
    });

    assert.equal(board.isVictoryNode(), true);
    assert.equal(board.getVictoryFaction(), 'SAILOR');

    board.shipPosition = 'Q_R7_C0';
    assert.equal(board.isVictoryNode(), true);
    assert.equal(board.getVictoryFaction(), 'PIRATE');

    board.shipPosition = 'Q_R10_C3';
    assert.equal(board.isVictoryNode(), true);
    assert.equal(board.getVictoryFaction(), 'CULT');

    board.shipPosition = 'START';
    assert.equal(board.isVictoryNode(), false);
    assert.equal(board.getVictoryFaction(), null);
  });

  test('Tuyến tiếp tế (Supply Line) tự động kích hoạt khi tàu cắt qua ở Long Journey', () => {
    const board = new MapBoard({
      roomId: 'ROOM_MAP_05',
      mapMode: 'LONG_JOURNEY',
      shipPosition: 'L_R5_C2'
    });

    assert.equal(board.hasCrossedSupplyLine, false);
    assert.equal(board.willCrossSupplyLine('YELLOW'), true);

    const result = board.moveByDirection('YELLOW');
    assert.equal(result.crossedSupplyLine, true);
    assert.equal(board.hasCrossedSupplyLine, true);
    assert.equal(board.shipPosition, 'L_R7_C2');

    // Lần di chuyển tiếp theo không kích hoạt lại
    assert.equal(board.willCrossSupplyLine('YELLOW'), false);
  });

  test('toSanitizedJSON che giấu danh sách các lá bài Ritual chưa rút cho client', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_06' });
    const sanitized = board.toSanitizedJSON();

    assert.equal(sanitized.shipPosition, 'START');
    assert.equal(sanitized.mapMode, 'QUICK_JOURNEY');
    assert.equal(sanitized.hasCrossedSupplyLine, false);
    assert.equal(sanitized.cultRitualCount, 5);
    assert.equal(sanitized.cultRitualDeck, undefined);
    assert.ok(sanitized.currentNode);
  });

  test('toJSON và fromJSON bảo toàn nguyên vẹn trạng thái bàn cờ', () => {
    const board = new MapBoard({
      roomId: 'ROOM_MAP_07',
      mapMode: 'LONG_JOURNEY',
      shipPosition: 'L_R3_C2',
      hasCrossedSupplyLine: true,
      visitedNodes: ['START', 'L_R1_C1', 'L_R2_C1', 'L_R3_C2'],
      lastMovement: { fromNodeId: 'L_R2_C1', toNodeId: 'L_R3_C2', cardColor: 'RED' }
    });

    const json = board.toJSON();
    const restored = MapBoard.fromJSON(json);

    assert.equal(restored.id, board.id);
    assert.equal(restored.roomId, 'ROOM_MAP_07');
    assert.equal(restored.mapMode, 'LONG_JOURNEY');
    assert.equal(restored.shipPosition, 'L_R3_C2');
    assert.equal(restored.hasCrossedSupplyLine, true);
    assert.deepEqual(restored.visitedNodes, ['START', 'L_R1_C1', 'L_R2_C1', 'L_R3_C2']);
    assert.deepEqual(restored.lastMovement, board.lastMovement);
    assert.deepEqual(restored.cultRitualDeck, board.cultRitualDeck);
  });

  test('Validation / Invariants: Throw lỗi khi thiếu roomId, mapMode hoặc màu điều hướng không hợp lệ', () => {
    assert.throws(() => {
      new MapBoard({});
    }, /roomId là bắt buộc/);

    assert.throws(() => {
      new MapBoard({ roomId: 'ROOM_ERR', mapMode: 'INVALID_MODE' });
    }, /mapMode không hợp lệ/);

    const board = new MapBoard({ roomId: 'ROOM_ERR_DIR' });
    assert.throws(() => {
      board.moveByDirection('PURPLE');
    }, /Màu điều hướng không hợp lệ/);
  });
});
