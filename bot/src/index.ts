import { Telegraf, Context } from 'telegraf';
import { config } from './config';

if (!config.botToken) {
  throw new Error(
    `TELEGRAM_BOT_TOKEN is not set for ${config.nodeEnv} environment. ` +
      `Please set TELEGRAM_BOT_TOKEN_${config.nodeEnv === 'production' ? 'PROD' : 'DEV'} or TELEGRAM_BOT_TOKEN`
  );
}

const bot = new Telegraf(config.botToken);

// Start command
bot.start((ctx) => {
  ctx.reply('Welcome to Dating App! 🎉\n\nUse /help to see available commands.');
});

// Help command
bot.help((ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Start the bot\n' +
    '/help - Show this help message\n' +
    '/profile - Open your profile'
  );
});

// Handle webhook notifications from backend
// This endpoint should be called by backend when a match is created
bot.on('text', async (ctx: Context) => {
  // Handle text messages if needed
  // For now, just echo
  if (ctx.message && 'text' in ctx.message) {
    await ctx.reply('I received your message!');
  }
});

/**
 * Send match notification to user
 * Called by backend webhook
 */
export async function sendMatchNotification(userId: number, matchData: {
  matchId: string;
  matchedUserId: string;
  matchedUserName: string;
  eventId?: string;
  eventTitle?: string;
}) {
  try {
    const message = `🎉 У вас новый матч!\n\n` +
      `Вы понравились ${matchData.matchedUserName}!\n` +
      (matchData.eventTitle ? `Событие: ${matchData.eventTitle}\n` : '') +
      `\nНачните общение прямо сейчас! 💬`;
    
    await bot.telegram.sendMessage(userId, message, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Открыть чат',
            web_app: { url: `${process.env.FRONTEND_URL || 'https://app.yourdomain.com'}/matches/${matchData.matchId}` }
          }
        ]]
      }
    });
  } catch (error) {
    console.error('Error sending match notification:', error);
  }
}

bot.launch();

console.log(`Bot started in ${config.nodeEnv} mode`);

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

