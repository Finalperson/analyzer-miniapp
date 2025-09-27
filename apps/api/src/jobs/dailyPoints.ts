import { PrismaClient } from '@prisma/client';
import { Notifications } from '../notify';

export async function awardDailyPointsJob(prisma: PrismaClient) {
  const daily = await prisma.mission.findUnique({ where: { code: 'daily_checkin' } });
  if (!daily) return;
  const premiumUsers = await prisma.user.findMany({ where: { isPremium: true } });
  for (const u of premiumUsers) {
    const today = new Date().toISOString().slice(0, 10);
    const exists = await prisma.userMission.findFirst({ where: { userId: u.id, missionId: daily.id, dayKey: today } });
    if (!exists) {
      await prisma.userMission.create({ data: { userId: u.id, missionId: daily.id, completed: true, completedAt: new Date(), dayKey: today } });
  const updated = await prisma.user.update({ where: { id: u.id }, data: { apBalance: { increment: daily.points } } });
  Notifications.dailyPoints(u.telegramId, updated.apBalance);
    }
  }
}
