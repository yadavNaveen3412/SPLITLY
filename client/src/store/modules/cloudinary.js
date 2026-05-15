import {
  CLOUDINARY_BASE_URL,
  uploadImage,
} from "@/services/cloudinary.service";

const state = () => ({
  cloudinaryBaseUrl: CLOUDINARY_BASE_URL,
});

const mutations = {};

const actions = {
  uploadUserAvatar(_, file) {
    return uploadImage(file, "users", "avatar");
  },

  uploadGroupImage(_, { file, groupId }) {
    return uploadImage(file, "groups", "image", groupId);
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
