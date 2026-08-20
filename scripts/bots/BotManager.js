import { BotClient } from './BotClient.js';

export class BotManager {
  /**
   * Quản lý và điều phối đàn Bot ảo trong Sandbox
   * @param {Object} options
   * @param {string} [options.serverUrl] - URL máy chủ backend
   */
  constructor({ serverUrl = 'http://localhost:3001' } = {}) {
    this.serverUrl = serverUrl;
    this.roomId = null;
    this.bots = new Map(); // Map<number, BotClient>
    this.currentRoomState = null;
    this.globalAutoMode = true;
    this.isRunning = false;
    this._isShuttingDown = false;
  }

  /**
   * Khởi tạo và kết nối đồng loạt N bots vào phòng chơi
   * @param {Object} params
   * @param {string} [params.roomId] - Mã phòng mục tiêu
   * @param {number} [params.count=4] - Số lượng bot cần spawn (1..10)
   * @param {boolean} [params.createRoom=false] - Tự động tạo phòng mới nếu true
   * @param {string} [params.mapType='QUICK_JOURNEY'] - Loại bản đồ nếu tự tạo phòng
   * @returns {Promise<{ roomId: string, bots: BotClient[] }>}
   */
  async spawnBots({ roomId, count = 4, createRoom = false, mapType = 'QUICK_JOURNEY' } = {}) {
    this.isRunning = true;
    this.setupSignalHandlers();

    const botCount = Math.min(Math.max(1, count), 10);
    const startIndex = 1;

    console.log(`[BotManager] Đang chuẩn bị khởi tạo ${botCount} bots kết nối tới ${this.serverUrl}...`);

    if (createRoom) {
      // Bot 1 đóng vai trò Host tự tạo phòng
      const hostBot = new BotClient({ index: 1, serverUrl: this.serverUrl });
      await hostBot.connect();
      const createRes = await hostBot.createRoom(mapType);
      
      this.roomId = createRes.room?.id || hostBot.roomId;
      this.bots.set(1, hostBot);
      this._bindBotListeners(hostBot);

      console.log(`[BotManager] [Bot_1] Đã tạo phòng mới thành công với Mã phòng: ${this.roomId}`);

      // Các bot còn lại (từ bot 2 đến count) tham gia vào phòng vừa tạo
      for (let i = 2; i <= botCount; i++) {
        const bot = new BotClient({ index: i, serverUrl: this.serverUrl });
        await bot.connect();
        await bot.joinRoom(this.roomId);
        this.bots.set(i, bot);
        this._bindBotListeners(bot);
        console.log(`[BotManager] [Bot_${i}] Đã gia nhập phòng ${this.roomId} (${i}/${botCount})`);
      }
    } else {
      if (!roomId) {
        throw new Error('Vui lòng cung cấp mã phòng (roomId) hoặc bật cờ createRoom: true');
      }

      this.roomId = roomId.toUpperCase().trim();

      // Kết nối song song tất cả các bots vào phòng đã chỉ định
      const spawnPromises = [];
      for (let i = startIndex; i < startIndex + botCount; i++) {
        const bot = new BotClient({ index: i, serverUrl: this.serverUrl });
        const p = bot.connect()
          .then(() => bot.joinRoom(this.roomId))
          .then(() => {
            this.bots.set(i, bot);
            this._bindBotListeners(bot);
            console.log(`[BotManager] [Bot_${i}] Đã gia nhập phòng ${this.roomId} (${this.bots.size}/${botCount})`);
            return bot;
          });
        spawnPromises.push(p);
      }

      await Promise.all(spawnPromises);
    }

    console.log(`[BotManager] ✅ Đã kết nối thành công toàn bộ ${this.bots.size} bots vào phòng ${this.roomId}!`);

    return {
      roomId: this.roomId,
      bots: this.getAllBots()
    };
  }

  /**
   * Lắng nghe cập nhật trạng thái từ bot để lưu snapshot chung
   * @private
   */
  _bindBotListeners(bot) {
    bot.onStateChangeCallback = (roomState) => {
      this.currentRoomState = roomState;
    };
  }

  /**
   * Lấy instance bot theo số thứ tự (1..N)
   * @param {number} index 
   * @returns {BotClient|undefined}
   */
  getBot(index) {
    return this.bots.get(Number(index));
  }

  /**
   * Lấy danh sách tất cả các bot đang active
   * @returns {BotClient[]}
   */
  getAllBots() {
    return Array.from(this.bots.values());
  }

  /**
   * Lấy bảng Dashboard tóm tắt trạng thái của tất cả bot
   * @returns {Object[]}
   */
  getDashboard() {
    return this.getAllBots().map(bot => bot.getStatus());
  }

  /**
   * Bật/Tắt chế độ tự động phản hồi toàn cục
   * @param {boolean} enabled 
   */
  setGlobalAutoMode(enabled) {
    this.globalAutoMode = enabled;
    for (const bot of this.bots.values()) {
      bot.autoMode = enabled;
    }
  }

  /**
   * Bật/Tắt chế độ tự động cho 1 bot chỉ định
   * @param {number} index 
   * @param {boolean} enabled 
   */
  setBotAutoMode(index, enabled) {
    const bot = this.getBot(index);
    if (bot) {
      bot.autoMode = enabled;
    }
  }

  /**
   * Đăng ký xử lý tín hiệu thoát (Ctrl+C / SIGINT) để đóng kết nối an toàn
   */
  setupSignalHandlers() {
    if (this._signalHandlersRegistered) return;
    this._signalHandlersRegistered = true;

    const handleExit = async () => {
      if (this._isShuttingDown) return;
      this._isShuttingDown = true;
      console.log('\n[BotManager] Đang ngắt kết nối an toàn cho tất cả các Bots...');
      await this.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  }

  /**
   * Rời phòng và ngắt kết nối toàn bộ bots
   */
  async shutdown() {
    for (const bot of this.bots.values()) {
      try {
        bot.leaveRoom();
        bot.disconnect();
      } catch (err) {
        // Silent error on shutdown
      }
    }
    this.bots.clear();
    this.isRunning = false;
    console.log('[BotManager] Toàn bộ bots đã rời phòng và ngắt kết nối socket an toàn.');
  }
}

export default BotManager;
