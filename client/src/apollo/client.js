import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { splitLink } from "./links/splitLink";
import { errorLink } from "./links/errorLink";

const apolloClient = new ApolloClient({
  link: errorLink.concat(splitLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
