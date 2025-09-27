import 'dotenv/config';
import { Telegraf, Markup, Scenes, session } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://127.0.0.1:8071';
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');

const bot = new Telegraf(token);
const WEBAPP_URL = process.env.PUBLIC_WEBAPP_URL || 'https://1bbc03fdf8db.ngrok-free.app';

// Simple state management (for production, use Redis or database)
const userState = new Map();

// Helper functions
function estimateTelegramCreationDate(telegramId: number): Date {
  const id = telegramId;
  // Simple ID-based estimation (these are approximations)
  if (id < 1_000_000) return new Date('2013-08-01'); // Early adopters
  if (id < 10_000_000) return new Date('2015-01-01');
  if (id < 100_000_000) return new Date('2016-06-01');
  if (id < 500_000_000) return new Date('2018-01-01');
  if (id < 1_000_000_000) return new Date('2019-06-01');
  if (id < 2_000_000_000) return new Date('2021-01-01');
  if (id < 5_000_000_000) return new Date('2022-06-01');
  if (id < 6_000_000_000) return new Date('2023-06-01');
  return new Date('2024-01-01'); // Recent users
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(1, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

async function registerUser(telegramId: number, username: string, firstName?: string) {
  try {
    const createdDate = estimateTelegramCreationDate(telegramId);
    const accountAgeDays = daysBetween(createdDate, new Date());
    const initialPoints = Math.floor(accountAgeDays / 10);

    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData: JSON.stringify({
          user: {
            id: telegramId,
            username: username,
            first_name: firstName || username
          }
        }),
        initialPoints
      })
    });

    if (response.ok) {
      return { success: true, points: initialPoints, accountAge: accountAgeDays };
    }
    return { success: false, error: await response.text() };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error' };
  }
}

bot.start(async (ctx) => {
  const telegramId = ctx.from?.id;
  const firstName = ctx.from?.first_name;
  
  if (!telegramId) return;

  // Check if user already registered
  const state = userState.get(telegramId);
  if (state?.registered) {
    const ref = ctx.startPayload ? `?start=${ctx.startPayload}` : '';
    return ctx.reply(
      `Welcome back! 🚀`,
      Markup.keyboard([[Markup.button.webApp('🚀 Launch Analyzer Hub', `${WEBAPP_URL}${ref}`)]])
        .oneTime()
        .resize()
    );
  }

  // First time user - ask for name
  userState.set(telegramId, { step: 'awaiting_name', firstName });
  
  return ctx.reply(
    `Hello! 👋\n\nWelcome to Analyzer Hub!\n\nTo get started, please tell me your name:`,
    Markup.removeKeyboard()
  );
});

// Handle name input
bot.on('text', async (ctx) => {
  const telegramId = ctx.from?.id;
  const text = ctx.message.text;
  
  if (!telegramId) return;
  
  const state = userState.get(telegramId);
  
  if (state?.step === 'awaiting_name') {
    // Validate name (simple validation)
    if (text.length < 2 || text.length > 50) {
      return ctx.reply('Please enter a valid name (2-50 characters):');
    }

    ctx.reply('⏳ Registering...');

    // Register user
    const result = await registerUser(telegramId, text, state.firstName);
    
    if (result.success) {
      userState.set(telegramId, { registered: true, username: text });
      
      return ctx.reply(
        `🎉 Registration successful!\n\n` +
        `📛 Name: ${text}\n` +
        `📅 Telegram account age: ${result.accountAge} days\n` +
        `💎 Initial points: ${result.points} AP\n\n` +
        `Now you can enter the app:`,
        Markup.keyboard([[Markup.button.webApp('🚀 Launch Analyzer Hub', WEBAPP_URL)]])
          .oneTime()
          .resize()
      );
    } else {
      return ctx.reply(
        `❌ Registration error: ${result.error}\n\nPlease try again or contact support.`
      );
    }
  }
});

bot.launch().then(() => console.log('Bot started with onboarding flow'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
