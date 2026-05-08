import { groupService, getOrCreateNonGroup } from "@/services/groups.service";

const state = () => ({
  groups: [],
  loading: false,
});
const mutations = {
  SET_GROUPS(state, g) {
    state.groups = Array.isArray(g) ? g : [];
  },
  SET_LOADING(state, val) {
    state.loading = val;
  },
  ADD_GROUP(state, group) {
    if (group.clientId) {
      const index = state.groups.findIndex(
        (g) => g.clientId === group.clientId,
      );
      if (index !== -1) {
        state.groups.splice(index, 1, { ...state.groups[index], ...group });
        return;
      }
    }
    const exists = state.groups.some((g) => g.id === group.id);
    if (!exists) {
      state.groups.push(group);
    }
  },
  UPDATE_GROUP(state, updatedGroup) {
    const index = state.groups.findIndex((g) => g.id === updatedGroup.id);
    if (index !== -1) {
      state.groups.splice(index, 1, {
        ...state.groups[index],
        ...updatedGroup,
      });
    }
  },
  DELETE_GROUP(state, groupId) {
    state.groups = state.groups.filter((g) => g.id !== groupId);
  },
};
const actions = {
  // async fetchGroups({ commit }, type) {
  //   commit("SET_LOADING", true);
  //   try {
  //     const groups = await groupService.getGroups(type);
  //     commit("SET_GROUPS", Array.isArray(groups) ? [...groups] : []);
  //   } catch (err) {
  //     console.error("Failed to fetch groups", err);
  //   } finally {
  //     commit("SET_LOADING", false);
  //   }
  // },

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

  async createGroup({ commit }, payload) {
    const {
      title,
      type,
      members = [],
      profilePic,
      profilePicVersion,
    } = payload;
    const clientId = `temp_${Date.now()}`;
    const tempGroup = {
      id: clientId,
      clientId,
      title,
      type,
      members: members.map((id) => ({ user: { id, name: "Loading..." } })),
      netBalance: 0,
      displayName: title,
      profilePic,
      profilePicVersion,
    };

    try {
      commit("ADD_GROUP", tempGroup);
      const group = await groupService.createGroup(payload);
      commit("ADD_GROUP", { ...group, clientId });
      return group;
    } catch (e) {
      console.log("failed to create group", e);
      commit("DELETE_GROUP", clientId);
      throw e;
    }
  },

  async addMembers({ commit }, { groupId, userIds }) {
    try {
      const { addMemberToGroup, updatedGroup } =
        await groupService.addMemberToGroup(groupId, userIds);
      if (updatedGroup) {
        commit("UPDATE_GROUP", updatedGroup);
      }
      return addMemberToGroup;
    } catch (e) {
      console.log("failed to add members", e);
      throw e;
    }
  },

  async fetchGroupDetails({ commit }, groupId) {
    try {
      const { getGroupDetails } = await groupService.getGroupDetails(groupId);
      commit("ADD_GROUP", getGroupDetails); // Use ADD_GROUP which handles existing groups
      return getGroupDetails;
    } catch (e) {
      console.log("failed to fetch group details", e);
      throw e;
    }
  },

  async editGroupDetails({ commit }, payload) {
    try {
      const updatedGroup = await groupService.editGroupDetails(payload);
      commit("UPDATE_GROUP", updatedGroup);
      // return renameGroup;
    } catch (e) {
      console.log("failed to rename group", e);
      throw e;
    }
  },

  async deleteGroup({ commit }, { groupId }) {
    try {
      await groupService.deleteGroup(groupId);
      commit("DELETE_GROUP", groupId);
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

  getGroupById: (state, getters, rootState, rootGetters) => (id) => {
    const group = state.groups.find((group) => group.id === id);
    if (!group) return null;
    return {
      ...group,
      members:
        group.members?.map((m) => ({
          id: m.user?.id || m.id,
          name:
            (m.user?.id || m.id) === rootGetters["auth/getUserId"]
              ? "You"
              : m.user?.name || m.name || "Unknown",
        })) || [],
    };
  },
};
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
