import { Telegraf, Context } from 'telegraf';
import { config } from './config';

if (!config.botToken) {
  throw new Error(
    `TELEGRAM_BOT_TOKEN is not set for ${config.nodeEnv} environment. ` +
      `Please set TELEGRAM_BOT_TOKEN_${config.nodeEnv === 'production' ? 'PROD' : 'DEV'} or TELEGRAM_BOT_TOKEN`
  );
}

const bot = new Telegraf(config.botToken);

// Log all incoming updates for debugging
bot.use((ctx, next) => {
  const message = 'message' in ctx.update ? ctx.update.message : undefined;
  console.log('📨 Received update:', {
    type: ctx.updateType,
    chatId: ctx.chat?.id,
    userId: ctx.from?.id,
    username: ctx.from?.username,
    text: message && 'text' in message ? message.text : undefined,
  });
  return next();
});

// Start command
bot.start(async (ctx) => {
  console.log('✅ /start command received from user:', ctx.from?.id);
  try {
    await ctx.reply('Welcome to Dating App! 🎉\n\nUse /help to see available commands.');
    console.log('✅ Start message sent successfully');
  } catch (error) {
    console.error('❌ Error sending start message:', error);
  }
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

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

// Launch bot (uses polling by default in development)
bot.launch().then(() => {
  console.log(`✅ Bot started in ${config.nodeEnv} mode`);
  // Get bot info
  bot.telegram.getMe().then((botInfo) => {
    console.log(`Bot username: @${botInfo.username}`);
  }).catch((err) => {
    console.warn('Could not get bot info:', err.message);
  });
}).catch((error) => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

