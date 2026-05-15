import gql from "graphql-tag";
import apolloClient from "@/apollo/client";

const EXPENSE_FRAGMENT = gql`
  fragment ExpenseFields on Expense {
    id
    title
    description
    totalAmount
    amount
    type
    cycleId
    createdAt
    updatedAt
    categoryId
    category {
      id
      name
      icon
    }
    participants {
      id
      userId
      paidAmount
      owedAmount
      user {
        id
        name
      }
    }
    createdByUser {
      id
      name
    }
    group {
      id
      title
      type
    }
  }
`;

const GET_GROUP_EXPENSES = gql`
  query GetGroupExpenses($groupId: ID!) {
    getGroupExpenses(groupId: $groupId) {
      ...ExpenseFields
    }
  }
  ${EXPENSE_FRAGMENT}
`;

const GET_FRIEND_EXPENSES = gql`
  query GetFriendExpenses($friendId: ID!) {
    getFriendExpenses(friendId: $friendId) {
      directExpenses {
        ...ExpenseFields
      }
      groupSummaries {
        groupId
        groupName
        amount
        type
      }
    }
  }
  ${EXPENSE_FRAGMENT}
`;

const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      ...ExpenseFields
    }
  }
  ${EXPENSE_FRAGMENT}
`;

const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: String!, $input: UpdateExpenseInput!) {
    updateExpense(id: $id, input: $input) {
      ...ExpenseFields
    }
  }
  ${EXPENSE_FRAGMENT}
`;

const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: String!) {
    deleteExpense(id: $id)
  }
`;

const SETTLE_GROUP = gql`
  mutation SettleGroup($groupId: String!) {
    settleGroup(groupId: $groupId) {
      balanceArray {
        userId
        amount
      }
      message
    }
  }
`;

export const expenseService = {
  async getGroupExpenses(groupId) {
    const { data } = await apolloClient.query({
      query: GET_GROUP_EXPENSES,
      variables: { groupId },
      fetchPolicy: "network-only",
    });

    return data.getGroupExpenses;
  },

  async getFriendExpenses(friendId) {
    const { data } = await apolloClient.query({
      query: GET_FRIEND_EXPENSES,
      variables: { friendId },
      fetchPolicy: "network-only",
    });

    return data.getFriendExpenses;
  },

  async createExpense(input) {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_EXPENSE,
      variables: { input },
    });

    return data.createExpense;
  },

  async updateExpense(id, input) {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_EXPENSE,
      variables: { id, input },
    });

    return data.updateExpense;
  },

  async deleteExpense(id) {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_EXPENSE,
      variables: { id },
    });

    return data.deleteExpense;
  },

  async settleGroup(groupId) {
    const { data } = await apolloClient.mutate({
      mutation: SETTLE_GROUP,
      variables: { groupId },
    });

    return data.settleGroup;
  },
};
