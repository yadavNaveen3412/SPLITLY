import { settlementService } from "../../src/services/settlement.service.js";
import { requireAuth, requireGroupMember } from "../../src/utils/guards.js";

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

      const settlement = await prisma.settlement.create({
        data: {
          group_id,
          payer_id,
          receiver_id,
          amount,
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
      return settlement;
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
      }
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
      }
    ),

    myAllBalances: requireAuth(async (_, { userId }, { prisma, user }) => {
      const resolvedUserId = userId || user.id;
      const settlement = settlementService(prisma);
      return settlement.userAllBalances(resolvedUserId);
    }),

    myFriendBalance: requireAuth(
      async (_, { userId, friendId }, { prisma, user }) => {
        const resolvedUserId = userId || user.id;
        const settlement = settlementService(prisma);
        return settlement.userFriendBalance(resolvedUserId, friendId);
      }
    ),

    myNetWithFriend: requireAuth(
      async (_, { userId, friendId }, { prisma, user }) => {
        const resolvedUserId = userId || user.id;
        const settlement = settlementService(prisma);
        return settlement.calculateNetWithFriend(resolvedUserId, friendId);
      }
    ),
  },
};
