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
      const { userAllBalances } = await import("@/utils/settlements");

      // Single call to get all balances for the user
      const allBalances = await userAllBalances(userId);

      // Create a map of groupId -> netAmount for quick lookup
      const groupBalanceMap = {};
      allBalances.forEach((b) => {
        if (!groupBalanceMap[b.groupId]) groupBalanceMap[b.groupId] = 0;
        if (b.type === "owed") groupBalanceMap[b.groupId] += b.amount;
        if (b.type === "owe") groupBalanceMap[b.groupId] -= b.amount;
      });

      const groupsWithBalances = groups.map((group) => {
        return {
          ...group,
          displayName: group.title,
          netBalance: groupBalanceMap[group.id] || 0,
        };
      });

      commit("SET_GROUPS", groupsWithBalances);
    } catch (err) {
      console.error("Failed to fetch groups with balances", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async createGroup({ dispatch }, payload) {
    try {
      const { title, type, members = [] } = payload;
      const { createGroup } = await groupService.createGroup(title, type, members);
      console.log("Created Group: ", createGroup);
      await dispatch("fetchGroupsWithBalances", type);
      return createGroup;
    } catch (e) {
      console.log("failed to create group", e);
    }
  },

  async addMembers({ dispatch }, { groupId, userIds }) {
    try {
      const { addMemberToGroup } = await groupService.addMemberToGroup(groupId, userIds);
      await dispatch("fetchGroupsWithBalances", "GROUP");
      return addMemberToGroup;
    } catch (e) {
      console.log("failed to add members", e);
      throw e;
    }
  },

  async fetchGroupDetails(_, groupId) {
    try {
      const { getGroupDetails } = await groupService.getGroupDetails(groupId);
      return getGroupDetails;
    } catch (e) {
      console.log("failed to fetch group details", e);
      throw e;
    }
  },

  async renameGroup({ dispatch }, { groupId, title }) {
    try {
      const { renameGroup } = await groupService.renameGroup(groupId, title);
      await dispatch("fetchGroups", renameGroup.type);
      return renameGroup;
    } catch (e) {
      console.log("failed to rename group", e);
      throw e;
    }
  },

  async deleteGroup({ dispatch }, { groupId, type }) {
    try {
      const { deleteGroup } = await groupService.deleteGroup(groupId);
      await dispatch("fetchGroups", type);
      return deleteGroup;
    } catch (e) {
      console.log("failed to delete group", e);
      throw e;
    }
  },

  async getPersonalGroupId(_, otherUserId) {
    try {
      return await groupService.getPersonalGroupId(otherUserId);
    } catch (e) {
      console.log("failed to get personal group id", e);
      throw e;
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
