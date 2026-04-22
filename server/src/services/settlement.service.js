import { balanceService } from "./balance.service.js";

/**
 * Factory function
 * Call this ONCE per request with prisma from context
 */
export const settlementService = (prisma) => {
  const bService = balanceService(prisma);
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
     Core settlement APIs
  ---------------------------------- */

  const computeSettlements = async (groupId) => {
    const balancesRaw = await bService.getGroupBalances(groupId);

    const balances = {};
    balancesRaw.forEach((br) => {
      if (!balances[br.user1Id]) balances[br.user1Id] = 0;
      if (!balances[br.user2Id]) balances[br.user2Id] = 0;

      const amount = Number(br.netAmount);
      // user1 owes user2 positive amount
      balances[br.user1Id] -= amount;
      balances[br.user2Id] += amount;
    });

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
    // This uses the efficient getUserBalances which uses UNION ALL
    const balances = await bService.getUserBalances(userId);

    // We need group metadata for the response
    const groupIds = Array.from(new Set(balances.map((b) => b.groupId)));
    const groups = await prisma.group.findMany({
      where: { id: { in: groupIds } },
      select: { id: true, type: true, title: true },
    });
    const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));

    return balances.map((b) => ({
      type: b.type,
      person: b.friendId,
      amount: Math.abs(b.amount),
      groupId: b.groupId,
      groupType: groupMap[b.groupId]?.type,
      groupTitle: groupMap[b.groupId]?.title,
    }));
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

