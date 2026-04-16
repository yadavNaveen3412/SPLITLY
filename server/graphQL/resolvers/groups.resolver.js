import crypto from "crypto";
import {
  requireAuth,
  requireGroupMember,
} from "../../src/middleware/guards.js";
import { sanitizeString } from "../../src/middleware/sanitizeUserInput.js";

export const groupResolvers = {
  Query: {
    getGroups: requireAuth((_, { type }, { prisma, user }) => {
      return prisma.group.findMany({
        where: {
          AND: [
            {
              OR: [
                { createdById: user.id },
                { members: { some: { userId: user.id } } },
              ],
            },
            ...(type ? [{ type }] : []),
          ],
        },
        include: {
          members: {
            include: { user: true },
          },
        },
      });
    }),

    getGroupDetails: requireGroupMember((_, { id }, { prisma, user }) => {
      return prisma.group.findUnique({
        where: { id: String(id) },
        include: {
          members: { include: { user: true } },
        },
      });
    }),

    getPersonalGroupId: requireAuth(
      async (_, { otherUserId }, { prisma, user }) => {
        const currentUserId = user.id;
        if (!otherUserId) {
          throw new Error("otherUserId required");
        }

        if (currentUserId === otherUserId) {
          return null;
        }

        const result = await prisma.$queryRaw`
        SELECT g.id
        FROM groups g
        JOIN group_members gm ON gm."groupId" = g.id
        WHERE g.type = 'PERSONAL'
          AND gm."userId" IN (${currentUserId}, ${otherUserId})
        GROUP BY g.id
        HAVING COUNT(DISTINCT gm."userId") = 2
          AND COUNT(*) = 2
        LIMIT 1;
      `;

        return result && result.length ? result[0].id : null;
      },
    ),

    getCommonGroups: requireAuth(async (_, { friendId }, { prisma, user }) => {
      const groups = await prisma.group.findMany({
        where: {
          type: "GROUP",
          AND: [
            {
              members: {
                some: { userId: user.id },
              },
            },
            {
              members: {
                some: { userId: friendId },
              },
            },
          ],
        },
      });
      return groups;
    }),
  },
  Mutation: {
    createGroup: requireAuth(
      async (_, { title, type, members = [] }, { prisma, user }) => {
        const groupType = type || "GROUP";
        title = sanitizeString(title);

        if (!title || title.length < 3 || title.length > 50) {
          throw new Error("Group title must be between 3 and 50 characters.");
        }

        const newGroup = await prisma.group.create({
          data: {
            title,
            type: groupType,
            createdById: user.id,
            members: {
              create: {
                userId: user.id,
              },
            },
          },
          include: {
            members: {
              include: { user: true },
            },
          },
        });
        return newGroup;
      },
    ),

    addMemberToGroup: requireGroupMember(
      async (_, { groupId, emails }, { prisma }) => {
        const added = [];
        const invited = [];
        const alreadyMembers = [];

        for (const email of emails) {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            invited.push(email);
            continue;
          }

          const existing = await prisma.groupMember.findFirst({
            where: { groupId, userId: user.id },
          });

          if (existing) {
            alreadyMembers.push(email);
            continue;
          }

          await prisma.groupMember.create({
            data: {
              groupId,
              userId: user.id,
            },
          });

          added.push(email);
        }

        const updatedGroup = await prisma.group.findUnique({
          where: { id: groupId },

          include: {
            members: { include: { user: true } },
          },
        });
        return { added, invited, alreadyMembers, updatedGroup };
      },
    ),

    renameGroup: requireGroupMember(
      async (_, { groupId, title }, { prisma }) => {
        title = sanitizeString(title);

        if (!title || title.length < 3 || title.length > 50) {
          throw new Error("Group title must be between 3 and 50 characters.");
        }

        return prisma.group.update({
          where: { id: groupId },
          data: { title },
          include: { members: { include: { user: true } } },
        });
      },
    ),

    deleteGroup: requireGroupMember(async (_, { groupId }, { prisma }) => {
      const deletedG = await prisma.group.delete({
        where: { id: groupId },
      });
      return !!deletedG;
    }),

    getOrCreateNonGroup: requireAuth(
      async (_, { memberIds }, { prisma, user }) => {
        const normalizedMemberIds = [...new Set(memberIds)].sort();
        const groups = await prisma.group.findMany({
          where: {
            type: "NON_GROUP",
            members: {
              every: {
                userId: { in: normalizedMemberIds },
              },
            },
          },
          include: {
            _count: { select: { members: true } },
          },
        });

        const exactGroup = groups.find(
          (g) => g._count.members === normalizedMemberIds.length,
        );

        if (!exactGroup) {
          const key = normalizedMemberIds.join("|");
          const title = crypto
            .createHash("sha256")
            .update(key)
            .digest("hex")
            .slice(0, 10);
          const newGroup = await prisma.group.create({
            data: {
              title,
              type: "NON_GROUP",
              createdById: user.id,
              members: {
                create: {
                  userId: user.id,
                },
              },
            },
            include: {
              members: {
                include: { user: true },
              },
            },
          });

          const friendIds = normalizedMemberIds.filter((id) => id !== user.id);

          for (const friendId of friendIds) {
            await prisma.groupMember.create({
              data: {
                groupId: newGroup.id,
                userId: friendId,
              },
            });
          }

          return newGroup;
        }

        return exactGroup;
      },
    ),
  },
};
