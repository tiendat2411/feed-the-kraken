import { AutoResponder } from './bots/AutoResponder.js';
import { BotClient } from './bots/BotClient.js';

async function testAutoResponder() {
  console.log('Testing AutoResponder logic and decision rules...');

  // 1. Test delay range
  for (let i = 0; i < 20; i++) {
    const delay = AutoResponder.getRandomDelay(500, 1500);
    if (delay < 500 || delay > 1500) {
      throw new Error(`Delay out of range: ${delay}`);
    }
  }

  // 2. Test autoMode disabled check
  const mockBot = new BotClient({ index: 1 });
  mockBot.autoMode = false;
  let eventDispatched = false;
  mockBot.socket = {
    connected: true,
    emit: () => { eventDispatched = true; }
  };

  await AutoResponder.dispatch(mockBot, 'REQUIRE_VOTE');
  if (eventDispatched) {
    throw new Error('AutoResponder should not dispatch when autoMode is false');
  }

  console.log('✅ AutoResponder unit tests passed successfully!');
}

testAutoResponder().catch(err => {
  console.error('❌ AutoResponder test failed:', err);
  process.exit(1);
});
