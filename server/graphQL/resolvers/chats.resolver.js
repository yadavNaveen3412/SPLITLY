import { pubsub } from "../../src/pubsub.js";
import { requireGroupMember } from "../../src/middleware/guards.js";
import { sanitizeString } from "../../src/middleware/sanitizeUserInput.js";

export const chatResolvers = {
  Query: {
    getChats: requireGroupMember(async (_, { group_id }, { prisma }) => {
      const chats = await prisma.chats.findMany({
        where: {
          groupId: group_id,
        },
        orderBy: { createdAt: "asc" },
      });
      return chats;
    }),
  },

  Mutation: {
    sendChat: requireGroupMember(
      async (_, { group_id, chatMessage }, { prisma, user }) => {
        chatMessage = sanitizeString(chatMessage);
        const chat = await prisma.chats.create({
          data: {
            groupId: group_id,
            chatMessage,
            senderId: user.id,
          },
        });

        await pubsub.publish(`MESSAGE_SENT_${group_id}`, {
          messageAdded: chat,
        });

        return chat;
      },
    ),
  },

  Subscription: {
    messageAdded: {
      subscribe: requireGroupMember((_, { group_id }) => {
        return pubsub.asyncIterableIterator([`MESSAGE_SENT_${group_id}`]);
      }),
    },
  },
};
