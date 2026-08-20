import { BotManager } from './bots/BotManager.js';
import { BotClient } from './bots/BotClient.js';

async function testBotManager() {
  console.log('Testing BotManager initialization and state control...');
  const manager = new BotManager();

  // Test adding mock bots
  const bot1 = new BotClient({ index: 1 });
  const bot2 = new BotClient({ index: 2 });
  manager.bots.set(1, bot1);
  manager.bots.set(2, bot2);

  if (manager.getAllBots().length !== 2) {
    throw new Error('getAllBots failed');
  }

  if (manager.getBot(1) !== bot1 || manager.getBot(2) !== bot2) {
    throw new Error('getBot retrieval failed');
  }

  // Test setting auto mode
  manager.setGlobalAutoMode(false);
  if (bot1.autoMode !== false || bot2.autoMode !== false) {
    throw new Error('setGlobalAutoMode failed');
  }

  manager.setBotAutoMode(1, true);
  if (bot1.autoMode !== true || bot2.autoMode !== false) {
    throw new Error('setBotAutoMode failed');
  }

  const dashboard = manager.getDashboard();
  if (!Array.isArray(dashboard) || dashboard.length !== 2) {
    throw new Error('getDashboard format invalid');
  }

  await manager.shutdown();
  if (manager.bots.size !== 0) {
    throw new Error('shutdown cleanup failed');
  }

  console.log('✅ BotManager unit tests passed successfully!');
}

testBotManager().catch(err => {
  console.error('❌ BotManager test failed:', err);
  process.exit(1);
});
