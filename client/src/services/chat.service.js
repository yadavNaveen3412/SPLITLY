import gql from "graphql-tag";
import apolloClient from "@/apollo";

const GET_CHATS = gql`
  query GetChats($group_id: ID!) {
    getChats(group_id: $group_id) {
      id
      chatMessage
      groupId
      senderId
      createdAt
      updatedAt
    }
  }
`;

const SEND_CHAT = gql`
  mutation SendChat($group_id: ID!, $chatMessage: String!, $clientId: String!) {
    sendChat(
      group_id: $group_id
      chatMessage: $chatMessage
      clientId: $clientId
    ) {
      id
      chatMessage
      groupId
      senderId
      createdAt
      updatedAt
      clientId
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription MessageAdded($groupId: ID!) {
    messageAdded(group_id: $groupId) {
      id
      chatMessage
      groupId
      senderId
      createdAt
      updatedAt
      clientId
    }
  }
`;

export const getChats = async (group_id) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_CHATS,
      variables: { group_id },
      fetchPolicy: "cache-first",
    });

    return data.getChats;
  } catch (error) {
    console.error("Error occured:: ", error);
    throw error;
  }
};

export const sendChat = async (payload) => {
  try {
    const { group_id, chatMessage, clientId } = payload;
    const { data } = await apolloClient.mutate({
      mutation: SEND_CHAT,
      variables: { group_id, chatMessage, clientId },
    });
    return data.sendChat;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};

export const subscribeToMessage = (groupId, callback) => {
  const observable = apolloClient.subscribe({
    query: MESSAGE_SUBSCRIPTION,
    variables: { groupId },
  });

  const subscription = observable.subscribe({
    next: ({ data }) => {
      if (data?.messageAdded) {
        callback(data.messageAdded);
      }
    },
    error: (err) => console.error("Subscription Error:", err),
  });

  return subscription;
};
