import { Server } from 'socket.io';
import { RoomManager } from '../services/RoomManager.js';

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
      socket.emit('room_state', activeRoom);
      console.log(`[Socket Reconnected] Token: ${socket.sessionToken} reconnected to Room: ${activeRoom.id}`);
    }

    // CREATE ROOM
    socket.on('create_room', async ({ playerName }, callback) => {
      try {
        const room = await RoomManager.createRoom(socket.sessionToken, playerName, socket.id);
        socket.join(room.id);
        callback({ success: true, room });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // JOIN ROOM
    socket.on('join_room', async ({ roomId, playerName }, callback) => {
      try {
        const room = await RoomManager.joinRoom(roomId, socket.sessionToken, playerName, socket.id);
        socket.join(room.id);
        // Broadcast the updated state to everyone in the room
        io.to(room.id).emit('room_state', room);
        callback({ success: true, room });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // UPDATE AVATAR
    socket.on('update_avatar', ({ avatar }) => {
      const activeRoom = RoomManager.reconnectPlayer(socket.sessionToken, socket.id);
      if (activeRoom) {
        const updatedRoom = RoomManager.updateAvatar(activeRoom.id, socket.sessionToken, avatar);
        io.to(activeRoom.id).emit('room_state', updatedRoom);
      }
    });

    // UPDATE MAP
    socket.on('update_map', ({ mapType }) => {
      const activeRoom = RoomManager.reconnectPlayer(socket.sessionToken, socket.id);
      if (activeRoom) {
        const updatedRoom = RoomManager.updateMapType(activeRoom.id, socket.sessionToken, mapType);
        if (updatedRoom) io.to(activeRoom.id).emit('room_state', updatedRoom);
      }
    });

    // START GAME
    socket.on('start_game', () => {
      const activeRoom = RoomManager.reconnectPlayer(socket.sessionToken, socket.id);
      if (activeRoom) {
        // T012 logic will be here for Role Distribution
        io.to(activeRoom.id).emit('room_state', activeRoom);
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
            io.to(result.roomId).emit('room_state', result.room);
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
          io.to(result.roomId).emit('room_state', result.room);
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
        io.to(updatedRoom.id).emit('room_state', updatedRoom);
      }
    });
  });

  return io;
}
