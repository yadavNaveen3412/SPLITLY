import { requireAuth } from "../../src/middleware/guards.js";

export const friendsResolvers = {
  Query: {
    getAllFriends: requireAuth(async (_, __, { prisma, user }) => {
      const groups = await prisma.group.findMany({
        where: {
          OR: [{ type: "PERSONAL" }, { type: "GROUP" }],
          members: { some: { userId: user.id } },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      const friendsMap = new Map();

      for (const group of groups) {
        if (!group.members || group.members.length === 0) continue;

        for (const member of group.members) {
          if (!member.user || member.user.id === user.id) continue;

          const friend = member.user;
          const key = friend.id;

          const existing = friendsMap.get(key);

          // 👉 If not present → add
          if (!existing) {
            friendsMap.set(key, {
              id: friend.id,
              name: friend.name,
              email: friend.email,
              contact: friend.contact,
              profilePic: friend.profilePic,
              profilePicVersion: friend.profilePicVersion,
              groupId: group.id,
              groupTitle: group.title,
              groupType: group.type,
            });
            continue;
          }

          // 👉 If already present, replace ONLY if current is PERSONAL and existing is not
          if (group.type === "PERSONAL" && existing.groupType !== "PERSONAL") {
            friendsMap.set(key, {
              ...existing,
              groupId: group.id,
              groupTitle: group.title,
              groupType: group.type,
            });
          }
        }
      }

      return Array.from(friendsMap.values());
    }),
    getFriendById: requireAuth(async (_, { friendId }, { prisma, user }) => {
      // Find a PERSONAL group that contains BOTH the current user and the friend
      const group = await prisma.group.findFirst({
        where: {
          type: "PERSONAL",
          AND: [
            { members: { some: { userId: user.id } } },
            { members: { some: { userId: friendId } } },
          ],
        },
        include: {
          members: {
            include: { user: true },
          },
        },
      });

      // Not found or not both members
      if (!group) return null;

      // Defensive check: PERSONAL groups should have exactly 2 members
      const members = group.members || [];
      if (members.length !== 2) {
        // If you want, you can throw here to surface a data integrity issue.
        return null;
      }

      // Find the friend's member record for name and id
      const friendMember = members.find(
        (m) => m.user && m.user.id === friendId,
      );
      if (!friendMember || !friendMember.user) return null;

      return {
        groupId: group.id,
        name: friendMember.user.name,
      };
    }),
  },
};
