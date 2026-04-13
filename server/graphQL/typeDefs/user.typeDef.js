export const userTypeDefs = `#graphql
    type User {
        id: ID!
        name: String!
        email: String!
        contact: String
        createdAt: String!
        updatedAt: String!
        profilePic: String
        profilePicVersion: String
        shareCode: String!
        googleSub: String
        hasPassword: Boolean!
    }

    type Query {
        getUser: User
        checkUserExists(email: String!): Boolean!
        getUserById(userId: ID!): User
        findUser(input: FindUserInput!): User
    }

    type AuthPayload {
        user: User!
    }

    type Mutation {
        register(input: RegisterInput!): AuthPayload!
        loginWithEmail(input: LoginInput!): AuthPayload!
        loginWithGoogle(idToken: String!): AuthPayload!
        logout: Boolean!
        updateUserDetails(input: UserInput!): User!
    }

    input RegisterInput {
        name: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input UserInput {
        name: String
        contact: String
        profilePic: String
        profilePicVersion: String
    }

    input FindUserInput {
        email: String
        contact: String
        shareCode: String
    }
`;
