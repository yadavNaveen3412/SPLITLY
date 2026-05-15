import { AppError } from "../utils/AppError.js";

export const settleGroupService = async (groupId, prisma) => {
  return prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id: groupId },
      select: { currentCycleId: true },
    });

    if (!group) throw new AppError(404, "NOT_FOUND", "Group not found");

    const cycleId = group.currentCycleId;

    // A group is settled if all bilateral balances are 0
    const balances = await tx.balance.findMany({
      where: { groupId },
    });

    const nonZeroBalances = balances.filter(
      (b) => Math.abs(Number(b.netAmount)) > 0.001,
    );

    if (nonZeroBalances.length > 0) {
      return {
        message: "Group is not settled",
        // Map back to the expected payload format if needed
        balanceArray: nonZeroBalances.map((b) => ({
          userId: b.user1Id,
          amount: b.netAmount,
        })),
      };
    }

    // Advance cycle
    await tx.group.update({
      where: { id: groupId },
      data: { currentCycleId: cycleId + 1 },
    });

    return {
      message: "Group Settled",
      balanceArray: [],
    };
  });
};
