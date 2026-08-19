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

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
      // Player is kept in RoomManager to allow reconnection. 
      // Handling actual player leave is an explicit action (e.g. 'leave_room' event).
    });
  });

  return io;
}
