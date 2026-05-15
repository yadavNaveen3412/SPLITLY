import { split } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { wsLink } from "./wsLink";
import { httpLink } from "./httpLink";

export const splitLink = split(
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
