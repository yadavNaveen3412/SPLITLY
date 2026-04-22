/**
 * Balance Service
 * Handles incremental updates to the Balance table.
 *
 * Convention:
 * netAmount in Balance table is positive if user1 owes user2,
 * negative if user2 owes user1.
 */

export const balanceService = (prisma) => {
  const getOrderedUsers = (u1, u2) => {
    return u1 < u2 ? [u1, u2, 1] : [u2, u1, -1];
  };

  /**
   * Updates a bilateral balance between two users in a group.
   * @param {object} tx - Prisma transaction client
   * @param {string} groupId - Group ID
   * @param {string} u1 - User 1 ID
   * @param {string} u2 - User 2 ID
   * @param {number} amountChange - Positive if u1 owes u2 more
   */
  const updateBilateralBalance = async (tx, groupId, u1, u2, amountChange) => {
    const [user1Id, user2Id, multiplier] = getOrderedUsers(u1, u2);
    const netChange = amountChange * multiplier;

    await tx.balance.upsert({
      where: {
        groupId_user1Id_user2Id: { groupId, user1Id, user2Id },
      },
      update: {
        netAmount: { increment: netChange },
      },
      create: {
        groupId,
        user1Id,
        user2Id,
        netAmount: netChange,
      },
    });
  };

  /**
   * Decomposes a multi-party expense into bilateral balance changes.
   */
  const applyExpenseBilateralChanges = async (
    tx,
    groupId,
    participants,
    multiplier = 1,
  ) => {
    // participants: Array<{ userId, paidAmount, owedAmount }>
    const nets = participants.map((p) => ({
      userId: p.userId,
      net: Number(p.paidAmount) - Number(p.owedAmount),
    }));

    const creditors = nets
      .filter((n) => n.net > 0)
      .sort((a, b) => b.net - a.net);
    const debtors = nets
      .filter((n) => n.net < 0)
      .map((n) => ({ userId: n.userId, net: -n.net }))
      .sort((a, b) => b.net - a.net);

    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.net, creditor.net);

      // Debtor owes Creditor 'amount'
      await updateBilateralBalance(
        tx,
        groupId,
        debtor.userId,
        creditor.userId,
        amount * multiplier,
      );

      debtor.net -= amount;
      creditor.net -= amount;

      if (debtor.net < 0.001) i++;
      if (creditor.net < 0.001) j++;
    }
  };

  const updateBalancesForExpense = async (
    tx,
    expense,
    action,
    oldParticipants = [],
  ) => {
    const groupId = expense.groupId;
    if (!groupId) return; // Ignore non-group expenses for now, or handle as needed

    if (action === "DELETE" || action === "UPDATE") {
      // Undo old effects
      await applyExpenseBilateralChanges(tx, groupId, oldParticipants, -1);
    }

    if (action === "CREATE" || action === "UPDATE") {
      // Apply new effects
      await applyExpenseBilateralChanges(tx, groupId, expense.participants, 1);
    }
  };

  const updateBalanceForSettlement = async (tx, settlement, multiplier = 1) => {
    // settlement: { group_id, payer_id, receiver_id, amount }
    // Payer gives money to Receiver, so Payer owes Receiver less.
    await updateBilateralBalance(
      tx,
      settlement.group_id,
      settlement.payer_id,
      settlement.receiver_id,
      -Number(settlement.amount) * multiplier,
    );
  };

  const getUserBalances = async (userId) => {
    // Use UNION ALL for efficiency as requested
    const rawBalances = await prisma.$queryRaw`
      SELECT "groupId", "user1Id", "user2Id", "netAmount"::FLOAT, 'user1' as "role"
      FROM balances
      WHERE "user1Id" = ${userId} AND "netAmount" != 0
      UNION ALL
      SELECT "groupId", "user1Id", "user2Id", "netAmount"::FLOAT, 'user2' as "role"
      FROM balances
      WHERE "user2Id" = ${userId} AND "netAmount" != 0
    `;

    return rawBalances.map((b) => {
      const friendId = b.role === "user1" ? b.user2Id : b.user1Id;
      const amount = b.role === "user1" ? b.netAmount : -b.netAmount;
      return {
        groupId: b.groupId,
        friendId,
        amount,
        type: amount > 0 ? "owe" : "owed",
      };
    });
  };

  return {
    updateBalancesForExpense,
    updateBalanceForSettlement,
    getUserBalances,
    getGroupBalances: async (groupId) => {
      return prisma.balance.findMany({ where: { groupId } });
    },
  };
};
