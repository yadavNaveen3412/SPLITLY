import gql from "graphql-tag";
import apolloClient from "@/apollo/client";

const REQUEST_UPLOAD_SIGNATURE = gql`
  mutation Mutation($dirName: String!, $groupId: ID, $fileName: String!) {
    requestUploadSignature(
      dirName: $dirName
      groupId: $groupId
      fileName: $fileName
    ) {
      signature
      timestamp
      public_id
      cloud_name
      api_key
    }
  }
`;

const getCloudinarySignature = async (payload) => {
  const { data } = await apolloClient.mutate({
    mutation: REQUEST_UPLOAD_SIGNATURE,
    variables: payload,
  });

  return data.requestUploadSignature;
};

export const uploadImage = async (file, dirName, fileName, groupId = null) => {
  const { signature, timestamp, public_id, cloud_name, api_key } =
    await getCloudinarySignature({ dirName, fileName, groupId });

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("public_id", public_id);
  formData.append("overwrite", "true");
  formData.append("invalidate", "true");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await res.json();

  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    version: data.version,
  };
};

export const CLOUDINARY_CLOUD_NAME = process.env.VUE_APP_CLOUDINARY_CLOUD_NAME;

export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
