import { HttpLink } from "@apollo/client/core";

export const httpLink = new HttpLink({
  uri: `http://localhost:${process.env.VUE_APP_BACKEND_PORT}/graphql`,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});
