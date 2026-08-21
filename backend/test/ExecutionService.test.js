import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import Room from '../src/models/Room.js';
import Player from '../src/models/Player.js';
import MapBoard from '../src/models/MapBoard.js';
import { ExecutionService } from '../src/services/ExecutionService.js';

describe('BR-004: ExecutionService Flow & Invariants (UC-012)', () => {
  function setupTestRoom(mapType = 'QUICK_JOURNEY') {
    const room = new Room({ id: 'EXEC01', hostId: 'p_host' });
    room.mapType = mapType;
    room.status = 'IN_GAME';
    room.gamePhase = 'EXECUTE_ACTIONS';

    const p1 = new Player({ id: 'p1', sessionToken: 'tok_1', nickname: 'Host', gunCount: 3 });
    const p2 = new Player({ id: 'p2', sessionToken: 'tok_2', nickname: 'Sailor1', gunCount: 1 });
    const p3 = new Player({ id: 'p3', sessionToken: 'tok_3', nickname: 'Pirate1', gunCount: 0 });
    const p4 = new Player({ id: 'p4', sessionToken: 'tok_4', nickname: 'CultLeader', gunCount: 2 });
    const p5 = new Player({ id: 'p5', sessionToken: 'tok_5', nickname: 'Sailor2', gunCount: 3 });

    [p1, p2, p3, p4, p5].forEach(p => room.players.set(p.id, p));
    room.captainId = p1.id;
    room.lieutenantId = p2.id;
    room.navigatorId = p3.id;

    return { room, p1, p2, p3, p4, p5 };
  }

  describe('UC-012: Ship Movement & Phase Branching (AC-1)', () => {
    test('Di chuyển tàu theo lá bài BLUE từ START sang Q_R1_C3 và chuyển sang EXECUTE_MAP_ACTION', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.executedNavigationCard = {
        id: 'card_blue_1',
        color: 'BLUE',
        action: 'DRUNK'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.isGameOver, false);
      assert.equal(result.cardColor, 'BLUE');
      assert.equal(result.previousNode.id, 'START');
      assert.equal(result.currentNode.id, 'Q_R1_C3');
      assert.equal(room.mapBoard.shipPosition, 'Q_R1_C3');
      assert.deepEqual(room.mapBoard.visitedNodes, ['START', 'Q_R1_C3']);

      // Q_R1_C3 có mapAction: CABIN_SEARCH -> rẽ nhánh sang EXECUTE_MAP_ACTION
      assert.equal(result.nextPhase, 'EXECUTE_MAP_ACTION');
      assert.equal(room.gamePhase, 'EXECUTE_MAP_ACTION');
      assert.equal(result.mapAction, 'CABIN_SEARCH');
      assert.deepEqual(result.pendingMapAction, {
        type: 'CABIN_SEARCH',
        nodeId: 'Q_R1_C3',
        nodeName: 'Vùng Biển Đông Nam'
      });
    });

    test('Di chuyển tàu vào ô không có Action (NONE) chuyển thẳng sang EXECUTE_CARD_ACTION', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      // Đặt tàu ở Q_R1_C1
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R1_C1'
      });

      // Đi hướng RED từ Q_R1_C1 -> cập bến Q_R2_C1 (mapAction: NONE)
      room.executedNavigationCard = {
        id: 'card_red_1',
        color: 'RED',
        action: 'DISARMED'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.isGameOver, false);
      assert.equal(result.currentNode.id, 'Q_R2_C1');
      assert.equal(result.mapAction, 'NONE');
      assert.equal(result.nextPhase, 'EXECUTE_CARD_ACTION');
      assert.equal(room.gamePhase, 'EXECUTE_CARD_ACTION');
      assert.equal(result.pendingMapAction, null);
    });
  });

  describe('UC-012: Victory Assertions & End Game (AC-2)', () => {
    test('Tàu cập bến KRAKEN_NEST kích hoạt chiến thắng tức thì cho phe CULT', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R3_C2'
      });

      room.executedNavigationCard = {
        id: 'card_yellow_cult',
        color: 'YELLOW',
        action: 'CULT_UPRISING'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.isGameOver, true);
      assert.equal(result.winnerFaction, 'CULT');
      assert.equal(room.status, 'FINISHED');
      assert.equal(room.gamePhase, 'END_GAME');
      assert.equal(room.winnerFaction, 'CULT');
      assert.equal(result.currentNode.id, 'KRAKEN_NEST');
    });

    test('Tàu cập bến BLUEWATER_BAY kích hoạt chiến thắng tức thì cho phe SAILOR', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R3_C2'
      });

      room.executedNavigationCard = {
        id: 'card_blue_sailor',
        color: 'BLUE',
        action: 'DRUNK'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.isGameOver, true);
      assert.equal(result.winnerFaction, 'SAILOR');
      assert.equal(room.status, 'FINISHED');
      assert.equal(room.gamePhase, 'END_GAME');
      assert.equal(result.currentNode.id, 'BLUEWATER_BAY');
    });

    test('Tàu cập bến CRIMSON_COVE kích hoạt chiến thắng tức thì cho phe PIRATE', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R3_C2'
      });

      room.executedNavigationCard = {
        id: 'card_red_pirate',
        color: 'RED',
        action: 'MERMAID'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.isGameOver, true);
      assert.equal(result.winnerFaction, 'PIRATE');
      assert.equal(room.status, 'FINISHED');
      assert.equal(room.gamePhase, 'END_GAME');
      assert.equal(result.currentNode.id, 'CRIMSON_COVE');
    });
  });

  describe('UC-013: Supply Line Gun Refill (AC-2)', () => {
    test('Cắt qua Tuyến tiếp tế sạc đầy 3 súng cho toàn bộ người chơi ACTIVE đang thiếu súng', () => {
      const { room, p2, p3, p4 } = setupTestRoom('LONG_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'LONG_JOURNEY',
        shipPosition: 'L_R3_C2' // Node này có crossesSupplyLine: true khi đi tiếp
      });

      assert.equal(p2.gunCount, 1);
      assert.equal(p3.gunCount, 0);
      assert.equal(p4.gunCount, 2);

      room.executedNavigationCard = {
        id: 'card_yellow_1',
        color: 'YELLOW',
        action: 'CULT_UPRISING'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.crossedSupplyLine, true);
      assert.equal(room.mapBoard.hasCrossedSupplyLine, true);
      assert.equal(p2.gunCount, 3);
      assert.equal(p3.gunCount, 3);
      assert.equal(p4.gunCount, 3);
      assert.deepEqual(result.supplyLineRefilledPlayers, ['p2', 'p3', 'p4']);
    });
  });

  describe('Invariants & Defensive Programming', () => {
    test('Throw lỗi khi phòng thiếu lá bài điều hướng đã chốt', () => {
      const { room } = setupTestRoom();
      room.executedNavigationCard = null;

      assert.throws(() => {
        ExecutionService.executeShipMovement(room);
      }, /Chưa có lá bài điều hướng/);
    });

    test('Throw lỗi khi phòng đang ở sai phase', () => {
      const { room } = setupTestRoom();
      room.gamePhase = 'LOBBY';
      room.executedNavigationCard = { color: 'BLUE' };

      assert.throws(() => {
        ExecutionService.executeShipMovement(room);
      }, /Không thể thực thi di chuyển tàu ở giai đoạn LOBBY/);
    });
  });
});
