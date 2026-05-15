/**
 * Higher-order functions to wrap GraphQL resolvers with authentication and authorization logic.
 */

import { AppError } from "../utils/AppError.js";

/**
 * Ensures the user is authenticated.
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} Wrapping function.
 */
export const requireAuth = (resolver) => {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }
    return resolver(parent, args, context, info);
  };
};

/**
 * Ensures the user is a member of the group specified in args.groupId or args.id.
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} Wrapping function.
 */
export const requireGroupMember = (resolver) => {
  return async (parent, args, context, info) => {
    const { prisma, user } = context;
    if (!user) {
      throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }

    const groupId =
      args.groupId ||
      args.group_id ||
      args.id ||
      args.input?.groupId ||
      args.input?.group_id;
    if (!groupId) {
      throw new AppError(400, "VALIDATION_ERROR", "Group ID is required");
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: String(groupId),
        userId: user.id,
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You are not a member of this group",
      );
    }

    return resolver(parent, args, context, info);
  };
};

/**
 * Ensures the user has access to a specific expense.
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} Wrapping function.
 */
export const requireExpenseAccess = (resolver) => {
  return async (parent, args, context, info) => {
    const { prisma, user } = context;
    if (!user) {
      throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }

    const expenseId = args.id || args.expenseId;
    if (!expenseId) {
      throw new AppError(400, "VALIDATION_ERROR", "Expense ID is required");
    }

    const expense = await prisma.expense.findUnique({
      where: { id: String(expenseId) },
      select: { groupId: true },
    });

    if (!expense) {
      throw new AppError(404, "NOT_FOUND", "Expense not found");
    }

    // Reuse group membership check
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: expense.groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have access to this expense",
      );
    }

    return resolver(parent, args, context, info);
  };
};
