import { NextRequest, NextResponse } from 'next/server';

// Simple webhook handler without Telegraf
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Telegram webhook received:', body);
    
    // For now, just return OK
    // In production, handle bot logic here without Telegraf
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

export async function GET() {
  return new Response('Bot webhook endpoint is ready!', { status: 200 });
}