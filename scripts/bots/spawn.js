#!/usr/bin/env node
import { BotManager } from './BotManager.js';
import { CLIController } from './CLIController.js';

function parseArgs(args) {
  const options = {
    roomId: null,
    count: 4,
    createRoom: false,
    serverUrl: process.env.SERVER_URL || 'http://localhost:3001',
    mapType: 'QUICK_JOURNEY'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--room' || arg === '-r') {
      options.roomId = args[++i];
    } else if (arg === '--count' || arg === '-c') {
      options.count = parseInt(args[++i], 10) || 4;
    } else if (arg === '--create-room' || arg === '--create') {
      options.createRoom = true;
    } else if (arg === '--server' || arg === '-s') {
      options.serverUrl = args[++i];
    } else if (arg === '--map' || arg === '-m') {
      options.mapType = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
======================================================
🤖 FEED THE KRAKEN - HEADLESS BOTS SANDBOX CLI
======================================================

Cách sử dụng (Usage):
  node scripts/bots/spawn.js [options]

Tùy chọn (Options):
  -r, --room <ROOM_ID>     Mã phòng cần tham gia (ví dụ: ABCDEF)
  -c, --count <N>          Số lượng bot cần tạo (1 - 10, mặc định: 4)
  --create-room            Tự động tạo phòng mới với Bot 1 làm Host
  -s, --server <URL>       Địa chỉ Backend Server (mặc định: http://localhost:3001)
  -m, --map <TYPE>         Loại map nếu tự tạo phòng (QUICK_JOURNEY hoặc LONG_JOURNEY)
  -h, --help               Hiển thị hướng dẫn này

Ví dụ (Examples):
  1. Thêm 4 bot vào phòng có sẵn:
     node scripts/bots/spawn.js --room ABCDEF --count 4

  2. Tự tạo phòng và spawn 5 bots:
     node scripts/bots/spawn.js --create-room --count 5
======================================================
`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.roomId && !options.createRoom) {
    console.error('❌ Lỗi: Bạn phải cung cấp --room <ROOM_ID> hoặc sử dụng cờ --create-room.');
    console.log('Chạy "node scripts/bots/spawn.js --help" để xem hướng dẫn chi tiết.\n');
    process.exit(1);
  }

  console.log(`
======================================================
🤖 FEED THE KRAKEN - AUTOMATED TESTING SANDBOX
======================================================
📍 Máy chủ (Server): ${options.serverUrl}
👥 Số lượng Bots  : ${options.count}
🎯 Chế độ (Mode)   : ${options.createRoom ? 'Tự tạo phòng mới (Auto-Host)' : `Tham gia phòng [${options.roomId}]`}
======================================================
`);

  const manager = new BotManager({ serverUrl: options.serverUrl });

  try {
    const result = await manager.spawnBots({
      roomId: options.roomId,
      count: options.count,
      createRoom: options.createRoom,
      mapType: options.mapType
    });

    console.log(`\n🎉 Đã lấp đầy phòng [${result.roomId}] thành công!`);

    // Khởi chạy CLI Controller tương tác
    const cli = new CLIController({ botManager: manager });
    cli.start();

  } catch (err) {
    console.error('\n❌ Không thể khởi tạo Sandbox:', err.message);
    await manager.shutdown();
    process.exit(1);
  }
}

main();
