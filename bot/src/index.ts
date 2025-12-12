import { Telegraf, Context } from 'telegraf';
import { config } from './config';
import { appendFileSync } from 'fs';

// #region agent log
const logPath = '/Users/vidmich/Desktop/cursor/lug/.cursor/debug.log';
try {
  appendFileSync(
    logPath,
    JSON.stringify({
      location: 'bot/index.ts:4',
      message: 'Bot initialization started',
      data: { nodeEnv: config.nodeEnv, hasBotToken: !!config.botToken },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'I',
    }) + '\n'
  );
} catch {
  // Ignore logging errors
}
// #endregion

if (!config.botToken) {
  // #region agent log
  try {
    appendFileSync(
      logPath,
      JSON.stringify({
        location: 'bot/index.ts:15',
        message: 'Bot token missing',
        data: { nodeEnv: config.nodeEnv },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'I',
      }) + '\n'
    );
  } catch {
    // Ignore logging errors
  }
  // #endregion
  throw new Error(
    `TELEGRAM_BOT_TOKEN is not set for ${config.nodeEnv} environment. ` +
      `Please set TELEGRAM_BOT_TOKEN_${config.nodeEnv === 'production' ? 'PROD' : 'DEV'} or TELEGRAM_BOT_TOKEN`
  );
}

const bot = new Telegraf(config.botToken);

// #region agent log
try {
  appendFileSync(
    logPath,
    JSON.stringify({
      location: 'bot/index.ts:30',
      message: 'Bot instance created',
      data: { hasBot: !!bot },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'I',
    }) + '\n'
  );
} catch {
  // Ignore logging errors
}
// #endregion

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
export async function sendMatchNotification(
  userId: number,
  matchData: {
    matchId: string;
    matchedUserId: string;
    matchedUserName: string;
    eventId?: string;
    eventTitle?: string;
  }
) {
  try {
    const message =
      `🎉 У вас новый матч!\n\n` +
      `Вы понравились ${matchData.matchedUserName}!\n` +
      (matchData.eventTitle ? `Событие: ${matchData.eventTitle}\n` : '') +
      `\nНачните общение прямо сейчас! 💬`;

    await bot.telegram.sendMessage(userId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть чат',
              web_app: {
                url: `${process.env.FRONTEND_URL || 'https://app.yourdomain.com'}/matches/${matchData.matchId}`,
              },
            },
          ],
        ],
      },
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
// #region agent log
try {
  appendFileSync(
    logPath,
    JSON.stringify({
      location: 'bot/index.ts:156',
      message: 'Before bot.launch()',
      data: { nodeEnv: config.nodeEnv, hasBot: !!bot },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'I',
    }) + '\n'
  );
} catch {
  // Ignore logging errors
}
// #endregion

bot
  .launch()
  .then(async () => {
    // #region agent log
    try {
      appendFileSync(
        logPath,
        JSON.stringify({
          location: 'bot/index.ts:175',
          message: 'Bot launched successfully',
          data: { nodeEnv: config.nodeEnv },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'I',
        }) + '\n'
      );
    } catch {
      // Ignore logging errors
    }
    // #endregion

    console.log(`✅ Bot started in ${config.nodeEnv} mode`);
    // Get bot info
    bot.telegram
      .getMe()
      .then((botInfo) => {
        console.log(`Bot username: @${botInfo.username}`);
        // #region agent log
        try {
          appendFileSync(
            logPath,
            JSON.stringify({
              location: 'bot/index.ts:118',
              message: 'Bot info retrieved',
              data: { username: botInfo.username },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'I',
            }) + '\n'
          );
        } catch {
          // Ignore logging errors
        }
        // #endregion
      })
      .catch((err) => {
        console.warn('Could not get bot info:', err.message);
        // #region agent log
        try {
          appendFileSync(
            logPath,
            JSON.stringify({
              location: 'bot/index.ts:133',
              message: 'Bot info failed',
              data: { errorMessage: err.message },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'I',
            }) + '\n'
          );
        } catch {
          // Ignore logging errors
        }
        // #endregion
      });

    // Start queue consumer for match notifications
    // This runs in background and processes messages from YMQ
    if (process.env.YMQ_QUEUE_URL) {
      const { startQueueConsumer } = await import('./queueConsumer');
      startQueueConsumer(bot).catch((error) => {
        console.error('❌ Failed to start queue consumer:', error);
        // Don't exit - bot should continue working even if queue consumer fails
      });
    } else {
      console.log('⚠️  YMQ_QUEUE_URL not set, queue consumer will not start');
    }
  })
  .catch((error) => {
    // #region agent log
    try {
      appendFileSync(
        logPath,
        JSON.stringify({
          location: 'bot/index.ts:231',
          message: 'Bot launch failed',
          data: {
            errorMessage: error instanceof Error ? error.message : String(error),
            errorName: error instanceof Error ? error.name : 'Unknown',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'I',
        }) + '\n'
      );
    } catch {
      // Ignore logging errors
    }
    // #endregion
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
