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
      async (_, { group_id, chatMessage, clientId }, { prisma, user }) => {
        chatMessage = sanitizeString(chatMessage);

        if (!chatMessage || chatMessage.length === 0) {
          throw new Error("Message cannot be empty.");
        }

        if (chatMessage.length > 1000) {
          throw new Error("Message must not exceed 1000 characters.");
        }
        const chat = await prisma.chats.create({
          data: {
            groupId: group_id,
            chatMessage,
            senderId: user.id,
          },
        });

        const payload = { ...chat, clientId };

        await pubsub.publish(`MESSAGE_SENT_${group_id}`, {
          messageAdded: payload,
        });

        return payload;
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
