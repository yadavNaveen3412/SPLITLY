export function normalizeApolloError(error) {
  // Network errors
  if (error?.networkError) {
    return {
      type: "NETWORK",
      code: "NETWORK_ERROR",
      message: "Check your internet connection",
      statusCode: 0,
      originalError: error,
    };
  }

  // GraphQL errors
  const gqlError = error?.graphQLErrors?.[0] || error;

  return {
    type: "GRAPHQL",
    code: gqlError?.extensions?.code || "INTERNAL_SERVER_ERROR",

    message: gqlError?.message || "Something went wrong",

    statusCode: gqlError?.extensions?.statusCode || 500,

    originalError: error,
  };
}
