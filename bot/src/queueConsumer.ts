/**
 * Message Queue Consumer
 * Processes match notifications from Yandex Message Queue
 */

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { Telegraf } from 'telegraf';
import { logger } from './logger';

// Yandex Message Queue endpoint
const YMQ_ENDPOINT = process.env.YMQ_ENDPOINT || 'https://message-queue.api.cloud.yandex.net';
const YMQ_QUEUE_URL = process.env.YMQ_QUEUE_URL || '';
const YMQ_ACCESS_KEY_ID = process.env.YMQ_ACCESS_KEY_ID || '';
const YMQ_SECRET_ACCESS_KEY = process.env.YMQ_SECRET_ACCESS_KEY || '';

// Initialize SQS client (YMQ is SQS-compatible)
const sqsClient = new SQSClient({
  region: 'ru-central1',
  endpoint: YMQ_ENDPOINT,
  credentials:
    YMQ_ACCESS_KEY_ID && YMQ_SECRET_ACCESS_KEY
      ? {
          accessKeyId: YMQ_ACCESS_KEY_ID,
          secretAccessKey: YMQ_SECRET_ACCESS_KEY,
        }
      : undefined,
});

interface MatchNotificationMessage {
  type: 'match_created';
  userId1: string; // Database user ID (for reference)
  userId2: string; // Database user ID (for reference)
  telegramId1: number; // Telegram user ID
  telegramId2: number; // Telegram user ID
  matchId: string;
  eventId?: string;
  timestamp: number;
}

/**
 * Send match notification to users via Telegram bot
 */
async function sendMatchNotificationToUsers(
  bot: Telegraf,
  telegramId1: number,
  telegramId2: number,
  matchId: string,
  eventId?: string
): Promise<void> {
  const message =
    `🎉 У вас новый матч!\n\n` +
    `Вы понравились друг другу!\n` +
    (eventId ? `Событие: ${eventId}\n` : '') +
    `\nНачните общение прямо сейчас! 💬`;

  const webAppUrl = process.env.FRONTEND_URL || 'https://app.yourdomain.com';
  const matchUrl = `${webAppUrl}/matches/${matchId}`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть чат',
            web_app: { url: matchUrl },
          },
        ],
      ],
    },
  };

  // Send to both users
  try {
    await Promise.all([
      bot.telegram.sendMessage(userId1, message, keyboard),
      bot.telegram.sendMessage(userId2, message, keyboard),
    ]);

    logger.info({
      type: 'match_notification_sent',
      matchId,
      telegramId1,
      telegramId2,
    });
  } catch (error) {
    logger.error({
      error,
      type: 'match_notification_send_failed',
      matchId,
      userId1,
      userId2,
    });
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Process a single message from queue
 */
async function processMessage(bot: Telegraf, message: any): Promise<void> {
  try {
    const data: MatchNotificationMessage = JSON.parse(message.Body);

    if (data.type !== 'match_created') {
      logger.warn({
        type: 'unknown_message_type',
        messageType: data.type,
      });
      return;
    }

    // Validate telegram IDs
    if (!data.telegramId1 || !data.telegramId2) {
      logger.error({
        type: 'invalid_telegram_ids',
        userId1: data.userId1,
        userId2: data.userId2,
        message: 'Telegram IDs are missing from message',
      });
      return;
    }

    await sendMatchNotificationToUsers(
      bot,
      data.telegramId1,
      data.telegramId2,
      data.matchId,
      data.eventId
    );

    // Delete message from queue after successful processing
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: YMQ_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );

    logger.info({
      type: 'message_processed',
      matchId: data.matchId,
    });
  } catch (error) {
    logger.error({
      error,
      type: 'message_processing_failed',
      message: error instanceof Error ? error.message : String(error),
    });

    // Don't delete message - it will be retried automatically via visibility timeout
    // After max retries, message will go to dead letter queue (if configured)
    throw error;
  }
}

/**
 * Start queue consumer
 * Continuously polls queue for messages and processes them
 */
export async function startQueueConsumer(bot: Telegraf): Promise<void> {
  // Check if queue is configured
  if (!YMQ_QUEUE_URL || !YMQ_ACCESS_KEY_ID || !YMQ_SECRET_ACCESS_KEY) {
    logger.warn({
      type: 'queue_consumer_not_configured',
      message: 'YMQ not configured, queue consumer will not start',
    });
    return;
  }

  logger.info({
    type: 'queue_consumer_starting',
    queueUrl: YMQ_QUEUE_URL.replace(/\/[^/]+$/, '/***'), // Hide queue name
  });

  // Poll queue continuously
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: YMQ_QUEUE_URL,
        MaxNumberOfMessages: 10, // Process up to 10 messages at once
        WaitTimeSeconds: 20, // Long polling (wait up to 20s for messages)
        MessageAttributeNames: ['All'],
      });

      const response = await sqsClient.send(command);

      if (response.Messages && response.Messages.length > 0) {
        logger.info({
          type: 'messages_received',
          count: response.Messages.length,
        });

        // Process messages in parallel
        await Promise.allSettled(response.Messages.map((msg) => processMessage(bot, msg)));
      }
    } catch (error) {
      logger.error({
        error,
        type: 'queue_consumer_error',
        message: error instanceof Error ? error.message : String(error),
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
