import { Server } from 'socket.io';
import { RoomManager } from '../services/RoomManager.js';
import { MutinyService } from '../services/MutinyService.js';

/**
 * Gửi event bí mật tới một player cụ thể (qua sessionToken hoặc playerId)
 */
export function emitPrivate(io, roomId, targetTokenOrId, event, payload) {
  for (const [, clientSocket] of io.of('/').sockets) {
    if (clientSocket.sessionToken === targetTokenOrId || clientSocket.playerId === targetTokenOrId) {
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

