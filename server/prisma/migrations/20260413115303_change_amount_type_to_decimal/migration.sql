/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `paid_amount` on the `expense_participants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `owed_amount` on the `expense_participants` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `settlement` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "expense" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "expense_participants" ALTER COLUMN "paid_amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "owed_amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "settlement" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
