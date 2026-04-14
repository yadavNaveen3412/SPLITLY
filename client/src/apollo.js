import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from "@apollo/client/core";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: `http://localhost:${process.env.VUE_APP_BACKEND_PORT}/graphql`,
  credentials: "include",
});
const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://localhost:${process.env.VUE_APP_BACKEND_PORT}/graphql`,
    connectionParams: async () => ({}),
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink,
);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
