import gql from "graphql-tag";
import apolloClient from "@/apollo/client";

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
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
  }
`;

const LOGIN_WITH_EMAIL = gql`
  mutation LoginWithEmail($input: LoginInput!) {
    loginWithEmail(input: $input) {
      user {
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
  }
`;

const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      user {
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
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const authService = {
  async register(input) {
    const { data } = await apolloClient.mutate({
      mutation: REGISTER,
      variables: { input },
      fetchPolicy: "no-cache",
    });

    return data.register.user;
  },

  async loginWithEmail(input) {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_WITH_EMAIL,
      variables: { input },
      fetchPolicy: "no-cache",
    });

    return data.loginWithEmail.user;
  },

  async loginWithGoogle(idToken) {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_WITH_GOOGLE,
      variables: { idToken },
      fetchPolicy: "no-cache",
    });

    return data.loginWithGoogle.user;
  },

  async logout() {
    const { data } = await apolloClient.mutate({
      mutation: LOGOUT_MUTATION,
      fetchPolicy: "no-cache",
    });

    return data.logout;
  },
};
