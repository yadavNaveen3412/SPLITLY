-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Balance_groupId_user1Id_idx" ON "Balance"("groupId", "user1Id");

-- CreateIndex
CREATE INDEX "Balance_groupId_user2Id_idx" ON "Balance"("groupId", "user2Id");

-- CreateIndex
CREATE INDEX "Balance_user1Id_idx" ON "Balance"("user1Id");

-- CreateIndex
CREATE INDEX "Balance_user2Id_idx" ON "Balance"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_groupId_user1Id_user2Id_key" ON "Balance"("groupId", "user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
