import { DateTimeResolver } from "graphql-scalars";
import { simplifyExpensesByFriendId } from "../../src/utils/expenseHelper.js";
import { settleGroupService } from "../../src/services/expense.service.js";

const PARTICIPANT_INCLUDE = {
  participants: {
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  },
};

export const expensesResolvers = {
  DateTime: DateTimeResolver,

  Query: {
    async getExpensesByGroup(_, { groupId }, { prisma }) {
      return await prisma.expense.findMany({
        where: { groupId },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          group: true,
          createdByUser: true,
          ...PARTICIPANT_INCLUDE,
        },
      });
    },

    async getExpenseById(_, { id }, { prisma }) {
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
    },

    async getExpenseByFriendId(_, { friendId }, { prisma, user }) {
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
  },

  Mutation: {
    async createExpense(_, { input }, { prisma, user }) {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const { title, description, groupId, totalAmount, categoryId, participants } =
        input;

      let cycleId = 1;
      if (groupId) {
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          select: { currentCycleId: true },
        });
        cycleId = group?.currentCycleId ?? 1;
      }

      const expense = await prisma.expense.create({
        data: {
          title,
          description: description || null,
          groupId,
          totalAmount: Number(totalAmount),
          categoryId,
          created_by: user.id,
          cycleId,
          participants: {
            create: participants.map((p) => ({
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

      return expense;
    },

    async updateExpense(_, { id, input }, { prisma, user }) {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const existing = await prisma.expense.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Expense doesn't exist");
      }

      const { title, description, totalAmount, categoryId, participants, is_settled } =
        input;

      const updatedExpense = await prisma.$transaction(async (tx) => {
        // If participants are being updated, replace them atomically
        if (participants) {
          await tx.expenseParticipant.deleteMany({
            where: { expenseId: id },
          });

          await tx.expenseParticipant.createMany({
            data: participants.map((p) => ({
              expenseId: id,
              userId: p.userId,
              paidAmount: p.paidAmount,
              owedAmount: p.owedAmount,
              groupId: existing.groupId,
            })),
          });
        }

        return tx.expense.update({
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
      });

      return updatedExpense;
    },

    async deleteExpense(_, { id }, { prisma, user }) {
      if (!user) throw new Error("User not authenticated");

      const existing = await prisma.expense.findUnique({
        where: { id },
      });

      if (!existing) throw new Error("Expense not found");

      // ExpenseParticipant rows are cascade-deleted automatically
      const res = await prisma.expense.delete({ where: { id } });
      return !!res;
    },

    async settleGroup(_, { groupId }, { prisma, user }) {
      if (!user) throw new Error("User not authenticated");
      return settleGroupService(groupId, prisma);
    },
  },
};
