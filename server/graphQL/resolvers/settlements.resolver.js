import { settlementService } from "../../src/services/settlement.service.js";

export const settlementsResolvers = {
  Settlement: {
    amount: (parent) => Number(parent.amount),
  },

  Mutation: {
    async createSettlement(_, { input }, { prisma, user }) {
      if (!user) {
        throw new Error("User not authenticated");
      }

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
    },
  },

  Query: {
    async getSettlementsByGroup(_, { group_id }, { prisma }) {
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

    async groupSettlements(_, { groupId }, { prisma, user }) {
      if (!user?.id) {
        throw new Error("Authentication Required!!");
      }

      const settlement = settlementService(prisma);
      return settlement.computeSettlements(groupId);
    },

    async myGroupBalances(_, { userId, groupId }, { prisma, user }) {
      const resolvedUserId = userId || user?.id;
      if (!resolvedUserId) {
        throw new Error("Authentication Required!!");
      }

      const settlement = settlementService(prisma);
      return settlement.calculateUserBalanceList(resolvedUserId, groupId);
    },

    async myAllBalances(_, { userId }, { prisma, user }) {
      const resolvedUserId = userId || user?.id;
      if (!resolvedUserId) {
        throw new Error("Authentication Required!!");
      }

      const settlement = settlementService(prisma);
      return settlement.userAllBalances(resolvedUserId);
    },

    async myFriendBalance(_, { userId, friendId }, { prisma, user }) {
      const resolvedUserId = userId || user?.id;
      if (!resolvedUserId) {
        throw new Error("Authentication Required!!");
      }

      const settlement = settlementService(prisma);
      return settlement.userFriendBalance(resolvedUserId, friendId);
    },

    async myNetWithFriend(_, { userId, friendId }, { prisma, user }) {
      const resolvedUserId = userId || user?.id;
      if (!resolvedUserId) {
        throw new Error("Authentication Required!!");
      }

      const settlement = settlementService(prisma);
      return settlement.calculateNetWithFriend(resolvedUserId, friendId);
    },
  },
};
