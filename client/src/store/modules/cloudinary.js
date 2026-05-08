import {
  CLOUDINARY_BASE_URL,
  uploadImage,
} from "@/services/cloudinary.service";

const state = () => ({
  cloudinaryBaseUrl: CLOUDINARY_BASE_URL,
});

const mutations = {};

const actions = {
  async uploadUserAvatar(_, file) {
    try {
      return await uploadImage(file, "users", "avatar");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  async uploadGroupImage(_, { file, groupId }) {
    console.log(`cloud store payload: `, { file, groupId });
    try {
      return await uploadImage(file, "groups", "image", groupId);
    } catch (error) {
      console.error("Error uploading group image:", error);
      throw error;
    }
  },
};

const getters = {
  getCloudinaryBaseUrl: (state) => state.cloudinaryBaseUrl,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
