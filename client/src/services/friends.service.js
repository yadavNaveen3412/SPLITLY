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
      title
      type
    }
  }
`;

export const fetchFriends = async () => {
  try {
    const { data } = await apolloClient.query({
      query: GET_ALL_FRIENDS,
      fetchPolicy: "cache-first",
    });

    return data.getAllFriends;
  } catch (error) {
    console.error("Error fetching friends' data: ", error);
  }
};

export const createFriend = async (friendId) => {
  const resp = await apolloClient.mutate({
    mutation: CREATE_FRIEND_MUTATION,
    variables: { friendId },
  });
  return resp.data.createFriend;
};
