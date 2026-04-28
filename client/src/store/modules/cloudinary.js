import {
  CLOUDINARY_BASE_URL,
  uploadAvatar,
} from "@/services/cloudinary.service";

const state = () => ({
  cloudinaryBaseUrl: CLOUDINARY_BASE_URL,
});

const mutations = {};

const actions = {
  async uploadAvatar(_, file) {
    try {
      return await uploadAvatar(file);
    } catch (error) {
      console.error("Error uploading avatar:", error);
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
