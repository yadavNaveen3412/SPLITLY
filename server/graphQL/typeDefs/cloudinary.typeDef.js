export const cloudinaryTypeDefs = `#graphql
    type CloudinarySignature {
        signature: String!
        timestamp: Int!
        public_id: String!
        cloud_name: String!
        api_key: String!
    }

    type Mutation {
        requestUploadSignature(dirName: String!, groupId: ID, fileName: String!): CloudinarySignature!
    }
`;
