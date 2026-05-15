import { DateTimeResolver } from "graphql-scalars";
import { simplifyExpensesByFriendId } from "../../src/utils/expenseHelper.js";
import { settleGroupService } from "../../src/services/expense.service.js";
import { balanceService } from "../../src/services/balance.service.js";
import {
  calculateOwedAmounts,
  validateSplit,
} from "@splitly/expense-split-logic";
import {
  requireAuth,
  requireGroupMember,
  requireExpenseAccess,
} from "../../src/middleware/guards.js";
import {
  sanitizeString,
  validateAmount,
  validateExpenseTitle,
  validateSplitMethod,
  validateUUID,
} from "../../src/utils/validation.js";
import { AppError } from "../../src/utils/AppError.js";

const PARTICIPANT_INCLUDE = {
  participants: {
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  },
};

const prepareServerParticipants = (
  totalAmount,
  splitMethod,
  rawParticipants,
) => {
  totalAmount = validateAmount(totalAmount);
  if (!rawParticipants || rawParticipants.length === 0) return [];

  // 1. Calculate the exact owed amounts using shared logic
  const owedAssignments = calculateOwedAmounts(
    totalAmount,
    splitMethod,
    rawParticipants,
  );

  // 2. Map back to participant format for validation
  const finalParticipants = rawParticipants.map((p) => {
    const owed =
      owedAssignments.find((a) => a.userId === p.userId)?.owedAmount || 0;
    return {
      userId: validateUUID(p.userId),
      paidAmount: Number(p.paidAmount),
      owedAmount: owed,
    };
  });

  // 3. Strict financial integrity check (SUM(paid) === total AND SUM(owed) === total)
  validateSplit(totalAmount, finalParticipants);

  return finalParticipants;
};

