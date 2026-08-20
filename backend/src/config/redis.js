import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 1000,
    reconnectStrategy: false // Không retry vô tận nếu Redis chưa được bật
  }
});

redisClient.on('error', () => {});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('[Redis] Kết nối Redis Server thành công.');
    }
  } catch (err) {
    console.warn('[Redis] Không thể kết nối Redis. Hệ thống tự động chạy ở chế độ In-Memory.');
  }
};

export default redisClient;


