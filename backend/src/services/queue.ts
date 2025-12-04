/**
 * Message Queue Service
 * Handles sending notifications to Yandex Message Queue (YMQ)
 * YMQ is compatible with AWS SQS API
 */

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../logger';

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

export interface MatchNotificationData {
  userId1: string; // Database user ID
  userId2: string; // Database user ID
  telegramId1: number; // Telegram user ID
  telegramId2: number; // Telegram user ID
  matchId: string;
  eventId?: string;
}

/**
 * Send match notification to queue
 * This is async and non-blocking - if queue is unavailable, error is logged but doesn't fail the request
 */
export async function sendMatchNotification(data: MatchNotificationData): Promise<void> {
  // If queue is not configured, fallback to direct webhook (for development)
  if (!YMQ_QUEUE_URL || !YMQ_ACCESS_KEY_ID || !YMQ_SECRET_ACCESS_KEY) {
    logger.warn({
      type: 'queue_not_configured',
      message: 'YMQ not configured, falling back to direct webhook',
    });

    // Fallback to direct webhook
    const botWebhookUrl = process.env.BOT_WEBHOOK_URL || 'http://localhost:3001/notify/match';
    try {
      await fetch(botWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId1: data.userId1,
          userId2: data.userId2,
          telegramId1: data.telegramId1,
          telegramId2: data.telegramId2,
          matchId: data.matchId,
          eventId: data.eventId,
        }),
      });
    } catch (error) {
      logger.error({
        error,
        type: 'match_notification_fallback_failed',
        matchId: data.matchId,
      });
    }
    return;
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: YMQ_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: 'match_created',
        ...data,
        timestamp: Date.now(),
      }),
      MessageAttributes: {
        retryCount: {
          DataType: 'Number',
          StringValue: '0',
        },
      },
    });

    await sqsClient.send(command);

    logger.info({
      type: 'match_notification_queued',
      matchId: data.matchId,
      userId1: data.userId1,
      userId2: data.userId2,
      telegramId1: data.telegramId1,
      telegramId2: data.telegramId2,
    });
  } catch (error) {
    // Log error but don't throw - match creation should succeed even if notification fails
    logger.error({
      error,
      type: 'match_notification_queue_failed',
      matchId: data.matchId,
      message: error instanceof Error ? error.message : String(error),
    });

    // Try fallback to direct webhook if queue fails
    const botWebhookUrl = process.env.BOT_WEBHOOK_URL;
    if (botWebhookUrl) {
      try {
        await fetch(botWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId1: data.userId1,
            userId2: data.userId2,
            telegramId1: data.telegramId1,
            telegramId2: data.telegramId2,
            matchId: data.matchId,
            eventId: data.eventId,
          }),
        });
        logger.info({
          type: 'match_notification_fallback_success',
          matchId: data.matchId,
        });
      } catch (fallbackError) {
        logger.error({
          error: fallbackError,
          type: 'match_notification_fallback_failed',
          matchId: data.matchId,
        });
      }
    }
  }
}

/**
 * Check if queue is configured
 */
export function isQueueConfigured(): boolean {
  return !!(YMQ_QUEUE_URL && YMQ_ACCESS_KEY_ID && YMQ_SECRET_ACCESS_KEY);
}
