import apolloClient from "@/apollo";
import gql from "graphql-tag";

/* ----------------------------------
   GraphQL Queries
---------------------------------- */

const GROUP_SETTLEMENTS = gql`
  query GroupSettlements($groupId: ID!) {
    groupSettlements(groupId: $groupId) {
      from
      to
      amount
    }
  }
`;

const MY_GROUP_BALANCES = gql`
  query MyGroupBalances($userId: ID!, $groupId: ID!) {
    myGroupBalances(userId: $userId, groupId: $groupId) {
      type
      person
      amount
    }
  }
`;

const MY_ALL_BALANCES = gql`
  query MyAllBalances($userId: ID!) {
    myAllBalances(userId: $userId) {
      type
      person
      amount
      groupId
      groupType
      groupTitle
    }
  }
`;

const MY_FRIEND_BALANCE = gql`
  query MyFriendBalance($userId: ID!, $friendId: ID!) {
    myFriendBalance(userId: $userId, friendId: $friendId) {
      type
      person
      amount
      groupId
      groupType
      groupTitle
    }
  }
`;

const MY_NET_WITH_FRIEND = gql`
  query MyNetWithFriend($userId: ID!, $friendId: ID!) {
    myNetWithFriend(userId: $userId, friendId: $friendId)
  }
`;

/* ----------------------------------
   API wrappers (UNCHANGED signatures)
---------------------------------- */

export const computeSettlements = async (groupId) => {
  const { data } = await apolloClient.query({
    query: GROUP_SETTLEMENTS,
    variables: { groupId },
    fetchPolicy: "cache-first",
  });

  return data.groupSettlements;
};

export const calculateUserBalanceList = async (userId, groupId) => {
  const { data } = await apolloClient.query({
    query: MY_GROUP_BALANCES,
    variables: { userId, groupId },
    fetchPolicy: "cache-first",
  });

  return data.myGroupBalances;
};

export const userAllBalances = async (userId) => {
  const { data } = await apolloClient.query({
    query: MY_ALL_BALANCES,
    variables: { userId },
    fetchPolicy: "cache-first",
  });

  return data.myAllBalances;
};

export const userFriendBalance = async (userId, friendId) => {
  const { data } = await apolloClient.query({
    query: MY_FRIEND_BALANCE,
    variables: { userId, friendId },
    fetchPolicy: "cache-first",
  });

  return data.myFriendBalance;
};

export const calculateNetWithFriend = async (userId, friendId) => {
  const { data } = await apolloClient.query({
    query: MY_NET_WITH_FRIEND,
    variables: { userId, friendId },
    fetchPolicy: "cache-first",
  });

  return data.myNetWithFriend;
};
