import gql from "graphql-tag";
import apolloClient from "@/apollo";

const GET_USER = gql`
  query GetUser {
    getUser {
      id
      name
      contact
      email
      profilePic
      profilePicVersion
      createdAt
      updatedAt
      shareCode
    }
  }
`;
const CHECK_USER_EXISTS = gql`
  query Query($email: String!) {
    checkUserExists(email: $email)
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      name
      id
      email
      contact
      profilePic
      profilePicVersion
    }
  }
`;

const FIND_USER = gql`
  query FindUser($input: FindUserInput!) {
    findUser(input: $input) {
      id
      name
      email
      contact
      shareCode
      profilePic
      profilePicVersion
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_DETAILS = gql`
  mutation UpdateUserDetails($input: UserInput!) {
    updateUserDetails(input: $input) {
      id
      name
      contact
      email
      profilePic
      profilePicVersion
      createdAt
      updatedAt
      shareCode
    }
  }
`;

export const userService = {
  async getUser() {
    const { data } = await apolloClient.query({
      query: GET_USER,
      fetchPolicy: "no-cache",
    });
    return data.getUser;
  },

  async checkUserExists(email) {
    const { data } = await apolloClient.query({
      query: CHECK_USER_EXISTS,
      variables: { email },
      fetchPolicy: "network-only",
    });
    return data.checkUserExists;
  },
};

export const getUserById = async (userId) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_USER_BY_ID,
      variables: { userId },
      fetchPolicy: "network-only",
    });
    return data.getUserById;
  } catch (error) {
    console.log("Error getting User", error);
  }
};

export const updateUserDetails = async (input) => {
  try {
    // console.log("Service Input:", input);

    const { data } = await apolloClient.mutate({
      mutation: UPDATE_USER_DETAILS,
      variables: { input },
      fetchPolicy: "no-cache",
    });

    console.log("Updated User:", data.updateUserDetails);

    return data.updateUserDetails;
  } catch (error) {
    console.log("Error updating user:", error);
    throw error;
  }
};

export const findUser = async (input) => {
  try {
    const { data } = await apolloClient.query({
      query: FIND_USER,
      variables: { input },
      fetchPolicy: "no-cache",
    });

    // console.log("data:", data.findUser);
    return data.findUser;
  } catch (error) {
    console.error("Error fetching user:\n", error);
    throw error;
  }
};
