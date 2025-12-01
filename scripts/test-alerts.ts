/**
 * Test script for Telegram alerts
 * Usage: npm run test:alerts
 * 
 * This script tests sending alerts to Telegram
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function testTelegramAlert() {
  console.log('🧪 Testing Telegram Alert Bot...\n');

  const telegramBotToken = process.env.TELEGRAM_ALERT_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_ALERT_CHAT_ID;
  const enabled = process.env.TELEGRAM_ALERT_ENABLED === 'true';

  if (!enabled) {
    console.error('❌ Telegram alerts are disabled!');
    console.error('   Set TELEGRAM_ALERT_ENABLED=true in .env');
    process.exit(1);
  }

  if (!telegramBotToken || !telegramChatId) {
    console.error('❌ Telegram alert bot not configured!');
    console.error('   Please check your .env file:');
    console.error('   - TELEGRAM_ALERT_BOT_TOKEN');
    console.error('   - TELEGRAM_ALERT_CHAT_ID');
    process.exit(1);
  }

  console.log('✅ Configuration found:');
  console.log(`   Bot Token: ${telegramBotToken.substring(0, 10)}...`);
  console.log(`   Chat ID: ${telegramChatId}\n`);

  try {
    console.log('📤 Sending test alert...');

    const testMessage = `🧪 *TEST ALERT*

This is a test message from the dating app backend.

*Time:* ${new Date().toISOString()}
*Environment:* ${process.env.NODE_ENV || 'development'}

If you received this message, the alert system is working correctly! ✅`;

    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (errorData.error_code === 400 && errorData.description?.includes('chat not found')) {
        console.error('\n❌ Chat not found!');
        console.error('\n📝 Решение:');
        console.error('   1. Для личного чата: отправьте боту любое сообщение');
        console.error('   2. Для группы: добавьте бота в группу и дайте ему права администратора');
        console.error('   3. Убедитесь, что Chat ID правильный (319315134)');
        console.error('\n💡 Как получить Chat ID:');
        console.error('   - Отправьте боту /start');
        console.error('   - Или используйте @userinfobot для получения вашего ID');
        throw new Error('Chat not found - please read instructions above');
      }
      
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Test alert sent successfully!');
      console.log(`   Message ID: ${data.result.message_id}`);
      console.log(`   Chat: ${data.result.chat.title || data.result.chat.id}`);
      console.log('\n📱 Check your Telegram - you should have received a test message!');
    } else {
      throw new Error(`Failed to send: ${JSON.stringify(data)}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to send test alert:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
    process.exit(1);
  }
}

testTelegramAlert();

