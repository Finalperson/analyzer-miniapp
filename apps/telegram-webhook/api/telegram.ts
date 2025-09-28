// Vercel serverless function for Telegram webhook
// Request-driven: no long-running process. Telegraf is initialized per request.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Use POST for Telegram webhook' });
  }
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: 'Missing TELEGRAM_BOT_TOKEN' });
    // Dynamic import to avoid bundling issues
    const { Telegraf, Markup } = await import('telegraf');
    const { PrismaClient } = await import('@prisma/client');

    // Prisma singleton across invocations
    const g: any = globalThis as any;
    const prisma: any = g.__prisma ?? (g.__prisma = new (PrismaClient as any)());

    const bot = new Telegraf(token);
    const WEBAPP_URL = process.env.PUBLIC_WEBAPP_URL || '';

    function randomCode(len = 8) {
      return Math.random().toString(36).slice(2, 2 + len);
    }
    async function generateUniqueReferralCode(maxAttempts = 5): Promise<string> {
      for (let i = 0; i < maxAttempts; i++) {
        const code = randomCode();
        const exists = await prisma.user.findUnique({ where: { referralCode: code } });
        if (!exists) return code;
      }
      return `${randomCode(6)}${Date.now().toString(36).slice(-4)}`;
    }

    async function upsertUserFromCtx(ctx: any) {
      const from = ctx.from;
      const tgId = BigInt(from.id);
      let isNewUser = false;
      try {
        const user = await prisma.user.upsert({
          where: { telegramId: tgId },
          update: {
            username: from.username ?? null,
            firstName: from.first_name ?? null,
            lastName: from.last_name ?? null,
            isPremium: from.is_premium ?? false,
          },
          create: {
            telegramId: tgId,
            username: from.username ?? null,
            firstName: from.first_name ?? null,
            lastName: from.last_name ?? null,
            isPremium: from.is_premium ?? false,
            referralCode: await generateUniqueReferralCode(),
            apBalance: 100,
          },
        });
        isNewUser = user.createdAt === user.updatedAt; // heuristic
        return { user, isNewUser };
      } catch (e: any) {
        if (e?.code === 'P2002') {
          const user = await prisma.user.update({
            where: { telegramId: tgId },
            data: { username: from.username ?? null },
          });
          return { user, isNewUser: false };
        }
        throw e;
      }
    }

    async function ensureDailyMission() {
      return prisma.mission.upsert({
        where: { code: 'daily_checkin' },
        update: {},
        create: { code: 'daily_checkin', title: 'Daily Check-in', points: 10, type: 'daily', active: true },
      });
    }

    bot.start(async (ctx: any) => {
      const { user } = await upsertUserFromCtx(ctx);
      // Referral via start payload (code)
      const payload = (ctx as any).startPayload as string | undefined;
      if (payload) {
        try {
          const referrer = await prisma.user.findUnique({ where: { referralCode: payload } });
          if (referrer && referrer.id !== user.id) {
            // create referral if not exists
            await prisma.referral.upsert({
              where: { refereeId: user.id },
              update: {},
              create: { referrerId: referrer.id, refereeId: user.id },
            });
            // base reward
            await prisma.user.update({ where: { id: referrer.id }, data: { apBalance: { increment: 10 } } });
          }
        } catch {}
      }
      const name = ctx.from?.first_name || 'friend';
      const keyboard = WEBAPP_URL
        ? Markup.keyboard([[Markup.button.webApp('Open Analyzer', WEBAPP_URL)]]).resize()
        : undefined;
      await ctx.reply(
        `Welcome ${name}!\nYour Analyzer account is ready. Type 'balance' to see your AP, or 'daily' to claim today's check-in.`,
        keyboard as any
      );
    });

    bot.hears(/^(balance|points|ap)$/i, async (ctx: any) => {
      const tgId = BigInt(ctx.from.id);
      const user = await prisma.user.findUnique({ where: { telegramId: tgId } });
      await ctx.reply(user ? `Your AP balance: ${user.apBalance}` : 'No account found. Send /start first.');
    });

    bot.hears(/^daily$/i, async (ctx: any) => {
      await ensureDailyMission();
      const tgId = BigInt(ctx.from.id);
      const user = await prisma.user.findUnique({ where: { telegramId: tgId } });
      if (!user) return ctx.reply('No account found. Send /start first.');
      const today = new Date().toISOString().slice(0, 10);
      const daily = await prisma.mission.findUnique({ where: { code: 'daily_checkin' } });
      if (!daily) return ctx.reply('Daily mission not configured.');
      const exists = await prisma.userMission.findFirst({ where: { userId: user.id, missionId: daily.id, dayKey: today } });
      if (exists) return ctx.reply('You already claimed today. Come back tomorrow!');
      await prisma.userMission.create({ data: { userId: user.id, missionId: daily.id, completed: true, completedAt: new Date(), dayKey: today } });
      const updated = await prisma.user.update({ where: { id: user.id }, data: { apBalance: { increment: daily.points } } });
      await ctx.reply(`Daily claimed! +${daily.points} AP. New balance: ${updated.apBalance}`);
    });

    // Let Telegraf process the update
    await bot.handleUpdate(req.body as any);
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('Webhook error', e);
    return res.status(200).json({ ok: true }); // Telegram expects 200; log error internally
  }
}
