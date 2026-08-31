import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import Room from '../src/models/Room.js';
import Player from '../src/models/Player.js';
import MapBoard from '../src/models/MapBoard.js';
import NavigationDeck from '../src/models/NavigationDeck.js';
import { ExecutionService } from '../src/services/ExecutionService.js';

describe('BR-004: ExecutionService Flow & Invariants (UC-012, UC-013, UC-014, UC-015)', () => {
  function setupTestRoom(mapType = 'QUICK_JOURNEY') {
    const room = new Room({ id: 'EXEC01', hostId: 'p_host' });
    room.mapType = mapType;
    room.status = 'IN_GAME';
    room.gamePhase = 'EXECUTE_ACTIONS';

    const p1 = new Player({ id: 'p1', sessionToken: 'tok_1', nickname: 'Captain', gunCount: 3 });
    const p2 = new Player({ id: 'p2', sessionToken: 'tok_2', nickname: 'Sailor1', gunCount: 1 });
    const p3 = new Player({ id: 'p3', sessionToken: 'tok_3', nickname: 'Pirate1', gunCount: 0 });
    const p4 = new Player({ id: 'p4', sessionToken: 'tok_4', nickname: 'CultLeader', gunCount: 2 });
    const p5 = new Player({ id: 'p5', sessionToken: 'tok_5', nickname: 'Sailor2', gunCount: 3 });

    p1.factionRole = 'SAILOR';
    p1.publicTitles = ['CAPTAIN'];
    p2.factionRole = 'SAILOR';
    p3.factionRole = 'PIRATE';
    p4.factionRole = 'CULT_LEADER';
    p5.factionRole = 'CULTIST';

    [p1, p2, p3, p4, p5].forEach(p => room.players.set(p.id, p));
    room.captainId = p1.id;
    room.lieutenantId = p2.id;
    room.navigatorId = p3.id;

    room.navigationDeck = new NavigationDeck({ roomId: room.id, mapType });
    room.mapBoard = new MapBoard({ roomId: room.id, mapMode: mapType });

    return { room, p1, p2, p3, p4, p5 };
  }

  describe('UC-012: Ship Movement & Phase Branching (AC-1)', () => {
    test('Di chuyển tàu theo lá bài BLUE từ Q_R2_C1 sang Q_R3_C2 và chuyển sang EXECUTE_MAP_ACTION', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R2_C1'
      });
      room.executedNavigationCard = {
        id: 'card_blue_1',
        color: 'BLUE',
        action: 'DRUNK'
      };

      const result = ExecutionService.executeShipMovement(room);

      assert.equal(result.isGameOver, false);
      assert.equal(result.cardColor, 'BLUE');
      assert.equal(result.previousNode.id, 'Q_R2_C1');
      assert.equal(result.currentNode.id, 'Q_R3_C2');
      assert.equal(room.mapBoard.shipPosition, 'Q_R3_C2');
      assert.deepEqual(room.mapBoard.visitedNodes, ['START', 'Q_R3_C2']);

      assert.equal(result.nextPhase, 'EXECUTE_MAP_ACTION');
      assert.equal(room.gamePhase, 'EXECUTE_MAP_ACTION');
      assert.equal(result.mapAction, 'CABIN_SEARCH');
      assert.deepEqual(result.pendingMapAction, {
        type: 'CABIN_SEARCH',
        nodeId: 'Q_R3_C2',
        nodeName: 'Vùng Biển Đông Đảo'
      });
    });

    test('Di chuyển tàu vào ô không có Action (NONE) chuyển thẳng sang EXECUTE_CARD_ACTION', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R1_C2'
      });

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
        shipPosition: 'Q_R8_C3'
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
      assert.equal(result.currentNode.id, 'Q_R10_C3');
    });

    test('Tàu cập bến BLUEWATER_BAY kích hoạt chiến thắng tức thì cho phe SAILOR', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R5_C6'
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
      assert.equal(result.currentNode.id, 'Q_R7_C6');
    });

    test('Tàu cập bến CRIMSON_COVE kích hoạt chiến thắng tức thì cho phe PIRATE', () => {
      const { room } = setupTestRoom('QUICK_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'QUICK_JOURNEY',
        shipPosition: 'Q_R5_C0'
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
      assert.equal(result.currentNode.id, 'Q_R7_C0');
    });
  });

  describe('UC-013: Map Actions (Cabin Search, Flogging, Off with Tongue, Feed Kraken)', () => {
    test('CABIN_SEARCH (AC-1): Giấu danh tính Cultist (trả về CULTIST_TENTACLE) và gán isConvertible = false', () => {
      const { room, p1, p5 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'CABIN_SEARCH', nodeId: 'Q_R1_C3' };

      const result = ExecutionService.executeMapAction(room, p1.sessionToken, p5.id);

      assert.equal(result.actionType, 'CABIN_SEARCH');
      assert.equal(result.resultPayload.isPrivate, true);
      assert.equal(result.resultPayload.privateResult, 'CULTIST_TENTACLE');
      assert.equal(p5.isConvertible, false);
    });

    test('CABIN_SEARCH: Trả về chính xác phe gốc cho người chơi chưa chuyển phe', () => {
      const { room, p1, p3 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'CABIN_SEARCH', nodeId: 'Q_R1_C3' };

      const result = ExecutionService.executeMapAction(room, p1.sessionToken, p3.id);

      assert.equal(result.resultPayload.privateResult, 'PIRATE');
      assert.equal(p3.isConvertible, false);
    });

    test('FLOGGING (AC-4): Công khai câu loại trừ và gán isConvertible = false', () => {
      const { room, p1, p2 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'FLOGGING', nodeId: 'Q_R2_C3' };

      const result = ExecutionService.executeMapAction(room, p1.sessionToken, p2.id);

      assert.equal(result.actionType, 'FLOGGING');
      assert.equal(result.resultPayload.isPrivate, false);
      assert.ok(['PIRATE', 'CULT_LEADER'].includes(result.resultPayload.falseFaction));
      assert.equal(p2.isConvertible, false);
    });

    test('OFF_WITH_THE_TONGUE: Gán speechRestricted = true cho mục tiêu', () => {
      const { room, p1, p2 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'OFF_WITH_THE_TONGUE', nodeId: 'L_R4_C1' };

      const result = ExecutionService.executeMapAction(room, p1.sessionToken, p2.id);

      assert.equal(result.actionType, 'OFF_WITH_THE_TONGUE');
      assert.equal(p2.speechRestricted, true);
    });

    test('FEED_THE_KRAKEN (AC-3): Ném trúng Cult Leader lập tức kết thúc game với chiến thắng cho phe CULT', () => {
      const { room, p1, p4 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'FEED_THE_KRAKEN', nodeId: 'Q_R3_C1' };

      const result = ExecutionService.executeMapAction(room, p1.sessionToken, p4.id);

      assert.equal(result.isGameOver, true);
      assert.equal(result.winnerFaction, 'CULT');
      assert.equal(room.status, 'FINISHED');
      assert.equal(room.gamePhase, 'END_GAME');
      assert.equal(p4.status, 'ELIMINATED');
      assert.equal(p4.gunCount, 0);
    });

    test('FEED_THE_KRAKEN: Ném người chơi thường loại bỏ khỏi tàu nhưng không kết thúc game', () => {
      const { room, p1, p3 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'FEED_THE_KRAKEN', nodeId: 'Q_R3_C1' };

      const result = ExecutionService.executeMapAction(room, p1.sessionToken, p3.id);

      assert.equal(result.isGameOver, false);
      assert.equal(p3.status, 'ELIMINATED');
      assert.equal(p3.gunCount, 0);
    });

    test('confirmMapActionAndAdvance (Game Pace): Thuyền trưởng xác nhận chuyển sang EXECUTE_CARD_ACTION', () => {
      const { room, p1 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'FLOGGING', nodeId: 'Q_R2_C3' };

      const result = ExecutionService.confirmMapActionAndAdvance(room, p1.sessionToken);

      assert.equal(result.nextPhase, 'EXECUTE_CARD_ACTION');
      assert.equal(room.gamePhase, 'EXECUTE_CARD_ACTION');
      assert.equal(room.pendingMapAction, null);
    });
  });

  describe('UC-014: Card Actions (Drunk, Armed, Disarmed, Mermaid, Telescope)', () => {
    test('DRUNK (AC-1): Chuyển Thuyền trưởng theo chiều kim đồng hồ, bỏ qua speechRestricted, cho phép OFF_DUTY', () => {
      const { room, p1, p2, p3 } = setupTestRoom();
      p2.speechRestricted = true;
      p3.status = 'OFF_DUTY';

      room.gamePhase = 'EXECUTE_CARD_ACTION';
      room.executedNavigationCard = { color: 'BLUE', action: 'DRUNK' };

      const result = ExecutionService.executeCardAction(room);

      assert.equal(result.actionType, 'DRUNK');
      assert.equal(result.oldCaptainId, p1.id);
      assert.equal(result.newCaptainId, p3.id);
      assert.equal(room.captainId, p3.id);
      assert.ok(!p1.publicTitles.includes('CAPTAIN'));
      assert.ok(p3.publicTitles.includes('CAPTAIN'));
      assert.equal(result.nextPhase, 'ROUND_END');
    });

    test('ARMED: Tiếp thêm 1 súng cho Hoa tiêu đương nhiệm', () => {
      const { room, p3 } = setupTestRoom();
      assert.equal(p3.gunCount, 0);

      room.gamePhase = 'EXECUTE_CARD_ACTION';
      room.executedNavigationCard = { color: 'RED', action: 'ARMED' };

      const result = ExecutionService.executeCardAction(room);

      assert.equal(result.actionType, 'ARMED');
      assert.equal(p3.gunCount, 1);
      assert.equal(result.nextPhase, 'ROUND_END');
    });

    test('DISARMED: Tước 1 súng của Hoa tiêu đương nhiệm (chặn dưới mức 0)', () => {
      const { room, p3 } = setupTestRoom();
      p3.gunCount = 2;

      room.gamePhase = 'EXECUTE_CARD_ACTION';
      room.executedNavigationCard = { color: 'BLUE', action: 'DISARMED' };

      const result = ExecutionService.executeCardAction(room);

      assert.equal(result.actionType, 'DISARMED');
      assert.equal(p3.gunCount, 1);
      assert.equal(result.nextPhase, 'ROUND_END');
    });

    test('MERMAID (AC-2): Chuyển sang CARD_ACTION_TARGET_SELECTION và Thuyền trưởng chỉ định người nhận', () => {
      const { room, p1, p2 } = setupTestRoom();
      room.navigationDeck.discard({ id: 'd1', direction: 'BLUE' });
      room.navigationDeck.discard({ id: 'd2', direction: 'RED' });
      room.navigationDeck.discard({ id: 'd3', direction: 'YELLOW' });

      room.gamePhase = 'EXECUTE_CARD_ACTION';
      room.executedNavigationCard = { color: 'RED', action: 'MERMAID' };

      const cardResult = ExecutionService.executeCardAction(room);
      assert.equal(cardResult.requiresTargetSelection, true);
      assert.equal(room.gamePhase, 'CARD_ACTION_TARGET_SELECTION');

      const targetResult = ExecutionService.designateCardActionTarget(room, p1.sessionToken, p2.id);
      assert.equal(targetResult.actionType, 'MERMAID');
      assert.equal(targetResult.targetPlayerId, p2.id);
      assert.equal(targetResult.cards.length, 3);
      assert.equal(room.gamePhase, 'MERMAID_INSPECTION');

      const ackResult = ExecutionService.acknowledgeMermaidInspection(room, p2.sessionToken);
      assert.equal(ackResult.success, true);
      assert.equal(ackResult.nextPhase, 'ROUND_END');
      assert.equal(room.pendingMermaidInspection, null);
    });

    test('TELESCOPE (AC-2, AC-3): Thuyền trưởng chỉ định người soi đỉnh và người đó chọn VỨT (DISCARD)', () => {
      const { room, p1, p2 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_CARD_ACTION';
      room.executedNavigationCard = { color: 'RED', action: 'TELESCOPE' };

      const cardResult = ExecutionService.executeCardAction(room);
      assert.equal(cardResult.requiresTargetSelection, true);

      const targetResult = ExecutionService.designateCardActionTarget(room, p1.sessionToken, p2.id);
      assert.equal(targetResult.actionType, 'TELESCOPE');
      assert.equal(targetResult.targetPlayerId, p2.id);
      assert.ok(targetResult.card);
      assert.equal(room.gamePhase, 'TELESCOPE_INSPECTION');

      const initialDrawCount = room.navigationDeck.drawPile.length;
      const initialDiscardCount = room.navigationDeck.discardPile.length;
      const peekedCardId = targetResult.card.id;

      const decisionResult = ExecutionService.resolveTelescopeDecision(room, p2.sessionToken, 'DISCARD');
      assert.equal(decisionResult.decision, 'DISCARD');
      assert.equal(decisionResult.nextPhase, 'ROUND_END');
      assert.equal(room.navigationDeck.drawPile.length, initialDrawCount - 1);
      assert.equal(room.navigationDeck.discardPile.length, initialDiscardCount + 1);
      assert.equal(room.navigationDeck.discardPile[room.navigationDeck.discardPile.length - 1].id, peekedCardId);
    });

    test('TELESCOPE: Người được chỉ định chọn GIỮ (KEEP)', () => {
      const { room, p1, p2 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_CARD_ACTION';
      room.executedNavigationCard = { color: 'RED', action: 'TELESCOPE' };

      ExecutionService.executeCardAction(room);
      ExecutionService.designateCardActionTarget(room, p1.sessionToken, p2.id);

      const initialDrawCount = room.navigationDeck.drawPile.length;
      const decisionResult = ExecutionService.resolveTelescopeDecision(room, p2.sessionToken, 'KEEP');
      assert.equal(decisionResult.decision, 'KEEP');
      assert.equal(room.navigationDeck.drawPile.length, initialDrawCount);
      assert.equal(decisionResult.nextPhase, 'ROUND_END');
    });
  });

  describe('UC-015: Cult Uprising (Nghi thức Tà giáo)', () => {
    test('startCultUprising (Step 1: Public Reveal): Rút lá Nghi thức và lưu trạng thái công khai cho cả phòng', () => {
      const { room, p1, p4 } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING';
      room.mapBoard.cultRitualDeck = ['CULT_CABIN_SEARCH'];

      const result = ExecutionService.startCultUprising(room);

      assert.equal(result.ritualCard, 'CULT_CABIN_SEARCH');
      assert.equal(result.nextPhase, 'CULT_UPRISING');
      assert.equal(room.gamePhase, 'CULT_UPRISING');
      assert.ok(room.revealedCultRitual);
      assert.equal(room.revealedCultRitual.type, 'CULT_CABIN_SEARCH');
      assert.equal(result.cultLeaderId, p4.id);
      assert.ok(result.inspectionData.captain);
      assert.ok(result.inspectionData.lieutenant);
      assert.ok(result.inspectionData.navigator);

      // Step 2: Thuyền trưởng xác nhận bắt đầu Màn đêm (CULT_UPRISING_BLIND)
      const nightResult = ExecutionService.startCultNight(room, p1.sessionToken);
      assert.equal(nightResult.nextPhase, 'CULT_UPRISING_BLIND');
      assert.equal(room.gamePhase, 'CULT_UPRISING_BLIND');
    });

    test('resolveCultGunsStash (AC-2): Cult Leader phân phát đúng 3 súng và bảo toàn ẩn danh', () => {
      const { room, p1, p3, p4 } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'GUNS_STASH', cultLeaderId: p4.id };

      const initialP1Guns = p1.gunCount;
      const initialP3Guns = p3.gunCount;

      const result = ExecutionService.resolveCultGunsStash(room, p4.sessionToken, [
        { playerId: p1.id, count: 2 },
        { playerId: p3.id, count: 1 }
      ]);

      assert.equal(result.success, true);
      assert.equal(result.nextPhase, 'ROUND_END');
      assert.equal(p1.gunCount, initialP1Guns + 2);
      assert.equal(p3.gunCount, initialP3Guns + 1);
      assert.equal(room.pendingCultRitual, null);
    });

    test('resolveCultGunsStash: Throw lỗi khi tổng số súng khác 3', () => {
      const { room, p1, p4 } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'GUNS_STASH', cultLeaderId: p4.id };

      assert.throws(() => {
        ExecutionService.resolveCultGunsStash(room, p4.sessionToken, [{ playerId: p1.id, count: 2 }]);
      }, /Tổng số súng cấp phải đúng bằng 3/);
    });

    test('resolveCultConversion (AC-3): Thu nạp mục tiêu thành CULTIST, lưu cờ miễn nhiễm và chuyển giao ID Cult Leader', () => {
      const { room, p2, p4 } = setupTestRoom(); // p2 là SAILOR
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'CONVERSION', cultLeaderId: p4.id };

      assert.equal(p2.factionRole, 'SAILOR');
      assert.equal(p2.isConvertible, true);

      const result = ExecutionService.resolveCultConversion(room, p4.sessionToken, p2.id);

      assert.equal(result.success, true);
      assert.equal(result.convertedPlayerId, p2.id);
      assert.equal(result.cultLeaderId, p4.id);
      assert.equal(p2.factionRole, 'CULTIST');
      assert.equal(p2.originalFactionRole, 'SAILOR');
      assert.equal(p2.isConvertible, false); // Không thể thu nạp thêm lần nữa
    });

    test('resolveCultConversion: Throw lỗi khi thu nạp người đã có cờ miễn nhiễm (isConvertible == false)', () => {
      const { room, p2, p4 } = setupTestRoom();
      p2.isConvertible = false; // Từng bị Cabin Search
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'CONVERSION', cultLeaderId: p4.id };

      assert.throws(() => {
        ExecutionService.resolveCultConversion(room, p4.sessionToken, p2.id);
      }, /Người chơi này đã được miễn nhiễm/);
    });

    test('resolveCultConversion: Cho phép kết thúc êm đẹp khi không có mục tiêu hợp lệ (targetPlayerId = null)', () => {
      const { room, p4 } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'CONVERSION', cultLeaderId: p4.id };

      const result = ExecutionService.resolveCultConversion(room, p4.sessionToken, null);

      assert.equal(result.success, true);
      assert.equal(result.noConversion, true);
      assert.equal(result.convertedPlayerId, null);
      assert.equal(result.nextPhase, 'ROUND_END');
      assert.equal(room.gamePhase, 'ROUND_END');
      assert.equal(room.pendingCultRitual, null);
    });

    test('resolveCultCabinSearch: Cult Leader hoàn tất thị kiến', () => {
      const { room, p4 } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'CULT_CABIN_SEARCH', cultLeaderId: p4.id };

      const result = ExecutionService.resolveCultCabinSearch(room, p4.sessionToken);
      assert.equal(result.success, true);
      assert.equal(result.nextPhase, 'ROUND_END');
      assert.equal(room.pendingCultRitual, null);
    });

    test('startCultUprising: Tự động bỏ qua và chuyển sang ROUND_END khi bộ bài ritual đã cạn', () => {
      const { room } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING';
      room.mapBoard.cultRitualDeck = [];

      const result = ExecutionService.startCultUprising(room);
      assert.equal(result.isDeckEmpty, true);
      assert.equal(result.nextPhase, 'ROUND_END');
      assert.equal(room.gamePhase, 'ROUND_END');
    });
  });

  describe('UC-013: Supply Line Gun Refill (AC-2)', () => {
    test('Cắt qua Tuyến tiếp tế sạc đầy 3 súng cho toàn bộ người chơi ACTIVE đang thiếu súng', () => {
      const { room, p2, p3, p4 } = setupTestRoom('LONG_JOURNEY');
      room.mapBoard = new MapBoard({
        roomId: room.id,
        mapMode: 'LONG_JOURNEY',
        shipPosition: 'L_R5_C2'
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
    test('Throw lỗi khi người không phải Thuyền trưởng cố thực thi Map Action', () => {
      const { room, p2, p3 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'CABIN_SEARCH' };

      assert.throws(() => {
        ExecutionService.executeMapAction(room, p2.sessionToken, p3.id);
      }, /Chỉ có Thuyền trưởng đương nhiệm/);
    });

    test('Throw lỗi khi Thuyền trưởng chọn chính mình làm mục tiêu', () => {
      const { room, p1 } = setupTestRoom();
      room.gamePhase = 'EXECUTE_MAP_ACTION';
      room.pendingMapAction = { type: 'CABIN_SEARCH' };

      assert.throws(() => {
        ExecutionService.executeMapAction(room, p1.sessionToken, p1.id);
      }, /Thuyền trưởng không thể chọn chính mình/);
    });

    test('Throw lỗi khi chỉ định người đã bị ELIMINATED cho Mermaid / Telescope', () => {
      const { room, p1, p3 } = setupTestRoom();
      p3.status = 'ELIMINATED';
      room.gamePhase = 'CARD_ACTION_TARGET_SELECTION';
      room.pendingCardAction = { type: 'MERMAID', captainId: p1.id };

      assert.throws(() => {
        ExecutionService.designateCardActionTarget(room, p1.sessionToken, p3.id);
      }, /Không thể chỉ định người chơi đã bị loại/);
    });

    test('Throw lỗi khi người không phải Cult Leader cố thu nạp giáo đồ', () => {
      const { room, p1, p2, p4 } = setupTestRoom();
      room.gamePhase = 'CULT_UPRISING_BLIND';
      room.pendingCultRitual = { type: 'CONVERSION', cultLeaderId: p4.id };

      assert.throws(() => {
        ExecutionService.resolveCultConversion(room, p1.sessionToken, p2.id);
      }, /Chỉ có Giáo chủ mới có quyền/);
    });
  });
});
