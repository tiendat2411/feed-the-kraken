import express from 'express';
import { createServer } from 'http';
import { setupSocket } from './src/socket/index.js';
import { connectRedis } from './src/config/redis.js';
import { RoomManager } from './src/services/RoomManager.js';

const app = express();
const server = createServer(app);

// Setup Socket.IO
setupSocket(server);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    await connectRedis();
    console.log('[Bootstrap] Redis connected.');
    
    // Khôi phục toàn bộ phòng từ Redis nếu có (Fault-tolerance / T036)
    await RoomManager.restoreAllRooms();
    
    server.listen(PORT, () => {
      console.log(`[Bootstrap] Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Bootstrap] Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
