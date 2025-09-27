import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const missions = [
    { code: 'loyalty_bonus', title: 'Telegram Loyalty Bonus', points: 0, type: 'one-time' },
    { code: 'connect_wallet', title: 'Submit EVM Address', points: 100, type: 'one-time' },
    { code: 'follow_twitter', title: 'Follow on X (Twitter)', points: 50, type: 'one-time' },
    { code: 'join_discord', title: 'Join Discord Server', points: 50, type: 'one-time' },
    { code: 'subscription_verification', title: 'Active Subscription Verification', points: 200, type: 'one-time' },
    { code: 'daily_checkin', title: 'Daily Check-in', points: 10, type: 'daily' },
  ];

  for (const m of missions) {
    await prisma.mission.upsert({
      where: { code: m.code },
      update: { title: m.title, points: m.points, type: m.type, active: true },
      create: { ...m, active: true },
    });
  }

  // Seed default SUPER_ADMIN
  const superAdminWallet = '0x044d515048cCEFf46E60C565010C3A1763E2d640';
  await prisma.admin.upsert({
    where: { walletAddress: superAdminWallet },
    update: { role: 'SUPER_ADMIN' },
    create: { walletAddress: superAdminWallet, role: 'SUPER_ADMIN' },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
