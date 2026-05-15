import crypto from "crypto";
import {
  requireAuth,
  requireGroupMember,
} from "../../src/middleware/guards.js";
import { groupService } from "../../src/services/group.service.js";
import {
  validateGroupTitle,
  validateGroupType,
  validateProfilePic,
  validateProfilePicVersion,
  validateUUID,
} from "../../src/utils/validation.js";
import { AppError } from "../../src/utils/AppError.js";

export const groupResolvers = {
  Query: {
    getGroups: requireAuth((_, { type }, { prisma, user }) => {
      type = validateGroupType(type);
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
      const groupId = validateUUID(id);
      return prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: { include: { user: true } },
        },
      });
    }),

    getPersonalGroupId: requireAuth(
      async (_, { otherUserId }, { prisma, user }) => {
        otherUserId = validateUUID(otherUserId);
        if (!otherUserId) {
          throw new AppError(
            400,
            "VALIDATION_ERROR",
            "Other user ID is required",
          );
        }

        if (user.id === otherUserId) {
          return null;
        }

        const result = await prisma.$queryRaw`
        SELECT g.id
        FROM groups g
        JOIN group_members gm ON gm."groupId" = g.id
        WHERE g.type = 'PERSONAL'
          AND gm."userId" IN (${user.id}, ${otherUserId})
        GROUP BY g.id
        HAVING COUNT(DISTINCT gm."userId") = 2
          AND COUNT(*) = 2
        LIMIT 1;
      `;

        return result && result.length ? result[0].id : null;
      },
    ),

    getCommonGroups: requireAuth(async (_, { friendId }, { prisma, user }) => {
      friendId = validateUUID(friendId);
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
    createGroup: requireAuth(async (_, { input }, { prisma, user }) => {
      const gService = groupService(prisma);
      return gService.createGroup(input, user);
    }),

    addMemberToGroup: requireGroupMember(
      async (_, { groupId, userIds }, { prisma, user }) => {
        groupId = validateUUID(groupId);

        userIds = [...new Set(userIds)].map(validateUUID);

        if (!userIds.length) {
          throw new AppError(
            400,
            "VALIDATION_ERROR",
            "At least one member is required",
          );
        }
        const gService = groupService(prisma);
        return gService.addMembersToGroup(groupId, userIds);
      },
    ),

    editGroupDetails: requireGroupMember(
      async (
        _,
        { groupId, title, profilePic, profilePicVersion },
        { prisma, user },
      ) => {
        title = validateGroupTitle(title);
        groupId = validateUUID(groupId);
        profilePic = validateProfilePic(profilePic);
        profilePicVersion = validateProfilePicVersion(profilePicVersion);

        return prisma.group.update({
          where: { id: groupId },
          data: { title, profilePic, profilePicVersion },
          include: { members: { include: { user: true } } },
        });
      },
    ),

    deleteGroup: requireGroupMember(
      async (_, { groupId }, { prisma, user }) => {
        groupId = validateUUID(groupId);
        const deletedG = await prisma.group.delete({
          where: { id: groupId },
        });
        return !!deletedG;
      },
    ),

    getOrCreateNonGroup: requireAuth(
      async (_, { memberIds }, { prisma, user }) => {
        const normalizedMemberIds = [...new Set([memberIds, user.id])]
          .map(validateUUID)
          .sort();

        if (normalizedMemberIds.length < 2) {
          throw new AppError(
            400,
            "VALIDATION_ERROR",
            "At least 2 members are required",
          );
        }
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
