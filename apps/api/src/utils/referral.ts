import { PrismaClient } from '@prisma/client';

function randomCode(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export async function generateUniqueReferralCode(prisma: PrismaClient, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const code = randomCode();
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  // fallback with timestamp
  return `${randomCode(6)}${Date.now().toString(36).slice(-4)}`;
}
