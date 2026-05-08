import { settlementService } from "../../src/services/settlement.service.js";
import { balanceService } from "../../src/services/balance.service.js";
import {
  requireAuth,
  requireGroupMember,
} from "../../src/middleware/guards.js";

export const settlementsResolvers = {
  Settlement: {
    amount: (parent) => Number(parent.amount),
  },

  Mutation: {
    createSettlement: requireAuth(async (_, { input }, { prisma, user }) => {
      const { group_id, payer_id, receiver_id, amount } = input;

      const group = await prisma.group.findUnique({
        where: { id: group_id },
        select: { currentCycleId: true },
      });

      if (!group) throw new Error("Group not found");

      const bService = balanceService(prisma);

      return await prisma.$transaction(async (tx) => {
        const settlement = await tx.settlement.create({
          data: {
            group_id,
            payer_id,
            receiver_id,
            amount: Number(amount),
            created_by: user.id,
            cycleId: group.currentCycleId,
          },
          include: {
            group: true,
            payer: true,
            receiver: true,
            settlementCreator: true,
          },
        });

        await bService.updateBalanceForSettlement(tx, settlement);
        return settlement;
      });
    }),
  },

  Query: {
    getSettlementsByGroup: requireGroupMember(
      async (_, { group_id }, { prisma }) => {
        return await prisma.settlement.findMany({
          where: { group_id },

          include: {
            group: true,
            payer: true,
            receiver: true,
            settlementCreator: true,
          },
        });
      },
    ),

    groupSettlements: requireGroupMember(async (_, { groupId }, { prisma }) => {
      const settlement = settlementService(prisma);
      return settlement.computeSettlements(groupId);
    }),

    myGroupBalances: requireGroupMember(
      async (_, { userId, groupId }, { prisma, user }) => {
        const resolvedUserId = userId || user.id;
        const settlement = settlementService(prisma);
        return settlement.calculateUserBalanceList(resolvedUserId, groupId);
      },
    ),

    myAllBalances: requireAuth(async (_, { userId }, { prisma, user }) => {
      const resolvedUserId = userId || user.id;
      const settlement = settlementService(prisma);
      return await settlement.userAllBalances(resolvedUserId);
    }),

    myFriendBalance: requireAuth(
      async (_, { userId, friendId }, { prisma, user }) => {
        const resolvedUserId = userId || user.id;
        const settlement = settlementService(prisma);
        return settlement.userFriendBalance(resolvedUserId, friendId);
      },
    ),

    myNetWithFriend: requireAuth(
      async (_, { userId, friendId }, { prisma, user }) => {
        const resolvedUserId = userId || user.id;
        const settlement = settlementService(prisma);
        return settlement.calculateNetWithFriend(resolvedUserId, friendId);
      },
    ),
  },
};
