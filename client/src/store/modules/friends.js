import { fetchFriends, createFriend } from "@/services/friends.service";

const state = () => ({
  friends: [],
  loading: false,
});

const mutations = {
  SET_FRIENDS(state, friends) {
    state.friends = friends;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
};

const actions = {
  async loadFriends({ commit, rootGetters }) {
    commit("SET_LOADING", true);

    try {
      const userId = rootGetters["auth/getUserId"];
      const friends = await fetchFriends();
      const { userAllBalances } = await import("@/utils/settlements");

      // Single call to get all balances for the user across all groups
      const allBalances = await userAllBalances(userId);

      // Aggregate net balances by person (friendId)
      const friendBalanceMap = {};
      allBalances.forEach((b) => {
        if (!friendBalanceMap[b.person]) friendBalanceMap[b.person] = 0;
        if (b.type === "owed") friendBalanceMap[b.person] += b.amount;
        if (b.type === "owe") friendBalanceMap[b.person] -= b.amount;
      });

      const friendsWithNet = friends.map((friend) => {
        const net = friendBalanceMap[friend.id] || 0;
        return {
          ...friend,
          displayName: friend.name,
          netBalance: net, // > 0: owes you, < 0: you owe
        };
      });
      console.log(`friendsWithNet`, friendsWithNet);
      commit("SET_FRIENDS", friendsWithNet);
    } catch (error) {
      console.error("Error loading friends: ", error);
      commit("SET_FRIENDS", []);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async createFriend({ dispatch }, friendId) {
    try {
      const group = await createFriend(friendId);
      await dispatch("group/fetchGroupsWithBalances", "PERSONAL", {
        root: true,
      });
      return group.id;
    } catch (error) {
      console.log("Error creating Friend", error);
    }
  },
};

const getters = {
  getFriends: (state) => state.friends,
  isLoading: (state) => state.loading,

  getGroupIdByFriendId: (state) => (friendId) => {
    const friend = state.friends.find((friend) => friend.id === friendId);
    return friend ? friend.groupId : null;
  },

  checkFriendById: (state) => (friendId) => {
    const friend = state.friends.find((friend) => friend.id === friendId);
    return friend.groupType === "PERSONAL";
  },

  getFriendsByIds: (state) => (idArray) => {
    if (!idArray || idArray?.length === 0) return [];
    else {
      const selectedFriends = idArray.map((id) => {
        return state.friends.find((friend) => friend.id === id);
      });

      return selectedFriends;
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
