import { AppError } from "../utils/AppError.js";
import {
  validateGroupTitle,
  validateGroupType,
  validateProfilePic,
  validateProfilePicVersion,
} from "../utils/validation.js";

export const groupService = (prisma) => {
  const createGroup = async (input, user) => {
    const groupType = validateGroupType(input.type);
    const title = validateGroupTitle(input.title);

    // Ensure current user is included in members
    const allMemberIds = [...new Set([user.id, ...input.members])];

    const data = {
      title,
      type: groupType,
      createdById: user.id,
      members: {
        create: allMemberIds.map((userId) => ({ userId })),
      },
    };

    if (input.profilePic) {
      data.profilePic = validateProfilePic(input.profilePic);
      data.profilePicVersion = validateProfilePicVersion(
        input.profilePicVersion,
      );
    }

    return prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data,
        include: {
          members: { include: { user: true } },
        },
      });
      return group;
    });
  };

  const addMembersToGroup = async (
    groupId,
    userIds,
    prismaContext = prisma,
  ) => {
    const added = [];
    const alreadyMembers = [];
    const invited = []; // Placeholder for future invite logic
    // We use the provided prismaContext (which might be a transaction) or default to the main prisma instance
    return prismaContext.$transaction(async (tx) => {
      for (let id of userIds) {
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
      if (!friend) throw new AppError(404, "NOT_FOUND", "User not found");

      const existingFriend = await checkExistingFriend(tx, user, friendId);
      if (existingFriend)
        throw new AppError(409, "CONFLICT", "Friend already exists");

      // 2. Generate title: UserFirst_FriendFirst
      const userName = user.name.split(" ")[0];
      const friendName = friend.name.split(" ")[0];
      const title = `${userName}_${friendName}`;

      // console.log(`Title: ${title}`);

      // 3. Create PERSONAL group
      return createGroup(
        { title, type: "PERSONAL", members: [friendId] },
        user,
      );
    });
  };

  return {
    createGroup,
    addMembersToGroup,
    createFriend,
  };
};

const checkExistingFriend = async (prisma, user, friendId) => {
  return await prisma.group.findFirst({
    where: {
      type: "PERSONAL",

      members: {
        every: {
          userId: {
            in: [user.id, friendId],
          },
        },
      },

      AND: [
        {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
        {
          members: {
            some: {
              userId: friendId,
            },
          },
        },
      ],
    },

    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
};
