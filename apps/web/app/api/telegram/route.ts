import { NextRequest } from 'next/server';
import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const WEBAPP_URL = process.env.PUBLIC_WEBAPP_URL!;
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Simple state management (in production, use Redis or database)
const userState = new Map();

// Helper functions
function estimateTelegramCreationDate(telegramId: number): Date {
  const id = telegramId;
  if (id < 1_000_000) return new Date('2013-08-01');
  if (id < 10_000_000) return new Date('2015-01-01');
  if (id < 100_000_000) return new Date('2016-06-01');
  if (id < 500_000_000) return new Date('2018-01-01');
  if (id < 1_000_000_000) return new Date('2019-06-01');
  if (id < 2_000_000_000) return new Date('2021-01-01');
  if (id < 5_000_000_000) return new Date('2022-06-01');
  if (id < 6_000_000_000) return new Date('2023-06-01');
  return new Date('2024-01-01');
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
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        points: initialPoints,
        accountAge: accountAgeDays,
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Bot commands
bot.start(async (ctx) => {
  const telegramId = ctx.from?.id;
  const firstName = ctx.from?.first_name;
  
  if (!telegramId) {
    return ctx.reply('❌ Error: Unable to identify user');
  }

  const existingState = userState.get(telegramId);
  if (existingState?.registered) {
    return ctx.reply(
      `Welcome back! 🎉\n\nYou're already registered. Launch the app:`,
      Markup.keyboard([[Markup.button.webApp('🚀 Launch Analyzer Hub', WEBAPP_URL)]])
        .oneTime()
        .resize()
    );
  }

  userState.set(telegramId, { step: 'awaiting_name', firstName });
  
  return ctx.reply(
    `Hello! 👋\n\nWelcome to Analyzer Hub!\n\nTo get started, please tell me your name:`,
    Markup.removeKeyboard()
  );
});

bot.on('text', async (ctx) => {
  const telegramId = ctx.from?.id;
  const text = ctx.message.text;
  
  if (!telegramId) return;
  
  const state = userState.get(telegramId);
  
  if (state?.step === 'awaiting_name') {
    if (text.length < 2 || text.length > 50) {
      return ctx.reply('Please enter a valid name (2-50 characters):');
    }

    ctx.reply('⏳ Registering...');

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

// Bot webhook handler for Vercel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

// For webhook setup verification
export async function GET() {
  return new Response('Bot webhook endpoint is ready!', { status: 200 });
}