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
      if (activeRoom && activeRoom.hostId === socket.sessionToken) {
        // T012 logic will be here for Role Distribution
        io.to(activeRoom.id).emit('room_state', activeRoom); // For now just return
      }
    });

    // LEAVE ROOM
    socket.on('leave_room', () => {
      // Not fully implemented in RoomManager yet (T011), but placeholder here
    });

    // KICK PLAYER
    socket.on('kick_player', ({ targetId }) => {
      // Not fully implemented in RoomManager yet (T011), but placeholder here
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
