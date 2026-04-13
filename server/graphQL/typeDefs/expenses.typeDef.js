export const expensesTypeDefs = `#graphql

scalar DateTime

    type ExpenseParticipant {
        id: String!
        userId: String!
        paidAmount: Float!
        owedAmount: Float!
        groupId: String
        user: User!
    }

    type Expense {
        id: String!
        title: String!
        description: String
        groupId: String
        totalAmount: Float!
        categoryId: String!
        created_by: String!
        updated_by: String
        is_Settled: Boolean
        createdAt: DateTime!
        updatedAt: DateTime!
        cycleId: Int!

        participants: [ExpenseParticipant!]!
        category: Category!
        group: Group
        createdByUser: User!
        updatedByUser: User
    }

    input ParticipantInput {
        userId: String!
        paidAmount: Float!
        owedAmount: Float!
    }

    input CreateExpenseInput {
        title: String!
        description: String
        groupId: String
        totalAmount: Float!
        categoryId: String!
        participants: [ParticipantInput!]!
    }

    input UpdateExpenseInput {
        title: String
        description: String
        totalAmount: Float
        categoryId: String
        participants: [ParticipantInput!]
        is_settled: Boolean
    }

    type Query {
        getExpensesByGroup(groupId: String!): [Expense!]!
        getExpenseById(id: String!): Expense!
        getExpenseByFriendId(friendId: String!): [FriendExpense!]!
    }

    type BalanceEntry {
        userId: String!
        amount: Float!
    }

    type SettleGroupPayload {
        message: String!
        balanceArray: [BalanceEntry]!
    }

    type Mutation {
        createExpense(input: CreateExpenseInput!): Expense!
        updateExpense(id: String!, input: UpdateExpenseInput!): Expense!
        deleteExpense(id: String!): Boolean!
        settleGroup(groupId: String!): SettleGroupPayload!
    }

    type FriendExpense {
        id: ID
        title: String
        amount: Float
        type: String
        date: DateTime
        createdByUser: User
        category: Category
        groupId: ID
        groupType: GroupType
    }
`;
