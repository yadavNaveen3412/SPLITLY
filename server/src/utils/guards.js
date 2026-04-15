/**
 * Higher-order functions to wrap GraphQL resolvers with authentication and authorization logic.
 */

/**
 * Ensures the user is authenticated.
 * @param {Function} resolver - The resolver function to wrap.
 * @returns {Function} Wrapping function.
 */
export const requireAuth = (resolver) => {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new Error("Authentication required");
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
      throw new Error("Authentication required");
    }

    const groupId = args.groupId || args.group_id || args.id;
    if (!groupId) {
      throw new Error("GroupId is required for authorization check");
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: String(groupId),
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("Forbidden: You are not a member of this group");
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
      throw new Error("Authentication required");
    }

    const expenseId = args.id || args.expenseId;
    if (!expenseId) {
      throw new Error("ExpenseId is required for authorization check");
    }

    const expense = await prisma.expense.findUnique({
      where: { id: String(expenseId) },
      select: { groupId: true },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    // Reuse group membership check
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: expense.groupId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new Error("Forbidden: You do not have access to this expense");
    }

    return resolver(parent, args, context, info);
  };
};
