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
import { sanitizeString } from "../../src/middleware/sanitizeUserInput.js";

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
      userId: p.userId,
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
  },

  ExpenseParticipant: {
    paidAmount: (parent) => Number(parent.paidAmount),
    owedAmount: (parent) => Number(parent.owedAmount),
  },

  Query: {
    getExpensesByGroup: requireGroupMember(
      async (_, { groupId }, { prisma, user }) => {
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

    getExpenseById: requireExpenseAccess(async (_, { id }, { prisma }) => {
      const expense = await prisma.expense.findUnique({
        where: { id },
        include: {
          category: true,
          createdByUser: {
            select: { id: true, name: true },
          },
          updatedByUser: {
            select: { id: true, name: true },
          },
          group: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          ...PARTICIPANT_INCLUDE,
        },
      });

      if (!expense) return null;
      return expense;
    }),

    getExpenseByFriendId: requireAuth(
      async (_, { friendId }, { prisma, user }) => {
        const sharedGroups = await prisma.group.findMany({
          where: {
            type: { in: ["PERSONAL", "NON_GROUP"] },
            members: {
              some: { userId: user.id },
            },
            AND: {
              members: {
                some: { userId: friendId },
              },
            },
          },
          select: {
            id: true,
          },
        });

        if (sharedGroups.length === 0) return [];

        const groupIds = sharedGroups.map((g) => g.id);

        const expenses = await prisma.expense.findMany({
          where: {
            groupId: { in: groupIds },
            participants: {
              some: { userId: user.id },
            },
          },
          include: {
            category: true,
            group: true,
            createdByUser: true,
            ...PARTICIPANT_INCLUDE,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return simplifyExpensesByFriendId(expenses, user.id, friendId);
      },
    ),
  },

  Mutation: {
    createExpense: requireAuth(async (_, { input }, { prisma, user }) => {
      let {
        title,
        description,
        groupId,
        totalAmount,
        categoryId,
        splitMethod,
        participants,
      } = input;

      title = sanitizeString(title);
      description = sanitizeString(description);

      if (!title || title.length < 3 || title.length > 50) {
        throw new Error("Expense title must be between 3 and 50 characters.");
      }

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
    }),

    updateExpense: requireExpenseAccess(
      async (_, { id, input }, { prisma, user }) => {
        const existing = await prisma.expense.findUnique({
          where: { id },
          include: { participants: true },
        });

        if (!existing) {
          throw new Error("Expense doesn't exist");
        }

        let {
          title,
          description,
          totalAmount,
          categoryId,
          splitMethod,
          participants,
          is_settled,
        } = input;

        title = sanitizeString(title);
        description = sanitizeString(description);

        if (title !== undefined && (title.length < 3 || title.length > 50)) {
          throw new Error("Expense title must be between 3 and 50 characters.");
        }

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
              throw new Error("splitMethod is required when updating splits.");
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
      const existing = await prisma.expense.findUnique({
        where: { id },
        include: { participants: true },
      });

      if (!existing) throw new Error("Expense not found");

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
        return settleGroupService(groupId, prisma);
      },
    ),
  },
};
