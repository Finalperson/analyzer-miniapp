/*
  Warnings:

  - You are about to drop the `RefDrop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RefDrop" DROP CONSTRAINT "RefDrop_userId_fkey";

-- DropTable
DROP TABLE "RefDrop";
