import cloudinary from "../../src/config/cloudinary.js";
import {
  requireAuth,
  requireGroupMember,
} from "../../src/middleware/guards.js";

export const cloudinaryResolvers = {
  Mutation: {
    requestUploadSignature: requireAuth(
      async (_, { dirName, groupId, fileName }, context) => {
        if (dirName === "groups") {
          if (!groupId)
            throw new Error("groupId is required for group uploads");
          return requireGroupMember(async () => {
            return generateCloudinarySignature(dirName, groupId, fileName);
          })(_, { dirName, groupId, fileName }, context);
        }

        if (dirName === "users") {
          if (groupId)
            throw new Error("groupId should not be provided for user uploads");
          return generateCloudinarySignature(
            dirName,
            context.user.id,
            fileName,
          );
        }

        throw new Error("Invalid dirName. Must be 'users' or 'groups'.");
      },
    ),
  },
};

async function generateCloudinarySignature(dirName, entityId, fileName) {
  const timestamp = Math.floor(Date.now() / 1000);
  const public_id = `${dirName}/${entityId}/${fileName}`;
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      public_id,
      overwrite: true,
      invalidate: true,
    },
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    signature,
    timestamp,
    public_id,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  };
}
