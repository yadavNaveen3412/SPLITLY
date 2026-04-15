import cloudinary from "../../src/config/cloudinary.js";
import { requireAuth } from "../../src/middleware/guards.js";

export const cloudinaryResolvers = {
  Mutation: {
    requestAvatarUpload: requireAuth(async (_, __, { user }) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const public_id = `users/${user.id}/avatar`;
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
    }),
  },
};
