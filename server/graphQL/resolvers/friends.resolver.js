import { requireAuth } from "../../src/middleware/guards.js";
import { groupService } from "../../src/services/group.service.js";

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
  },
  Mutation: {
    createFriend: requireAuth(async (_, { friendId }, { prisma, user }) => {
      const gService = groupService(prisma);
      const personalGroup = await gService.createFriend(friendId, user);

      // Convert Group object to Friend object
      // The friend should be the other user in this personal group
      const friend = personalGroup.members.find(
        (m) => m.userId !== user.id,
      )?.user;

      if (!friend) {
        throw new Error("Friend not found after creating personal group");
      }

      return {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        contact: friend.contact,
        profilePic: friend.profilePic,
        profilePicVersion: friend.profilePicVersion,
        groupId: personalGroup.id,
        groupTitle: personalGroup.title,
        groupType: personalGroup.type,
      };
    }),
  },
};
