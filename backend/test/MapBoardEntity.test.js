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

  test('moveShip cập nhật shipPosition và ghi lại lịch sử visitedNodes', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_04' });

    board.moveShip('NODE_Y1');
    assert.equal(board.shipPosition, 'NODE_Y1');
    assert.deepEqual(board.visitedNodes, ['START', 'NODE_Y1']);

    board.moveShip('NODE_B2');
    assert.equal(board.shipPosition, 'NODE_B2');
    assert.deepEqual(board.visitedNodes, ['START', 'NODE_Y1', 'NODE_B2']);
  });

  test('crossSupplyLine chỉ kích hoạt thành công 1 lần duy nhất', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_05', mapMode: 'LONG_JOURNEY' });

    assert.equal(board.hasCrossedSupplyLine, false);

    const firstCross = board.crossSupplyLine();
    assert.equal(firstCross, true);
    assert.equal(board.hasCrossedSupplyLine, true);

    const secondCross = board.crossSupplyLine();
    assert.equal(secondCross, false);
    assert.equal(board.hasCrossedSupplyLine, true);
  });

  test('toSanitizedJSON che giấu danh sách các lá bài Ritual chưa rút cho client', () => {
    const board = new MapBoard({ roomId: 'ROOM_MAP_06' });
    const sanitized = board.toSanitizedJSON();

    assert.equal(sanitized.shipPosition, 'START');
    assert.equal(sanitized.mapMode, 'QUICK_JOURNEY');
    assert.equal(sanitized.hasCrossedSupplyLine, false);
    assert.equal(sanitized.cultRitualCount, 5);
    assert.equal(sanitized.cultRitualDeck, undefined);
  });

  test('toJSON và fromJSON bảo toàn nguyên vẹn trạng thái bàn cờ', () => {
    const board = new MapBoard({
      roomId: 'ROOM_MAP_07',
      mapMode: 'LONG_JOURNEY',
      shipPosition: 'NODE_R3',
      hasCrossedSupplyLine: true,
      visitedNodes: ['START', 'NODE_R1', 'NODE_R2', 'NODE_R3']
    });

    const json = board.toJSON();
    const restored = MapBoard.fromJSON(json);

    assert.equal(restored.id, board.id);
    assert.equal(restored.roomId, 'ROOM_MAP_07');
    assert.equal(restored.mapMode, 'LONG_JOURNEY');
    assert.equal(restored.shipPosition, 'NODE_R3');
    assert.equal(restored.hasCrossedSupplyLine, true);
    assert.deepEqual(restored.visitedNodes, ['START', 'NODE_R1', 'NODE_R2', 'NODE_R3']);
    assert.deepEqual(restored.cultRitualDeck, board.cultRitualDeck);
  });

  test('Validation / Invariants: Throw lỗi khi thiếu roomId hoặc mapMode không hợp lệ', () => {
    assert.throws(() => {
      new MapBoard({});
    }, /roomId là bắt buộc/);

    assert.throws(() => {
      new MapBoard({ roomId: 'ROOM_ERR', mapMode: 'INVALID_MODE' });
    }, /mapMode không hợp lệ/);
  });
});
