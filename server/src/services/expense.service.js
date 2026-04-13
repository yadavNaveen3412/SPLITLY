export const settleGroupService = async (groupId, prisma) => {
  return prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { id: groupId },
      select: { currentCycleId: true },
    });

    if (!group) throw new Error("Group not found");

    const cycleId = group.currentCycleId;

    const [expenses, settlements, groupMembers] = await Promise.all([
      tx.expense.findMany({
        where: { groupId, cycleId },
        select: { id: true },
      }),
      tx.settlement.findMany({ where: { group_id: groupId, cycleId } }),
      tx.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      }),
    ]);

    // Fetch all participants for the current cycle's expenses in one query
    const expenseIds = expenses.map((e) => e.id);
    const participants = await tx.expenseParticipant.findMany({
      where: { expenseId: { in: expenseIds } },
    });

    // Initialize balances in cents
    const balances = {};
    groupMembers.forEach((m) => (balances[m.userId] = 0));

    // Expenses — sum from participants (cents to avoid JS float precision issues)
    participants.forEach((p) => {
      if (balances[p.userId] === undefined) balances[p.userId] = 0;
      const netCents = Math.round(Number(p.paidAmount) * 100) - Math.round(Number(p.owedAmount) * 100);
      balances[p.userId] += netCents;
    });

    // Settlements — add/subtract in cents
    settlements.forEach((s) => {
      const amountCents = Math.round(Number(s.amount) * 100);
      balances[s.payer_id] += amountCents;
      balances[s.receiver_id] -= amountCents;
    });

    const balanceArray = Object.entries(balances).map(([userId, cents]) => ({
      userId,
      amount: cents / 100, // Convert back to float for output
    }));

    // If all balances are completely 0 cents
    const allZero = Object.values(balances).every((cents) => Math.abs(cents) === 0);

    if (!allZero) {
      return {
        message: "Group is not settled",
        balanceArray,
      };
    }

    // Advance cycle
    await tx.group.update({
      where: { id: groupId },
      data: { currentCycleId: cycleId + 1 },
    });

    return {
      message: "Group Settled",
      balanceArray,
    };
  });
};
