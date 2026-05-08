import gql from "graphql-tag";
import apolloClient from "@/apollo";

const GET_ALL_FRIENDS = gql`
  query GetAllFriends {
    getAllFriends {
      id
      name
      email
      contact
      groupId
      groupTitle
      groupType
      profilePic
      profilePicVersion
    }
  }
`;

const CREATE_FRIEND_MUTATION = gql`
  mutation CreateFriend($friendId: ID!) {
    createFriend(friendId: $friendId) {
      id
      name
      email
      contact
      groupId
      groupTitle
      groupType
      profilePic
      profilePicVersion
    }
  }
`;

export const fetchFriends = async () => {
  const { data } = await apolloClient.query({
    query: GET_ALL_FRIENDS,
    fetchPolicy: "cache-first",
  });
  return data.getAllFriends;
};

export const createFriend = async (friendId) => {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_FRIEND_MUTATION,
    variables: { friendId },
  });
  return data.createFriend;
};
