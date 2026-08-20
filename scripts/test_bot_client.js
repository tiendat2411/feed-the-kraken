import { BotClient } from './bots/BotClient.js';

async function testBotClient() {
  console.log('Testing BotClient instantiation...');
  const bot1 = new BotClient({ index: 1 });
  const bot2 = new BotClient({ index: 2, nickname: 'CustomPirate' });

  if (!bot1.sessionToken.startsWith('bot_session_')) {
    throw new Error('Bot 1 session token format invalid');
  }
  if (bot1.sessionToken === bot2.sessionToken) {
    throw new Error('Session tokens are not unique between bot instances');
  }
  if (bot2.nickname !== 'CustomPirate') {
    throw new Error('Custom nickname not applied');
  }

  const status = bot1.getStatus();
  if (status.index !== 1 || status.secretRole !== 'UNKNOWN' || status.autoMode !== 'ON') {
    throw new Error('Bot status format invalid');
  }

  console.log('✅ BotClient unit tests passed successfully!');
}

testBotClient().catch(err => {
  console.error('❌ BotClient test failed:', err);
  process.exit(1);
});
