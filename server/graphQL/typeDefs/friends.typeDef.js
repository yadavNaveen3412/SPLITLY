export const friendsTypeDefs = `#graphql
    type Query {
        getAllFriends: [Friend!]!
    }

    type Mutation {
        createFriend(friendId: ID!): Group!
    }

    type Friend {
        id: ID
        name: String
        email: String
        contact: String
        groupId: String
        groupTitle: String
        groupType: String
        owedToYou: Float
        youOwe: Float
        profilePic: String
        profilePicVersion: String
    }
`;
