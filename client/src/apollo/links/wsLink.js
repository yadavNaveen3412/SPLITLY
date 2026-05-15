import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

export const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://localhost:${process.env.VUE_APP_BACKEND_PORT}/graphql`,
    connectionParams: async () => ({}),
  }),
);
