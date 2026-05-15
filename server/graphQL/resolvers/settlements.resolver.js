import { settlementService } from "../../src/services/settlement.service.js";
import { balanceService } from "../../src/services/balance.service.js";
import {
  requireAuth,
  requireGroupMember,
} from "../../src/middleware/guards.js";
import { validateAmount, validateUUID } from "../../src/utils/validation.js";
import { AppError } from "../../src/utils/AppError.js";

export const settlementsResolvers = {
  Settlement: {
    amount: (parent) => Number(parent.amount),
  },

  Mutation: {
    createSettlement: requireGroupMember(
      async (_, { input }, { prisma, user }) => {
        const group_id = validateUUID(input.group_id);
        const payer_id = validateUUID(input.payer_id);
        const receiver_id = validateUUID(input.receiver_id);
        const amount = validateAmount(input.amount);

        if (payer_id === receiver_id) {
          throw new AppError(
            400,
            "VALIDATION_ERROR",
            "Payer and receiver cannot be the same",
          );
        }

        const group = await prisma.group.findUnique({
          where: { id: group_id },
          select: { currentCycleId: true },
        });

        if (!group) throw new AppError(404, "NOT_FOUND", "Group not found");

        const bService = balanceService(prisma);

        return await prisma.$transaction(async (tx) => {
          const settlement = await tx.settlement.create({
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

          await bService.updateBalanceForSettlement(tx, settlement);
          return settlement;
        });
      },
    ),
  },

  Query: {
    getSettlementsByGroup: requireGroupMember(
      async (_, { group_id }, { prisma, user }) => {
        group_id = validateUUID(group_id);
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

    groupSettlements: requireGroupMember(
      async (_, { groupId }, { prisma, user }) => {
        groupId = validateUUID(groupId);
        const settlement = settlementService(prisma);
        return settlement.computeSettlements(groupId);
      },
    ),

    myGroupBalances: requireGroupMember(
      async (_, { groupId }, { prisma, user }) => {
        groupId = validateUUID(groupId);
        const settlement = settlementService(prisma);
        return settlement.calculateUserBalanceList(user.id, groupId);
      },
    ),

    myAllBalances: requireAuth(async (_, __, { prisma, user }) => {
      const settlement = settlementService(prisma);
      return await settlement.userAllBalances(user.id);
    }),

    myFriendBalance: requireAuth(async (_, { friendId }, { prisma, user }) => {
      friendId = validateUUID(friendId);
      const settlement = settlementService(prisma);
      return settlement.userFriendBalance(user.id, friendId);
    }),

    myNetWithFriend: requireAuth(async (_, { friendId }, { prisma, user }) => {
      friendId = validateUUID(friendId);
      const settlement = settlementService(prisma);
      return settlement.calculateNetWithFriend(user.id, friendId);
    }),
  },
};