export const expensesResolvers = {
  DateTime: DateTimeResolver,

  Expense: {
    totalAmount: (parent) => Number(parent.totalAmount),
    amount: (parent, _, { user }) => {
      if (!user) return 0;
      const participant = parent.participants?.find(
        (p) => p.userId === user.id,
      );
      if (!participant) return 0;
      return Number(participant.paidAmount) - Number(participant.owedAmount);
    },
    type: (parent, _, { user }) => {
      if (!user) return "not-involved";
      const participant = parent.participants?.find(
        (p) => p.userId === user.id,
      );
      if (!participant) return "not-involved";
      const amount =
        Number(participant.paidAmount) - Number(participant.owedAmount);
      if (amount > 0) return "owed";
      if (amount < 0) return "owe";
      return "no-balance";
    },
  },

  ExpenseParticipant: {
    paidAmount: (parent) => Number(parent.paidAmount),
    owedAmount: (parent) => Number(parent.owedAmount),
  },

  Query: {
    getGroupExpenses: requireGroupMember(
      async (_, { groupId }, { prisma, user }) => {
        groupId = validateUUID(groupId);
        return await prisma.expense.findMany({
          where: {
            groupId,
            participants: {
              some: { userId: user.id },
            },
          },
          orderBy: { createdAt: "desc" },
          include: {
            category: true,
            group: true,
            createdByUser: true,
            ...PARTICIPANT_INCLUDE,
          },
        });
      },
    ),

    getFriendExpenses: requireAuth(
      async (_, { friendId }, { prisma, user }) => {
        friendId = validateUUID(friendId);
        // 1. Find groups shared between user and friend
        const sharedGroups = await prisma.group.findMany({
          where: {
            members: { some: { userId: user.id } },
            AND: { members: { some: { userId: friendId } } },
          },
          include: {
            members: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        });

        if (sharedGroups.length === 0) {
          return { directExpenses: [], groupSummaries: [] };
        }

        const directGroupIds = sharedGroups
          .filter((g) => g.type === "PERSONAL" || g.type === "NON_GROUP")
          .map((g) => g.id);

        const formalGroupIds = sharedGroups
          .filter((g) => g.type === "GROUP")
          .map((g) => g.id);

        // 2. Fetch direct expenses
        const directExpenses = await prisma.expense.findMany({
          where: {
            groupId: { in: directGroupIds },
            participants: { some: { userId: user.id } },
          },
          include: {
            category: true,
            group: true,
            createdByUser: true,
            participants: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // 3. Calculate summary for formal GROUPs
        const bService = balanceService(prisma);
        const allBalances = await bService.getUserBalances(user.id);

        const groupSummaries = allBalances
          .filter(
            (b) =>
              b.friendId === friendId && formalGroupIds.includes(b.groupId),
          )
          .map((b) => {
            const group = sharedGroups.find((g) => g.id === b.groupId);
            return {
              groupId: b.groupId,
              groupName: group.title,
              amount: Math.abs(b.amount),
              type: b.amount > 0 ? "owe" : "owed",
            };
          });

        return { directExpenses, groupSummaries };
      },
    ),
  },

  Mutation: {
    createExpense: requireGroupMember(
      async (_, { input }, { prisma, user }) => {
        const title = validateExpenseTitle(input.title);
        const description = sanitizeString(input.description);
        const groupId = validateUUID(input.groupId);
        const totalAmount = validateAmount(input.totalAmount);
        const categoryId = validateUUID(input.categoryId);
        const splitMethod = validateSplitMethod(input.splitMethod);
        const participants = input.participants;

        const serverParticipants = prepareServerParticipants(
          totalAmount,
          splitMethod,
          participants,
        );

        let cycleId = 1;
        if (groupId) {
          const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { currentCycleId: true },
          });
          cycleId = group?.currentCycleId ?? 1;
        }

        const bService = balanceService(prisma);

        return await prisma.$transaction(async (tx) => {
          const createdExpense = await tx.expense.create({
            data: {
              title,
              description: description || null,
              groupId,
              totalAmount: Number(totalAmount),
              categoryId,
              created_by: user.id,
              cycleId,
              participants: {
                create: serverParticipants.map((p) => ({
                  userId: p.userId,
                  paidAmount: p.paidAmount,
                  owedAmount: p.owedAmount,
                  groupId,
                })),
              },
            },
            include: {
              category: true,
              group: true,
              createdByUser: true,
              ...PARTICIPANT_INCLUDE,
            },
          });

          await bService.updateBalancesForExpense(tx, createdExpense, "CREATE");
          return createdExpense;
        });
      },
    ),

    updateExpense: requireExpenseAccess(
      async (_, { id, input }, { prisma, user }) => {
        id = validateUUID(id);
        const existing = await prisma.expense.findUnique({
          where: { id },
          include: { participants: true },
        });

        if (!existing) {
          throw new AppError(404, "NOT_FOUND", "Expense not found");
        }

        const title = validateExpenseTitle(input.title);
        const description = sanitizeString(input.description);
        const totalAmount = validateAmount(input.totalAmount);
        const categoryId = validateUUID(input.categoryId);
        const splitMethod = validateSplitMethod(input.splitMethod);
        const participants = input.participants;
        const is_settled = input.is_settled;

        const bService = balanceService(prisma);

        return await prisma.$transaction(async (tx) => {
          // 1. Undo old balance effects
          await bService.updateBalancesForExpense(
            tx,
            existing,
            "DELETE",
            existing.participants,
          );

          // 2. Update participants if provided
          if (participants) {
            if (!splitMethod) {
              throw new AppError(
                400,
                "VALIDATION_ERROR",
                "Split method is required when updating participants.",
              );
            }
            const validationTotal = totalAmount ?? existing.totalAmount;
            const serverParticipants = prepareServerParticipants(
              validationTotal,
              splitMethod,
              participants,
            );

            await tx.expenseParticipant.deleteMany({
              where: { expenseId: id },
            });

            await tx.expenseParticipant.createMany({
              data: serverParticipants.map((p) => ({
                expenseId: id,
                userId: p.userId,
                paidAmount: p.paidAmount,
                owedAmount: p.owedAmount,
                groupId: existing.groupId,
              })),
            });
          }

          // 3. Update expense core
          const updated = await tx.expense.update({
            where: { id },
            data: {
              title: title ?? existing.title,
              description: description ?? existing.description,
              totalAmount: totalAmount ?? existing.totalAmount,
              categoryId: categoryId ?? existing.categoryId,
              is_Settled: is_settled ?? existing.is_Settled,
              updated_by: user.id,
            },
            include: {
              category: true,
              group: true,
              createdByUser: true,
              ...PARTICIPANT_INCLUDE,
            },
          });

          // 4. Apply new balance effects
          await bService.updateBalancesForExpense(tx, updated, "CREATE");
          return updated;
        });
      },
    ),

    deleteExpense: requireExpenseAccess(async (_, { id }, { prisma, user }) => {
      id = validateUUID(id);
      const existing = await prisma.expense.findUnique({
        where: { id },
        include: { participants: true },
      });

      if (!existing) throw new AppError(404, "NOT_FOUND", "Expense not found");

      const bService = balanceService(prisma);

      await prisma.$transaction(async (tx) => {
        // 1. Undo balance effects
        await bService.updateBalancesForExpense(
          tx,
          existing,
          "DELETE",
          existing.participants,
        );
        // 2. Delete expense
        await tx.expense.delete({ where: { id } });
      });

      return true;
    }),

    settleGroup: requireGroupMember(
      async (_, { groupId }, { prisma, user }) => {
        groupId = validateUUID(groupId);
        return settleGroupService(groupId, prisma);
      },
    ),
  },
};
