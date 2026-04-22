export const chatTypeDefs = `#graphql
    type Query {
        getChats(group_id: ID!): [Chats!]!
    }

    type Mutation {
        sendChat(group_id: ID!, chatMessage: String!, clientId: String!): Chats!
    }

    type Chats {
        id: ID!
        groupId: ID!
        senderId: ID!
        createdAt: String!
        updatedAt: String!
        chatMessage: String!
        clientId: String
    }

    type Subscription {
        messageAdded(group_id: ID!): Chats!
    }
`;
