import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { initData, initialPoints } = await request.json();
    
    const userData = JSON.parse(initData);
    const telegramUser = userData.user;
    
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramUser.id) },
      update: {},
      create: {
        telegramId: BigInt(telegramUser.id),
        username: telegramUser.username || telegramUser.first_name,
        firstName: telegramUser.first_name,
        apBalance: initialPoints || 0,
        referralCode: `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }
    });

    const token = sign(
      { 
        userId: user.id,
        telegramId: user.telegramId.toString() 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        ...user,
        telegramId: user.telegramId.toString()
      }
    });

  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}