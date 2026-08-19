import { randomBytes } from 'crypto';
import redisClient from '../config/redis.js';

// In-memory store for fast access
// Map<roomId, roomState>
const rooms = new Map();

const generateRoomId = () => randomBytes(2).toString('hex').toUpperCase();

export class RoomManager {
  static async createRoom(hostToken, hostName, socketId) {
    let roomId;
    do {
      roomId = generateRoomId();
    } while (rooms.has(roomId));

    const newRoom = {
      id: roomId,
      hostId: hostToken,
      players: [
        {
          id: hostToken,
          name: hostName,
          socketId,
          isHost: true,
        }
      ],
      state: 'LOBBY',
    };

    rooms.set(roomId, newRoom);
    await this.saveSnapshot(roomId);
    return newRoom;
  }

  static async joinRoom(roomId, playerToken, playerName, socketId) {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.state !== 'LOBBY') {
      throw new Error('Cannot join a game in progress');
    }

    const existingPlayer = room.players.find(p => p.id === playerToken);
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      existingPlayer.name = playerName; // update name just in case
    } else {
      room.players.push({
        id: playerToken,
        name: playerName,
        socketId,
        isHost: false,
      });
    }

    await this.saveSnapshot(roomId);
    return room;
  }

  static getRoom(roomId) {
    return rooms.get(roomId);
  }

  static reconnectPlayer(playerToken, socketId) {
    for (const [roomId, room] of rooms.entries()) {
      const player = room.players.find(p => p.id === playerToken);
      if (player) {
        player.socketId = socketId;
        return room;
      }
    }
    return null;
  }

  static removePlayerFromRoom(roomId, playerToken) {
    const room = rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerToken);
    
    if (room.players.length === 0) {
      rooms.delete(roomId);
      if (redisClient.isOpen) {
        redisClient.del(`room:${roomId}`).catch(console.error);
      }
      return null;
    } else if (room.hostId === playerToken) {
      // Reassign host to the next person
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
    }

    this.saveSnapshot(roomId);
    return room;
  }

  static async saveSnapshot(roomId) {
    const room = rooms.get(roomId);
    if (room && redisClient.isOpen) {
      try {
        await redisClient.set(`room:${roomId}`, JSON.stringify(room));
      } catch (err) {
        console.error('Failed to save snapshot to Redis:', err);
      }
    }
  }
}
