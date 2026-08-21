import { Server } from 'socket.io';
import { RoomManager } from '../services/RoomManager.js';
import { MutinyService } from '../services/MutinyService.js';
import { NavigationService } from '../services/NavigationService.js';
import { ExecutionService } from '../services/ExecutionService.js';

/**
 * Gửi event bí mật tới một player cụ thể (qua sessionToken hoặc playerId)
 */
export function emitPrivate(io, roomId, targetTokenOrId, event, payload) {
  let targetToken = targetTokenOrId;
  let targetId = targetTokenOrId;

  if (roomId) {
    const room = RoomManager.getRoomInstance(roomId);
    if (room) {
      const player = room.getPlayer(targetTokenOrId) || room.getPlayerByToken(targetTokenOrId);
      if (player) {
        targetToken = player.sessionToken;
        targetId = player.id;
      }
    }
  }

  for (const [, clientSocket] of io.of('/').sockets) {
    if (
      clientSocket.sessionToken === targetToken ||
      clientSocket.sessionToken === targetId ||
      clientSocket.playerId === targetId ||
      clientSocket.playerId === targetToken
    ) {
      clientSocket.emit(event, payload);
    }
  }
}

/**
 * Broadcast trạng thái phòng đã được lọc bảo mật (Sanitized State) cho từng client
 */
