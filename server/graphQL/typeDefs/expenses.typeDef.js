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

        # Context-aware fields
        amount: Float
        type: String
    }

    type GroupSummary {
        groupId: ID!
        groupName: String!
        amount: Float!
        type: String!
    }

    type FriendExpensesPayload {
        directExpenses: [Expense!]!
        groupSummaries: [GroupSummary!]!
    }

    input ParticipantInput {
        userId: String!
        paidAmount: Float!
        splitValue: Float
    }

    input CreateExpenseInput {
        title: String!
        description: String
        groupId: String
        totalAmount: Float!
        categoryId: String!
        splitMethod: String!
        participants: [ParticipantInput!]!
    }

    input UpdateExpenseInput {
        title: String
        description: String
        totalAmount: Float
        categoryId: String
        splitMethod: String
        participants: [ParticipantInput!]
        is_settled: Boolean
    }

    type Query {
        getGroupExpenses(groupId: ID!): [Expense!]!
        getFriendExpenses(friendId: ID!): FriendExpensesPayload!
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

`;
