-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'monthly';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastDailyClaim" TIMESTAMP(3),
ADD COLUMN     "referrerId" BIGINT;

-- CreateTable
CREATE TABLE "MissionsLog" (
    "logId" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "missionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionsLog_pkey" PRIMARY KEY ("logId")
);

-- AddForeignKey
ALTER TABLE "MissionsLog" ADD CONSTRAINT "MissionsLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
