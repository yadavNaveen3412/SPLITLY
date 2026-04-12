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
  uri:
    window.location.hostname === "localhost"
      ? `http://localhost:${process.env.BACKEND_PORT}/graphql`
      : `https://j7zkqf80-${process.env.BACKEND_PORT}.inc1.devtunnels.ms/graphql`,
  credentials: "include",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url:
      window.location.hostname === "localhost"
        ? `ws://localhost:${process.env.BACKEND_PORT}/graphql`
        : `wss://j7zkqf80-${process.env.BACKEND_PORT}.inc1.devtunnels.ms/graphql`,

    connectionParams: async () => ({}),
  })
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
  httpLink
);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