export function broadcastRoomState(io, room) {
  if (!room) return;
  for (const [, clientSocket] of io.of('/').sockets) {
    // Chỉ gửi cho các socket đang ở trong room này
    if (clientSocket.rooms.has(room.id)) {
      const sanitized = room.toSanitizedJSON(clientSocket.sessionToken);
      clientSocket.emit('room_state', sanitized);
    }
  }
}

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // For development. Adjust to specific domain in production.
      methods: ['GET', 'POST']
    }
  });

  // Middleware for session authentication
  io.use((socket, next) => {
    const sessionToken = socket.handshake.auth.token || socket.handshake.auth.sessionToken;
    if (!sessionToken) {
      return next(new Error('Authentication error: sessionToken is required'));
    }
    socket.sessionToken = sessionToken;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id} | Token: ${socket.sessionToken}`);

    // Automatically reconnect if player is in an active room
    const activeRoom = RoomManager.reconnectPlayer(socket.sessionToken, socket.id);
    if (activeRoom) {
      socket.join(activeRoom.id);
      const sanitized = activeRoom.toSanitizedJSON(socket.sessionToken);
      socket.emit('room_state', sanitized);

      // Nếu đang trong lượt bốc bài và người này đang giữ bài trên tay -> gửi lại bài riêng tư
      const mePlayer = activeRoom.getPlayerByToken(socket.sessionToken);
      if (mePlayer && activeRoom.navigationHand && activeRoom.navigationHand.playerId === mePlayer.id) {
        socket.emit('CARDS_DRAWN_SECRET', {
          role: activeRoom.navigationHand.role,
          cards: activeRoom.navigationHand.cards
        });
      }

      broadcastRoomState(io, activeRoom);
      console.log(`[Socket Reconnected] Token: ${socket.sessionToken} reconnected to Room: ${activeRoom.id}`);
    }

    // CREATE ROOM
    socket.on('create_room', async ({ playerName }, callback) => {
      try {
        const roomData = await RoomManager.createRoom(socket.sessionToken, playerName, socket.id);
        const roomInstance = RoomManager.getRoomInstance(roomData.id);
        socket.join(roomData.id);
        const sanitized = roomInstance ? roomInstance.toSanitizedJSON(socket.sessionToken) : roomData;
        if (typeof callback === 'function') callback({ success: true, room: sanitized });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // JOIN ROOM
    socket.on('join_room', async ({ roomId, playerName }, callback) => {
      try {
        await RoomManager.joinRoom(roomId, socket.sessionToken, playerName, socket.id);
        const roomInstance = RoomManager.getRoomInstance(roomId);
        socket.join(roomId);
        
        // Broadcast the sanitized state to everyone in the room
        if (roomInstance) {
          broadcastRoomState(io, roomInstance);
        }
        if (typeof callback === 'function') {
          callback({ success: true, room: roomInstance ? roomInstance.toSanitizedJSON(socket.sessionToken) : null });
        }
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // GET ROOM STATE (Fetch current snapshot without F5 / reload)
    socket.on('get_room_state', ({ roomId }, callback) => {
      try {
        let roomInstance = null;
        if (roomId) {
          roomInstance = RoomManager.getRoomInstance(roomId.toUpperCase());
        }
        if (!roomInstance) {
          const found = RoomManager.getRoomByToken(socket.sessionToken);
          if (found) roomInstance = found.room;
        }

        if (roomInstance) {
          socket.join(roomInstance.id);
          const sanitized = roomInstance.toSanitizedJSON(socket.sessionToken);
          socket.emit('room_state', sanitized);

          // Nếu đang trong lượt bốc bài và người này đang giữ bài trên tay -> gửi lại bài riêng tư
          const mePlayer = roomInstance.getPlayerByToken(socket.sessionToken);
          if (mePlayer && roomInstance.navigationHand && roomInstance.navigationHand.playerId === mePlayer.id) {
            socket.emit('CARDS_DRAWN_SECRET', {
              role: roomInstance.navigationHand.role,
              cards: roomInstance.navigationHand.cards
            });
          }

          if (typeof callback === 'function') callback({ success: true, room: sanitized });
        } else {
          if (typeof callback === 'function') callback({ success: false, error: 'Phòng không tồn tại hoặc đã bị giải tán' });
        }
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // UPDATE AVATAR
    socket.on('update_avatar', ({ avatar }) => {
      const activeRoom = RoomManager.reconnectPlayer(socket.sessionToken, socket.id);
      if (activeRoom) {
        RoomManager.updateAvatar(activeRoom.id, socket.sessionToken, avatar);
        const roomInstance = RoomManager.getRoomInstance(activeRoom.id);
        if (roomInstance) broadcastRoomState(io, roomInstance);
      }
    });

    // UPDATE MAP
    socket.on('update_map', ({ mapType }) => {
      const activeRoom = RoomManager.reconnectPlayer(socket.sessionToken, socket.id);
      if (activeRoom) {
        RoomManager.updateMapType(activeRoom.id, socket.sessionToken, mapType);
        const roomInstance = RoomManager.getRoomInstance(activeRoom.id);
        if (roomInstance) broadcastRoomState(io, roomInstance);
      }
    });

    // START GAME & ROLE DISTRIBUTION
    socket.on('start_game', async (callback) => {
      try {
        const { room } = await RoomManager.startGame(socket.sessionToken);
        
        // 1. Broadcast trạng thái phòng mới (Sanitized - chỉ Pirate thấy knownPirates)
        broadcastRoomState(io, room);

        // 2. Gửi riêng vai trò ẩn (ROLE_ASSIGNED) cho từng người chơi
        room.getPlayers().forEach((player) => {
          emitPrivate(io, room.id, player.sessionToken, 'ROLE_ASSIGNED', {
            role: player.factionRole
          });
        });

        // 3. Thông báo phase ban đêm 20s bắt đầu
        io.to(room.id).emit('NIGHT_PHASE_STARTED', {
          duration: 20,
          phaseDeadline: room.phaseDeadline
        });

        // 4. Tự động chuyển phase sau 20 giây (Server-driven, không phụ thuộc client hay Host)
        setTimeout(() => {
          const currentRoom = RoomManager.getRoomInstance(room.id);
          if (currentRoom && currentRoom.status === 'IN_GAME' && currentRoom.gamePhase === 'PIRATES_GATHERING') {
            currentRoom.gamePhase = 'DAY_1_CREW_SELECTION';
            currentRoom.phaseDeadline = null;
            RoomManager.saveSnapshot(currentRoom.id);

            broadcastRoomState(io, currentRoom);
            io.to(currentRoom.id).emit('DAY_PHASE_STARTED', {
              captainId: currentRoom.captainId
            });
            console.log(`[Game Phase] Room ${currentRoom.id} auto-transitioned to DAY_1_CREW_SELECTION`);
          }
        }, 20000);

        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // LEAVE ROOM
    socket.on('leave_room', async (callback) => {
      try {
        const result = await RoomManager.leaveRoom(socket.sessionToken);
        if (result) {
          socket.leave(result.roomId);
          if (result.isDissolved) {
            io.to(result.roomId).emit('ROOM_DISSOLVED', { reason: 'Người chơi cuối cùng đã rời phòng.' });
          } else {
            io.to(result.roomId).emit('PLAYER_LEFT', { player_id: result.leftPlayerId });
            broadcastRoomState(io, result.room);
          }
        }
        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // KICK PLAYER
    socket.on('kick_player', async ({ targetId }, callback) => {
      try {
        const result = await RoomManager.kickPlayer(socket.sessionToken, targetId);
        if (result) {
          // Gửi thông báo trực tiếp cho người bị kick
          for (const [, clientSocket] of io.of('/').sockets) {
            if (clientSocket.sessionToken === result.kickedPlayerToken) {
              clientSocket.emit('PLAYER_KICKED', { reason: 'Bạn đã bị Chủ phòng kick khỏi phòng.' });
              clientSocket.leave(result.roomId);
            }
          }

          // Broadcast cho những người còn lại
          io.to(result.roomId).emit('PLAYER_LEFT', { player_id: result.kickedPlayerId });
          broadcastRoomState(io, result.room);
        }
        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // DISSOLVE ROOM
    socket.on('dissolve_room', async (callback) => {
      try {
        const result = await RoomManager.dissolveRoom(socket.sessionToken);
        if (result && result.isDissolved) {
          io.to(result.roomId).emit('ROOM_DISSOLVED', { reason: 'Chủ phòng đã giải tán phòng.' });
          io.in(result.roomId).socketsLeave(result.roomId);
        }
        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // APPOINT NAVIGATION TEAM (UC-006)
    socket.on('appoint_team', async ({ lieutenantId, navigatorId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = MutinyService.appointTeam(room, socket.sessionToken, lieutenantId, navigatorId);
        await RoomManager.saveSnapshot(room.id);

        broadcastRoomState(io, room);

        if (result.autoSkipped) {
          io.to(room.id).emit('MUTINY_AUTO_SKIPPED', {
            reason: 'Không có người chơi nào sở hữu súng để biểu quyết',
            lieutenantId,
            navigatorId
          });
        } else {
          io.to(room.id).emit('TEAM_PROPOSED', {
            proposed_lieutenant_id: lieutenantId,
            proposed_navigator_id: navigatorId
          });
          io.to(room.id).emit('MUTINY_VOTE_STARTED', {
            duration: 90,
            requiredGuns: result.session.requiredGuns
          });
        }

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // SUBMIT MUTINY VOTE (UC-007)
    socket.on('submit_mutiny_vote', async ({ gunCount }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const voteResult = MutinyService.submitVote(room, socket.sessionToken, gunCount);
        await RoomManager.saveSnapshot(room.id);

        // Broadcast thông báo đã sẵn sàng (ẩn số súng)
        io.to(room.id).emit('PLAYER_VOTED_READY', {
          player_id: voteResult.voterId,
          voterName: voteResult.voterName
        });
        broadcastRoomState(io, room);

        // Tự động phân giải kết quả khi tất cả người chơi hợp lệ đã vote xong
        if (voteResult.isVotingComplete) {
          const resolution = MutinyService.resolveMutiny(room);
          await RoomManager.saveSnapshot(room.id);

          io.to(room.id).emit('MUTINY_REVEALED', {
            votes: resolution.session.votes,
            totalGuns: resolution.totalGuns
          });

          io.to(room.id).emit('MUTINY_RESULT', resolution);
          broadcastRoomState(io, room);
        }

        if (typeof callback === 'function') callback({ success: true, voteResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // MANUAL / TIMEOUT MUTINY RESOLUTION (UC-008)
    socket.on('resolve_mutiny', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const resolution = MutinyService.resolveMutiny(room);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('MUTINY_REVEALED', {
          votes: resolution.session.votes,
          totalGuns: resolution.totalGuns
        });

        io.to(room.id).emit('MUTINY_RESULT', resolution);
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, resolution });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // ELIMINATE TIE CANDIDATE (UC-008 Alt 1b)
    socket.on('eliminate_tie_candidate', async ({ targetCandidateId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const stepResult = MutinyService.eliminateTieCandidate(room, socket.sessionToken, targetCandidateId);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('TIE_CANDIDATE_ELIMINATED', stepResult);
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, stepResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // CONFIRM MUTINY OUTCOME & ADVANCE (Constitution Game Pace - Captain Button)
    socket.on('confirm_mutiny_outcome', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = MutinyService.confirmMutinyOutcome(room, socket.sessionToken);

        // Nếu tiến vào giai đoạn NAVIGATION -> tự động rút 2 thẻ đầu cho Captain
        if (result.nextPhase === 'NAVIGATION') {
          const navResult = NavigationService.startNavigation(room);
          emitPrivate(io, room.id, room.captainId, 'CARDS_DRAWN_SECRET', {
            role: 'CAPTAIN',
            cards: navResult.cards
          });
          io.to(room.id).emit('CAPTAIN_DRAWING', { captainId: room.captainId, timeout: 60 });
        }

        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('MUTINY_OUTCOME_CONFIRMED', {
          nextPhase: result.nextPhase,
          captainId: result.captainId,
          lieutenantId: result.lieutenantId,
          navigatorId: result.navigatorId
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // START NAVIGATION (UC-009)
    socket.on('start_navigation', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const navResult = NavigationService.startNavigation(room);
        await RoomManager.saveSnapshot(room.id);

        emitPrivate(io, room.id, room.captainId, 'CARDS_DRAWN_SECRET', {
          role: 'CAPTAIN',
          cards: navResult.cards
        });
        io.to(room.id).emit('CAPTAIN_DRAWING', { captainId: room.captainId, timeout: 60 });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, navResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // CAPTAIN SELECT CARD (UC-009)
    socket.on('captain_select_card', async ({ keptCardId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const ltResult = NavigationService.captainSelectCard(room, socket.sessionToken, keptCardId);
        await RoomManager.saveSnapshot(room.id);

        emitPrivate(io, room.id, room.lieutenantId, 'CARDS_DRAWN_SECRET', {
          role: 'LIEUTENANT',
          cards: ltResult.cards
        });
        io.to(room.id).emit('LIEUTENANT_DRAWING', { lieutenantId: room.lieutenantId, timeout: 60 });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, ltResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // LIEUTENANT SELECT CARD (UC-009, UC-010)
    socket.on('lieutenant_select_card', async ({ keptCardId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const navResult = NavigationService.lieutenantSelectCard(room, socket.sessionToken, keptCardId);
        await RoomManager.saveSnapshot(room.id);

        emitPrivate(io, room.id, room.navigatorId, 'NAVIGATOR_CARDS_SECRET', {
          role: 'NAVIGATOR',
          cards: navResult.cards
        });
        io.to(room.id).emit('NAVIGATOR_DRAWING', { navigatorId: room.navigatorId, timeout: 60 });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, navResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // NAVIGATOR SELECT CARD (UC-010, UC-012)
    socket.on('navigator_select_card', async ({ chosenCardId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const execResult = NavigationService.navigatorSelectCard(room, socket.sessionToken, chosenCardId);

        // Thông báo lá bài điều hướng được thực thi
        io.to(room.id).emit('NAVIGATION_CARD_EXECUTED', {
          card: execResult.chosenCard
        });

        // Kích hoạt di chuyển tàu trên bản đồ lục giác (UC-012)
        const moveResult = ExecutionService.executeShipMovement(room);
        await RoomManager.saveSnapshot(room.id);

        // Broadcast sự kiện tàu di chuyển
        io.to(room.id).emit('SHIP_MOVED', {
          previousNode: moveResult.previousNode,
          currentNode: moveResult.currentNode,
          cardColor: moveResult.cardColor,
          visitedNodes: room.mapBoard?.visitedNodes || [],
          crossedSupplyLine: moveResult.crossedSupplyLine,
          isGameOver: moveResult.isGameOver,
          winnerFaction: moveResult.winnerFaction,
          nextPhase: moveResult.nextPhase
        });

        // Nếu cắt qua đường tiếp tế -> Broadcast thông báo nạp súng
        if (moveResult.crossedSupplyLine) {
          io.to(room.id).emit('SUPPLY_LINE_CROSSED', {
            refilledPlayerIds: moveResult.supplyLineRefilledPlayers
          });
        }

        // Nếu trò chơi kết thúc -> Broadcast sự kiện GAME_OVER
        if (moveResult.isGameOver) {
          io.to(room.id).emit('GAME_OVER', {
            winnerFaction: moveResult.winnerFaction,
            winReason: moveResult.winReason,
            terminalNode: moveResult.currentNode
          });
        }

        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, execResult, moveResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // NAVIGATOR JUMP OVERBOARD (UC-011)
    socket.on('navigator_jump_overboard', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const obResult = NavigationService.navigatorJumpOverboard(room, socket.sessionToken);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('NAVIGATOR_JUMPED_OVERBOARD', {
          eliminatedPlayerId: obResult.eliminatedNavigatorId,
          eliminatedPlayerName: obResult.eliminatedNavigatorName
        });
        io.to(room.id).emit('EMERGENCY_NAVIGATOR_SELECTION', {
          captainId: obResult.captainId
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, obResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // APPOINT EMERGENCY NAVIGATOR (UC-011)
    socket.on('appoint_emergency_navigator', async ({ newNavigatorId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const newRound = NavigationService.appointEmergencyNavigator(room, socket.sessionToken, newNavigatorId);
        await RoomManager.saveSnapshot(room.id);

        emitPrivate(io, room.id, room.captainId, 'CARDS_DRAWN_SECRET', {
          role: 'CAPTAIN',
          cards: newRound.cards
        });
        io.to(room.id).emit('EMERGENCY_NAVIGATOR_APPOINTED', { newNavigatorId });
        io.to(room.id).emit('CAPTAIN_DRAWING', { captainId: room.captainId, timeout: 60 });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, newRound });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // EXECUTE MAP ACTION (UC-013)
    socket.on('execute_map_action', async ({ targetPlayerId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const actionResult = ExecutionService.executeMapAction(room, socket.sessionToken, targetPlayerId);
        await RoomManager.saveSnapshot(room.id);

        const { resultPayload, isGameOver, winnerFaction } = actionResult;

        // Nếu là hành động bí mật (CABIN_SEARCH) -> Gửi kết quả riêng cho Captain
        if (resultPayload.isPrivate) {
          emitPrivate(io, room.id, room.captainId, 'CABIN_SEARCH_RESULT', {
            targetId: resultPayload.targetId,
            targetName: resultPayload.targetName,
            result: resultPayload.privateResult
          });
        }

        // Broadcast sự kiện Map Action được thực thi cho toàn phòng
        io.to(room.id).emit('MAP_ACTION_EXECUTED', {
          actionType: resultPayload.actionType,
          targetId: resultPayload.targetId,
          targetName: resultPayload.targetName,
          publicMessage: resultPayload.publicMessage,
          publicStatement: resultPayload.publicStatement || null
        });

        // Nếu kích hoạt End Game (Feed the Kraken trúng Cult Leader)
        if (isGameOver) {
          io.to(room.id).emit('GAME_OVER', {
            winnerFaction,
            winReason: resultPayload.winReason,
            actionType: resultPayload.actionType
          });
        }

        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, actionResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // CONFIRM MAP ACTION & ADVANCE (UC-013 Game Pace -> UC-014 Card Actions)
    socket.on('confirm_map_action', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const advanceResult = ExecutionService.confirmMapActionAndAdvance(room, socket.sessionToken);

        // Tự động kích hoạt Card Action sau khi xác nhận Map Action
        const cardActionResult = ExecutionService.executeCardAction(room);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('MAP_ACTION_CONFIRMED', {
          nextPhase: cardActionResult.nextPhase,
          cardAction: advanceResult.cardAction
        });

        io.to(room.id).emit('CARD_ACTION_EXECUTED', {
          actionType: cardActionResult.actionType,
          publicMessage: cardActionResult.publicMessage,
          nextPhase: cardActionResult.nextPhase,
          requiresTargetSelection: cardActionResult.requiresTargetSelection || false,
          captainId: cardActionResult.captainId || null,
          newCaptainId: cardActionResult.newCaptainId || null
        });

        if (cardActionResult.requiresTargetSelection) {
          io.to(room.id).emit('CARD_ACTION_TARGET_SELECTION_STARTED', {
            action: cardActionResult.actionType,
            captainId: cardActionResult.captainId
          });
        }

        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, advanceResult, cardActionResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // EXECUTE CARD ACTION (UC-014)
    socket.on('execute_card_action', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const cardActionResult = ExecutionService.executeCardAction(room);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('CARD_ACTION_EXECUTED', {
          actionType: cardActionResult.actionType,
          publicMessage: cardActionResult.publicMessage,
          nextPhase: cardActionResult.nextPhase,
          requiresTargetSelection: cardActionResult.requiresTargetSelection || false,
          captainId: cardActionResult.captainId || null,
          newCaptainId: cardActionResult.newCaptainId || null
        });

        if (cardActionResult.requiresTargetSelection) {
          io.to(room.id).emit('CARD_ACTION_TARGET_SELECTION_STARTED', {
            action: cardActionResult.actionType,
            captainId: cardActionResult.captainId
          });
        }

        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, cardActionResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // DESIGNATE CARD ACTION TARGET (Mermaid / Telescope - UC-014 AC-2)
    socket.on('designate_card_action_target', async ({ targetPlayerId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.designateCardActionTarget(room, socket.sessionToken, targetPlayerId);
        await RoomManager.saveSnapshot(room.id);

        // Công khai người được chỉ định cho toàn phòng
        io.to(room.id).emit('CARD_ACTION_TARGET_DESIGNATED', {
          actionType: result.actionType,
          targetPlayerId: result.targetPlayerId,
          targetPlayerName: result.targetPlayerName,
          publicMessage: result.publicMessage
        });

        // Gửi dữ liệu bí mật chỉ riêng cho người được chỉ định
        if (result.actionType === 'MERMAID') {
          emitPrivate(io, room.id, result.targetPlayerId, 'MERMAID_DATA', {
            cards: result.cards
          });
        } else if (result.actionType === 'TELESCOPE') {
          emitPrivate(io, room.id, result.targetPlayerId, 'TELESCOPE_DATA', {
            card: result.card
          });
        }

        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // RESOLVE TELESCOPE DECISION (UC-014 AC-3)
    socket.on('resolve_telescope_decision', async ({ decision }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.resolveTelescopeDecision(room, socket.sessionToken, decision);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('TELESCOPE_DECISION_RESOLVED', {
          decision: result.decision,
          publicMessage: result.publicMessage,
          nextPhase: result.nextPhase
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // ACKNOWLEDGE MERMAID INSPECTION (UC-014 AC-2)
    socket.on('acknowledge_mermaid', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.acknowledgeMermaidInspection(room, socket.sessionToken);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('MERMAID_INSPECTION_COMPLETED', {
          publicMessage: result.publicMessage,
          nextPhase: result.nextPhase
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // START CULT UPRISING (UC-015)
    socket.on('start_cult_uprising', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.startCultUprising(room);
        await RoomManager.saveSnapshot(room.id);

        if (result.ritualCard) {
          // Công khai loại bài Nghi thức vừa lật mở (AC-1)
          io.to(room.id).emit('CULT_RITUAL_REVEALED', {
            card_action: result.ritualCard,
            ritualName: result.ritualName
          });

          // Kích hoạt màn hình mù cho toàn phòng (Không chứa bất kỳ ID của Cult Leader nào - Anti-Sniffing AC-1)
          io.to(room.id).emit('CULT_UPRISING_STARTED', {});

          // Gửi riêng dữ liệu thị kiến ban điều hướng cho Cult Leader nếu là CULT_CABIN_SEARCH
          if (result.inspectionData && result.cultLeaderId) {
            emitPrivate(io, room.id, result.cultLeaderId, 'CULT_CABIN_SEARCH_DATA', {
              inspectionData: result.inspectionData
            });
          }
        } else {
          io.to(room.id).emit('CULT_UPRISING_ENDED', {
            publicMessage: result.publicMessage
          });
        }

        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // RESOLVE CULT GUNS STASH (UC-015 AC-2)
    socket.on('resolve_cult_guns_stash', async ({ allocations }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.resolveCultGunsStash(room, socket.sessionToken, allocations);
        await RoomManager.saveSnapshot(room.id);

        // Kết thúc màn hình mù và thông báo cập nhật súng ẩn danh
        io.to(room.id).emit('CULT_UPRISING_ENDED', {
          publicMessage: result.publicMessage
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // RESOLVE CULT CABIN SEARCH (UC-015)
    socket.on('resolve_cult_cabin_search', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.resolveCultCabinSearch(room, socket.sessionToken);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('CULT_UPRISING_ENDED', {
          publicMessage: result.publicMessage
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // RESOLVE CULT CONVERSION (UC-015 AC-3)
    socket.on('resolve_cult_conversion', async ({ targetPlayerId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = ExecutionService.resolveCultConversion(room, socket.sessionToken, targetPlayerId);
        await RoomManager.saveSnapshot(room.id);

        // GỬI RIÊNG THÔNG BÁO CHO NẠN NHÂN VỪA ĐƯỢC THU NẠP (AC-3)
        emitPrivate(io, room.id, result.convertedPlayerId, 'CULTIST_CONVERTED', {
          message: 'Bạn đã được Giáo chủ thu nạp vào Hội Tà Giáo (Cultist)!',
          cult_leader_id: result.cultLeaderId,
          cult_leader_name: result.cultLeaderName
        });

        // Kết thúc màn hình mù cho toàn phòng
        io.to(room.id).emit('CULT_UPRISING_ENDED', {
          publicMessage: result.publicMessage
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // CHECK MUTINY TIMEOUT (Auto-resolve offline voters when timer ends)
    socket.on('check_mutiny_timeout', async (callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const timeoutResult = MutinyService.autoResolveOfflineVoters(room);
        if (timeoutResult) {
          await RoomManager.saveSnapshot(room.id);
          broadcastRoomState(io, room);
        }

        if (typeof callback === 'function') callback({ success: true, timeoutResult });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // APPLY CUT TONGUE / SPEECH RESTRICTION (BR-002 / BR-004)
    socket.on('cut_tongue', async ({ targetPlayerId }, callback) => {
      try {
        const found = RoomManager.getRoomByToken(socket.sessionToken);
        if (!found) throw new Error('Bạn chưa tham gia phòng nào');

        const { room } = found;
        const result = MutinyService.applyCutTongue(room, socket.sessionToken, targetPlayerId);
        await RoomManager.saveSnapshot(room.id);

        io.to(room.id).emit('PLAYER_SPEECH_RESTRICTED', {
          targetId: result.targetId,
          targetName: result.targetName
        });
        broadcastRoomState(io, room);

        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
      const updatedRoom = RoomManager.disconnectPlayer(socket.sessionToken);
      if (updatedRoom) {
        broadcastRoomState(io, updatedRoom);
      }
    });
  });

  return io;
}

