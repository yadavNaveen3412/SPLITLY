import apolloClient from "@/apollo/client";
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
  query MyGroupBalances($groupId: ID!) {
    myGroupBalances(groupId: $groupId) {
      type
      person
      amount
    }
  }
`;

const MY_ALL_BALANCES = gql`
  query MyAllBalances {
    myAllBalances {
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
  query MyFriendBalance($friendId: ID!) {
    myFriendBalance(friendId: $friendId) {
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
  query MyNetWithFriend($friendId: ID!) {
    myNetWithFriend(friendId: $friendId)
  }
`;

/* ----------------------------------
   API wrappers (UNCHANGED signatures)
---------------------------------- */

export const computeSettlements = async (groupId) => {
  const { data } = await apolloClient.query({
    query: GROUP_SETTLEMENTS,
    variables: { groupId },
    fetchPolicy: "network-only",
  });

  return data.groupSettlements;
};

export const calculateUserBalanceList = async (groupId) => {
  const { data } = await apolloClient.query({
    query: MY_GROUP_BALANCES,
    variables: { groupId },
    fetchPolicy: "network-only",
  });

  return data.myGroupBalances;
};

export const userAllBalances = async () => {
  const { data } = await apolloClient.query({
    query: MY_ALL_BALANCES,
    fetchPolicy: "network-only",
  });

  return data.myAllBalances;
};

export const userFriendBalance = async (friendId) => {
  const { data } = await apolloClient.query({
    query: MY_FRIEND_BALANCE,
    variables: { friendId },
    fetchPolicy: "network-only",
  });

  return data.myFriendBalance;
};

export const calculateNetWithFriend = async (friendId) => {
  const { data } = await apolloClient.query({
    query: MY_NET_WITH_FRIEND,
    variables: { friendId },
    fetchPolicy: "network-only",
  });

  return data.myNetWithFriend;
};
