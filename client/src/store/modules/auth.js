import apolloClient from "@/apollo/client";
import { authService } from "@/services/auth.service";
import {
  updateUserDetails,
  userService,
  findUser,
  getUserById,
} from "@/services/user.service";
import { handleApolloError } from "@/utils/errorHandler";

const state = () => ({
  user: null,
  checked: false,
  loading: false,
});

const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_CHECKED(state, status) {
    state.checked = status;
  },
  RESET_AUTH(state) {
    state.user = null;
    state.checked = true;
  },
  SET_LOADING(state, val) {
    state.loading = val;
  },
};

const actions = {
  async login({ commit }, { idToken }) {
    commit("SET_LOADING", true);

    try {
      const user = await authService.loginWithGoogle(idToken);

      commit("SET_CHECKED", true);
      commit("SET_USER", user);

      return true;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async loginWithEmail({ commit }, { email, password }) {
    commit("SET_LOADING", true);

    try {
      const user = await authService.loginWithEmail({ email, password });

      commit("SET_CHECKED", true);
      commit("SET_USER", user);

      return true;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async register({ commit }, { name, email, password }) {
    commit("SET_LOADING", true);

    try {
      const user = await authService.register({ name, email, password });

      commit("SET_CHECKED", false);
      commit("SET_USER", user);

      return true;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async logout({ commit }) {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Backend logout failed:", e);
    }

    commit("RESET_AUTH");

    await apolloClient.clearStore();
  },

  async fetchUser({ commit, state }) {
    if (state.checked) return;

    try {
      const getUser = await userService.getUser();

      if (getUser) commit("SET_USER", getUser);
    } catch (error) {
      handleApolloError(error);

      commit("SET_USER", null);
    } finally {
      commit("SET_CHECKED", true);
    }
  },

  async updateUserProfile({ commit }, input) {
    const updatedUser = await updateUserDetails(input);

    commit("SET_USER", updatedUser);

    return updatedUser;
  },

  async findUser(_, input) {
    return await findUser(input);
  },

  async getUserById(_, id) {
    return await getUserById(id);
  },
};

const getters = {
  isLoggedIn: (state) => !!state.user,
  getUserId: (state) => state.user?.id,
  getUser: (state) => state.user,
  getUserName: (state) => state.user?.name,
  isLoading: (state) => state.loading,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
