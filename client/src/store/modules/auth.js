import apolloClient from "@/apollo";
import { authService } from "@/services/auth.service";
import { updateUserDetails, userService } from "@/services/user.service";

const state = () => ({
  user: null,
  checked: false,
  error: null,
  loading: false,
});

const mutations = {
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_USER(state, user) {
    state.user = user;
  },
  SET_CHECKED(state, status) {
    state.checked = status;
  },
  RESET_AUTH(state) {
    state.user = null;
    state.error = null;
    state.checked = true;
  },
  SET_LOADING(state, val) {
    state.loading = val;
  },
};

const actions = {
  async login({ commit }, { idToken }) {
    commit("SET_ERROR", null);
    commit("SET_LOADING", true);
    try {
      console.log(`idToken: ${idToken}`);
      const user = await authService.loginWithGoogle(idToken);
      commit("SET_CHECKED", true);
      commit("SET_USER", user);
      return true;
    } catch (err) {
      commit("SET_ERROR", err);
      throw err;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async loginWithEmail({ commit }, { email, password }) {
    commit("SET_ERROR", null);
    commit("SET_LOADING", true);
    try {
      const user = await authService.loginWithEmail({ email, password });
      commit("SET_CHECKED", true);
      commit("SET_USER", user);
      return true;
    } catch (err) {
      commit("SET_ERROR", err);
      throw err;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async register({ commit }, { name, email, password }) {
    commit("SET_ERROR", null);
    commit("SET_LOADING", true);
    try {
      const user = await authService.register({ name, email, password });
      commit("SET_CHECKED", false);
      commit("SET_USER", user);
      return true;
    } catch (err) {
      commit("SET_ERROR", err);
      throw err;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async logout({ commit }) {
    commit("SET_ERROR", null);
    try {
      try {
        await authService.logout();
      } catch (e) {
        console.warn("Backend logout failed:", e);
      }
      commit("RESET_AUTH");
      apolloClient.clearStore();
    } catch (err) {
      commit("SET_ERROR", err);
      throw err;
    }
  },

  async fetchUser({ commit, state }) {
    if (state.checked) return;
    try {
      const getUser = await userService.getUser();
      if (getUser) {
        commit("SET_USER", getUser);
      }
    } catch (err) {
      commit("SET_USER", null);
      commit("SET_ERROR", err);
      console.error("Failed to fetch user data:", err);
    } finally {
      commit("SET_CHECKED", true);
    }
  },

  async updateUserProfile({ commit }, input) {
    try {
      const updatedUser = await updateUserDetails(input);
      commit("SET_USER", updatedUser);
      return updatedUser;
    } catch (error) {
      console.log("Updating user unsuccessful:", error);
      throw error;
    }
  },
};

const getters = {
  isLoggedIn: (state) => !!state.user,
  getUserId: (state) => state.user?.id,
  getUser: (state) => state.user,
  getUserName: (state) => state.user?.name,
  getError: (state) => state.error,
  isLoading: (state) => state.loading,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
