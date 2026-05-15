import gql from "graphql-tag";
import apolloClient from "@/apollo/client";

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
};

export const getUserById = async (userId) => {
  const { data } = await apolloClient.query({
    query: GET_USER_BY_ID,
    variables: { userId },
    fetchPolicy: "network-only",
  });

  return data.getUserById;
};

export const updateUserDetails = async (input) => {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_USER_DETAILS,
    variables: { input },
    fetchPolicy: "no-cache",
  });

  return data.updateUserDetails;
};

export const findUser = async (input) => {
  const { data } = await apolloClient.query({
    query: FIND_USER,
    variables: { input },
    fetchPolicy: "no-cache",
  });

  return data.findUser;
};
