import { categoryService } from "@/services/categories.service";

const state = () => ({
  categories: [],
  loading: false,
});

const mutations = {
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
};

const actions = {
  async loadCategories({ commit }) {
    commit("SET_LOADING", true);

    try {
      const categories = await categoryService.getCategories();
      commit("SET_CATEGORIES", categories);
    } catch (error) {
      console.error("Error loading categories: ", error);
      commit("SET_CATEGORIES", []);
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const getters = {
  getCategories: (state) => {
    return state.categories;
  },

  getCategoryById: (state) => (id) => {
    return state.categories.find((category) => category.id === id);
  },
  isLoading: (state) => state.loading,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
