import { Server } from 'socket.io';
import { RoomManager } from '../services/RoomManager.js';

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
    const sessionToken = socket.handshake.auth.token;
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
        
        // 1. Broadcast trạng thái phòng mới (Sanitized - không lộ role của người khác)
        broadcastRoomState(io, room);

        // 2. Gửi riêng vai trò ẩn (ROLE_ASSIGNED) cho từng người chơi
        room.getPlayers().forEach((player) => {
          emitPrivate(io, room.id, player.sessionToken, 'ROLE_ASSIGNED', {
            role: player.factionRole
          });
        });

        // 3. Thông báo game bắt đầu cho toàn phòng
        io.to(room.id).emit('GAME_STARTED', {
          mapType: room.mapType,
          totalPlayers: room.getPlayers().length,
          currentPhase: room.gamePhase
        });

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

