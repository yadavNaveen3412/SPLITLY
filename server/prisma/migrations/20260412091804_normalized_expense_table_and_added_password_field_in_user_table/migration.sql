/*
  Warnings:

  - You are about to drop the column `paid_by` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `shared_amounts` on the `expense` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId,userId]` on the table `group_members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "category_keywords_idx";

-- AlterTable
ALTER TABLE "expense" DROP COLUMN "paid_by",
DROP COLUMN "shared_amounts";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_hash" TEXT,
ALTER COLUMN "google_sub" DROP NOT NULL;

-- CreateTable
CREATE TABLE "expense_participants" (
    "id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "owed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "group_id" TEXT,

    CONSTRAINT "expense_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_participants_user_id_idx" ON "expense_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_participants_expense_id_user_id_key" ON "expense_participants"("expense_id", "user_id");

-- CreateIndex
CREATE INDEX "chats_group_id_created_at_idx" ON "chats"("group_id", "created_at");

-- CreateIndex
CREATE INDEX "expense_groupId_cycleId_idx" ON "expense"("groupId", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE INDEX "groups_createdById_type_idx" ON "groups"("createdById", "type");

-- CreateIndex
CREATE INDEX "settlement_group_id_cycleId_idx" ON "settlement"("group_id", "cycleId");

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
