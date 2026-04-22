/*
  Warnings:

  - You are about to drop the `Balance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_user2Id_fkey";

-- DropTable
DROP TABLE "Balance";

-- CreateTable
CREATE TABLE "balances" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "balances_groupId_user1Id_idx" ON "balances"("groupId", "user1Id");

-- CreateIndex
CREATE INDEX "balances_groupId_user2Id_idx" ON "balances"("groupId", "user2Id");

-- CreateIndex
CREATE INDEX "balances_user1Id_idx" ON "balances"("user1Id");

-- CreateIndex
CREATE INDEX "balances_user2Id_idx" ON "balances"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "balances_groupId_user1Id_user2Id_key" ON "balances"("groupId", "user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "balances" ADD CONSTRAINT "balances_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balances" ADD CONSTRAINT "balances_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balances" ADD CONSTRAINT "balances_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
