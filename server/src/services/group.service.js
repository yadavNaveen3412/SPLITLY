import { sanitizeString } from "../middleware/sanitizeUserInput.js";

export const groupService = (prisma) => {
  const createGroup = async (title, type, memberIds = [], user) => {
    const groupType = type || "GROUP";
    const sanitizedTitle = sanitizeString(title);

    if (!sanitizedTitle || sanitizedTitle.length < 3 || sanitizedTitle.length > 50) {
      throw new Error("Group title must be between 3 and 50 characters.");
    }

    // Ensure current user is included in members
    const allMemberIds = [...new Set([user.id, ...memberIds])];

    return prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          title: sanitizedTitle,
          type: groupType,
          createdById: user.id,
          members: {
            create: allMemberIds.map((userId) => ({ userId })),
          },
        },
        include: {
          members: { include: { user: true } },
        },
      });
      return group;
    });
  };

  const addMembersToGroup = async (groupId, userIds, prismaContext = prisma) => {
    const added = [];
    const alreadyMembers = [];
    const invited = []; // Placeholder for future invite logic

    // We use the provided prismaContext (which might be a transaction) or default to the main prisma instance
    return prismaContext.$transaction(async (tx) => {
      for (const id of userIds) {
        const user = await tx.user.findUnique({ where: { id } });
        if (!user) {
          invited.push(id);
          continue;
        }

        const existing = await tx.groupMember.findFirst({
          where: { groupId, userId: id },
        });

        if (existing) {
          alreadyMembers.push(id);
          continue;
        }

        await tx.groupMember.create({
          data: { groupId, userId: id },
        });
        added.push(id);
      }

      const updatedGroup = await tx.group.findUnique({
        where: { id: groupId },
        include: { members: { include: { user: true } } },
      });

      return { added, alreadyMembers, invited, updatedGroup };
    });
  };

  const createFriend = async (friendId, user) => {
    return prisma.$transaction(async (tx) => {
      // 1. Get friend details for the title
      const friend = await tx.user.findUnique({ where: { id: friendId } });
      if (!friend) throw new Error("User not found");

      // 2. Generate title: UserFirst_FriendFirst
      const userName = user.name.split(" ")[0];
      const friendName = friend.name.split(" ")[0];
      const title = `${userName}_${friendName}`;

      // 3. Create PERSONAL group
      return createGroup(title, "PERSONAL", [friendId], user);
    });
  };

  return {
    createGroup,
    addMembersToGroup,
    createFriend,
  };
};
