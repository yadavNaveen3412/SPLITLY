import { groupService, getOrCreateNonGroup } from "@/services/groups.service";

const state = () => ({
  groups: [],
  loading: false,
});
const mutations = {
  SET_GROUPS(state, g) {
    state.groups = g;
  },
  SET_LOADING(state, val) {
    state.loading = val;
  },
};
const actions = {
  async fetchGroups({ commit }, type) {
    commit("SET_LOADING", true);
    try {
      const groups = await groupService.getGroups(type);
      commit("SET_GROUPS", Array.isArray(groups) ? [...groups] : []);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchGroupsWithBalances({ commit, rootGetters }, type) {
    commit("SET_LOADING", true);
    try {
      const groups = await groupService.getGroups(type);
      const userId = rootGetters["auth/getUserId"];
      const { calculateUserBalanceList } = await import("@/utils/settlements"); // Lazy import to match service if needed

      const groupsWithBalances = await Promise.all(
        groups.map(async (group) => {
          const transactions = await calculateUserBalanceList(userId, group.id);
          let netBalance = 0;
          transactions.forEach((t) => {
            if (t.type === "owed") netBalance += t.amount;
            if (t.type === "owe") netBalance -= t.amount;
          });

          return {
            ...group,
            displayName: group.title,
            netBalance,
          };
        }),
      );

      commit("SET_GROUPS", groupsWithBalances);
    } catch (err) {
      console.error("Failed to fetch groups with balances", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async createGroup({ dispatch }, payload) {
    try {
      const { title, type } = payload;
      const created = await groupService.createGroup(title, type);
      console.log("Created Group: ", created);
      await dispatch("fetchGroups", type);
      return created;
    } catch (e) {
      console.log("failed to create group", e);
    }
  },

  async getNonGroupId(_, friendIdsArray) {
    try {
      const { id } = await getOrCreateNonGroup(friendIdsArray);
      console.log(id);
      return id;
    } catch (error) {
      console.log("Error creating non group", error);
    }
  },
};
const getters = {
  isLoading: (state) => state.loading,
  getGroups: (state) => state.groups,

  getGroupsWithMemberCount: (state) => {
    const Groups = state.groups.map((group) => ({
      id: group.id,
      name: group.title,
      members: group.members?.length || 0,
    }));

    return Groups;
  },

  getGroupById: (state, rootGetters) => (id) => {
    const group = state.groups.find((group) => group.id === id);
    const selectedGroup = {
      id: group.id,
      name: group.title,
      members: group.members.map((m) => ({
        id: m.user.id,
        name: m.user.id === rootGetters["auth/getUserId"] ? "You" : m.user.name,
      })),
    };
    return selectedGroup;
  },
};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
