import gql from "graphql-tag";
import apolloClient from "@/apollo/client";

const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      icon
      id
      name
    }
  }
`;

export const categoryService = {
  getCategories: async () => {
    const { data } = await apolloClient.query({
      query: GET_ALL_CATEGORIES,
      fetchPolicy: "cache-first",
    });
    return data.getAllCategories;
  },
};
