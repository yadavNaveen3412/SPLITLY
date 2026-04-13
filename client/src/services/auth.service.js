import gql from "graphql-tag";
import apolloClient from "@/apollo";

const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
      }
    }
  }
`;

const LOGIN_WITH_EMAIL = gql`
  mutation LoginWithEmail($input: LoginInput!) {
    loginWithEmail(input: $input) {
      user {
        id
      }
    }
  }
`;

const LOGIN_WITH_GOOGLE = gql`
  mutation LoginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      user {
        id
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
    const resp = await apolloClient.mutate({
      mutation: REGISTER,
      variables: { input },
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },

  async loginWithEmail(input) {
    const resp = await apolloClient.mutate({
      mutation: LOGIN_WITH_EMAIL,
      variables: { input },
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },

  async loginWithGoogle(idToken) {
    const resp = await apolloClient.mutate({
      mutation: LOGIN_WITH_GOOGLE,
      variables: { idToken },
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },

  async logout() {
    const resp = await apolloClient.mutate({
      mutation: LOGOUT_MUTATION,
      fetchPolicy: "no-cache",
    });
    return resp.data;
  },
};
