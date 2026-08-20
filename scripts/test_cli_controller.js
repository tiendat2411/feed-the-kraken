import { CLIController } from './bots/CLIController.js';
import { BotManager } from './bots/BotManager.js';
import { BotClient } from './bots/BotClient.js';

async function testCLIController() {
  console.log('Testing CLIController command parser...');

  const manager = new BotManager();
  const bot1 = new BotClient({ index: 1 });
  const bot2 = new BotClient({ index: 2 });
  manager.bots.set(1, bot1);
  manager.bots.set(2, bot2);

  const controller = new CLIController({ botManager: manager });

  // Test auto toggle command
  controller.handleAutoToggle(['off']);
  if (bot1.autoMode !== false || bot2.autoMode !== false) {
    throw new Error('Global auto toggle off failed');
  }

  controller.handleAutoToggle(['on', '1']);
  if (bot1.autoMode !== true || bot2.autoMode !== false) {
    throw new Error('Specific bot auto toggle failed');
  }

  // Test status printing
  controller.printStatus();

  console.log('✅ CLIController unit tests passed successfully!');
}

testCLIController().catch(err => {
  console.error('❌ CLIController test failed:', err);
  process.exit(1);
});
