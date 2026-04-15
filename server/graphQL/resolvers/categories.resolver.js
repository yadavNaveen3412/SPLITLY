import { requireAuth } from "../../src/utils/guards.js";

export const categoriesResolvers = {
  Query: {
    getAllCategories: requireAuth(async (_, __, { prisma }) => {
      return await prisma.category.findMany();
    }),
  },
};
