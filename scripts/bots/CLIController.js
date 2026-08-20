import readline from 'readline';

export class CLIController {
  /**
   * Bộ điều khiển giao diện dòng lệnh tương tác (Interactive CLI Sandbox)
   * @param {Object} options
   * @param {BotManager} options.botManager - Instance BotManager quản lý đàn bot
   */
  constructor({ botManager }) {
    this.botManager = botManager;
    this.rl = null;
    this.promptString = '\x1b[36mftk-sandbox > \x1b[0m';
  }

  /**
   * Bắt đầu phiên nhập lệnh tương tác qua Terminal (readline)
   */
  start() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: this.promptString
    });

    this.printBanner();

    this.rl.on('line', async (line) => {
      const input = line.trim();
      if (input) {
        await this.handleCommand(input);
      }
      if (this.rl) {
        this.rl.prompt();
      }
    });

    this.rl.on('close', async () => {
      console.log('\n[CLI] Đang đóng Sandbox...');
      await this.botManager.shutdown();
      process.exit(0);
    });

    this.rl.prompt();
  }

  /**
   * In bảng hướng dẫn lệnh
   */
  printBanner() {
    console.log(`
┌─────────────────────────────────────────────────────────────┐
│ 🎮 FTK SANDBOX CLI CONTROLLER - SẴN SÀNG NHẬN LỆNH        │
├─────────────────────────────────────────────────────────────┤
│ • status                         - Xem trạng thái đàn Bot  │
│ • auto [on|off] [bot#]           - Bật/Tắt chế độ tự động │
│ • bot <id> vote <guns>           - Ép bot bỏ phiếu Mutiny  │
│ • bot <id> appoint <lt#> <nav#>  - Ép Captain bổ nhiệm     │
│ • bot <id> choose <RED|BLUE|YEL> - Ép chọn thẻ điều hướng  │
│ • start                          - Host bấm Start Game     │
│ • help                           - Xem lại danh sách lệnh  │
│ • exit                           - Thoát và dọn dẹp phòng  │
└─────────────────────────────────────────────────────────────┘
`);
  }

  /**
   * Xử lý và phân tích cú pháp lệnh từ người dùng
   * @param {string} input 
   */
  async handleCommand(input) {
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    try {
      switch (cmd) {
        case 'help':
        case '?':
          this.printBanner();
          break;

        case 'status':
        case 'ls':
        case 'dashboard':
          this.printStatus();
          break;

        case 'start':
        case 'startgame':
          await this.handleStartGame();
          break;

        case 'auto':
          this.handleAutoToggle(parts.slice(1));
          break;

        case 'bot':
          await this.handleBotAction(parts.slice(1));
          break;

        case 'exit':
        case 'quit':
          console.log('[CLI] Đang đóng phiên Sandbox...');
          await this.botManager.shutdown();
          process.exit(0);
          break;

        default:
          console.log(`\x1b[31m❌ Lệnh không hợp lệ: "${cmd}". Gõ "help" để xem danh sách lệnh.\x1b[0m`);
          break;
      }
    } catch (err) {
      console.error(`\x1b[31m❌ Lỗi thực thi lệnh: ${err.message}\x1b[0m`);
    }
  }

  /**
   * In bảng Dashboard trạng thái của các Bot
   */
  printStatus() {
    const dashboard = this.botManager.getDashboard();
    console.log(`\n📊 BẢNG TRẠNG THÁI SANDBOX [Phòng: ${this.botManager.roomId || 'N/A'}]`);
    console.table(dashboard);
    
    if (this.botManager.currentRoomState) {
      const state = this.botManager.currentRoomState;
      console.log(`📍 Game Phase: \x1b[33m${state.gamePhase || 'LOBBY'}\x1b[0m | Map: \x1b[35m${state.mapType}\x1b[0m | Captain ID: \x1b[32m${state.captainId || 'None'}\x1b[0m\n`);
    }
  }

  /**
   * Bật/Tắt chế độ Auto-Responder
   * @param {string[]} args 
   */
  handleAutoToggle(args) {
    const mode = args[0]?.toLowerCase();
    const botIndex = args[1] ? parseInt(args[1], 10) : null;

    if (mode !== 'on' && mode !== 'off') {
      console.log('Cú pháp: auto [on|off] [bot_index]');
      return;
    }

    const enabled = (mode === 'on');

    if (botIndex) {
      const bot = this.botManager.getBot(botIndex);
      if (!bot) {
        console.log(`\x1b[31m❌ Không tìm thấy Bot_${botIndex}\x1b[0m`);
        return;
      }
      bot.autoMode = enabled;
      console.log(`✅ Đã chuyển [${bot.nickname}] sang chế độ Auto Mode: \x1b[32m${enabled ? 'ON' : 'OFF'}\x1b[0m`);
    } else {
      this.botManager.setGlobalAutoMode(enabled);
      console.log(`✅ Đã chuyển TOÀN BỘ đàn Bot sang Auto Mode: \x1b[32m${enabled ? 'ON' : 'OFF'}\x1b[0m`);
    }
  }

  /**
   * Xử lý hành động ghi đè của từng Bot
   * @param {string[]} args 
   */
  async handleBotAction(args) {
    if (args.length < 2) {
      console.log('Cú pháp: bot <id> <vote|appoint|choose|convert|leave> [args...]');
      return;
    }

    const botIndex = parseInt(args[0], 10);
    const action = args[1].toLowerCase();
    const bot = this.botManager.getBot(botIndex);

    if (!bot) {
      console.log(`\x1b[31m❌ Không tìm thấy Bot #${botIndex}\x1b[0m`);
      return;
    }

    if (!bot.socket || !bot.socket.connected) {
      console.log(`\x1b[31m❌ Bot #${botIndex} đang không có kết nối socket\x1b[0m`);
      return;
    }

    switch (action) {
      case 'vote': {
        const guns = parseInt(args[2], 10) || 0;
        bot.socket.emit('submit_vote', { guns }, (res) => {
          if (res?.success) {
            console.log(`\x1b[32m✅ [Bot_${botIndex}] Đã ép nộp ${guns} súng thành công!\x1b[0m`);
          } else {
            console.log(`\x1b[31m❌ [Bot_${botIndex}] Vote thất bại: ${res?.error}\x1b[0m`);
          }
        });
        break;
      }

      case 'appoint': {
        const ltIndex = parseInt(args[2], 10);
        const navIndex = parseInt(args[3], 10);
        const ltBot = this.botManager.getBot(ltIndex);
        const navBot = this.botManager.getBot(navIndex);

        if (!ltBot || !navBot) {
          console.log('\x1b[31m❌ Chỉ số Lieutenant hoặc Navigator không hợp lệ\x1b[0m');
          return;
        }

        bot.socket.emit('appoint_crew', {
          lieutenantId: ltBot.id,
          navigatorId: navBot.id
        }, (res) => {
          if (res?.success) {
            console.log(`\x1b[32m✅ [Bot_${botIndex}] Đã ép bổ nhiệm Lt=${ltBot.nickname}, Nav=${navBot.nickname}\x1b[0m`);
          } else {
            console.log(`\x1b[31m❌ Bổ nhiệm thất bại: ${res?.error}\x1b[0m`);
          }
        });
        break;
      }

      case 'choose': {
        const direction = (args[2] || 'RED').toUpperCase();
        bot.socket.emit('select_navigation_card', { cardId: direction }, (res) => {
          if (res?.success) {
            console.log(`\x1b[32m✅ [Bot_${botIndex}] Đã ép chọn hướng [${direction}]\x1b[0m`);
          } else {
            console.log(`\x1b[31m❌ Chọn bài thất bại: ${res?.error}\x1b[0m`);
          }
        });
        break;
      }

      case 'leave': {
        bot.leaveRoom();
        console.log(`\x1b[33m👋 [Bot_${botIndex}] Đã rời phòng chơi.\x1b[0m`);
        break;
      }

      default:
        console.log(`\x1b[31m❌ Hành động "${action}" không được hỗ trợ.\x1b[0m`);
        break;
    }
  }

  /**
   * Host bấm Start Game
   */
  async handleStartGame() {
    const hostBot = this.botManager.getAllBots().find(b => b.isHost);
    if (!hostBot) {
      console.log('\x1b[31m❌ Không có Bot nào trong đàn đang làm Host của phòng này.\x1b[0m');
      return;
    }

    hostBot.socket.emit('start_game', (res) => {
      if (res?.success) {
        console.log(`\x1b[32m🚀 [${hostBot.nickname}] (Host) Đã bắt đầu ván game thành công!\x1b[0m`);
      } else {
        console.log(`\x1b[31m❌ Không thể bắt đầu game: ${res?.error}\x1b[0m`);
      }
    });
  }

  /**
   * Dừng CLI controller
   */
  stop() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}

export default CLIController;
