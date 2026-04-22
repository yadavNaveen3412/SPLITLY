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
