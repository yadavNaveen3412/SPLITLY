import { pubsub } from "../../src/pubsub.js";
import { requireGroupMember } from "../../src/middleware/guards.js";
import {
  sanitizeString,
  validateChatMessage,
  validateUUID,
} from "../../src/utils/validation.js";

export const chatResolvers = {
  Query: {
    getChats: requireGroupMember(async (_, { group_id }, { prisma, user }) => {
      group_id = validateUUID(group_id);
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
        chatMessage = validateChatMessage(chatMessage);
        group_id = validateUUID(group_id);
        clientId = sanitizeString(clientId);

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
        group_id = validateUUID(group_id);
        return pubsub.asyncIterableIterator([`MESSAGE_SENT_${group_id}`]);
      }),
    },
  },
};
