import { settleGroupService } from "./expense.service.js";

/**
 * Factory function
 * Call this ONCE per request with prisma from context
 */
export const settlementService = (prisma) => {
  /* ----------------------------------
     Internal helpers
  ---------------------------------- */

  const splitBalances = (balances) => {
    const owed = [];
    const owes = [];

    for (const [userId, balance] of Object.entries(balances)) {
      // Round to nearest cent to eliminate floating point inaccuracies entirely
      const roundedCents = Math.round(Number(balance) * 100);

      if (roundedCents > 0) {
        owed.push({ userId, cents: roundedCents });
      } else if (roundedCents < 0) {
        owes.push({ userId, cents: -roundedCents });
      }
    }

    owed.sort((a, b) => b.cents - a.cents);
    owes.sort((a, b) => b.cents - a.cents);

    return { owed, owes };
  };

  const settleUp = (owed, owes) => {
    const transactions = [];
    let i = 0,
      j = 0;

    while (i < owes.length && j < owed.length) {
      const debtor = owes[i];
      const creditor = owed[j];

      // Exact integer math to find minimum cent amount to settle
      const cents = Math.min(debtor.cents, creditor.cents);

      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: cents / 100, // Return normalized float for db/graphql
      });

      debtor.cents -= cents;
      creditor.cents -= cents;

      if (debtor.cents === 0) i++;
      if (creditor.cents === 0) j++;
    }

    return transactions;
  };

  /* ----------------------------------
     Groups (ALL types)
  ---------------------------------- */

  const getAllUserGroups = async (userId) => {
    return prisma.group.findMany({
      where: {
        OR: [{ createdById: userId }, { members: { some: { userId } } }],
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  };

  /* ----------------------------------
     Core settlement APIs
  ---------------------------------- */

  const computeSettlements = async (groupId) => {
    const { message, balanceArray } = await settleGroupService(groupId, prisma);

    if (message === "Group Settled") {
      return [];
    }

    const balances = Object.fromEntries(
      balanceArray.map((b) => [b.userId, b.amount])
    );

    const { owed, owes } = splitBalances(balances);
    return settleUp(owed, owes);
  };

  const calculateUserBalanceList = async (userId, groupId) => {
    const transactions = await computeSettlements(groupId);

    return transactions
      .filter((t) => t.from === userId || t.to === userId)
      .map((t) => ({
        type: t.from === userId ? "owe" : "owed",
        person: t.from === userId ? t.to : t.from,
        amount: t.amount,
      }));
  };

  const userAllBalances = async (userId) => {
    const groups = await getAllUserGroups(userId);
    const allTransactions = [];

    for (const group of groups) {
      const txns = await calculateUserBalanceList(userId, group.id);

      allTransactions.push(
        ...txns.map((t) => ({
          ...t,
          groupId: group.id,
          groupType: group.type,
          groupTitle: group.title,
        }))
      );
    }

    return allTransactions;
  };

  const userFriendBalance = async (userId, friendId) => {
    const allTransactions = await userAllBalances(userId);
    return allTransactions.filter((t) => t.person === friendId);
  };

  const calculateNetWithFriend = async (userId, friendId) => {
    const friendTransactions = await userFriendBalance(userId, friendId);

    return friendTransactions.reduce((net, t) => {
      if (t.type === "owed") return net + t.amount;
      if (t.type === "owe") return net - t.amount;
      return net;
    }, 0);
  };

  /* ----------------------------------
     Public API
  ---------------------------------- */

  return {
    computeSettlements,
    calculateUserBalanceList,
    userAllBalances,
    userFriendBalance,
    calculateNetWithFriend,
  };
};
