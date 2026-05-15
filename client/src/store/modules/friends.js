import { fetchFriends, createFriend } from "@/services/friends.service";
import { getUserById } from "@/services/user.service";
import { handleApolloError } from "@/utils/errorHandler";

const state = () => ({
  friends: [],
  loading: false,
});

const mutations = {
  SET_FRIENDS(state, friends) {
    state.friends = Array.isArray(friends) ? friends : [];
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  ADD_FRIEND(state, friend) {
    if (friend.clientId) {
      const index = state.friends.findIndex(
        (f) => f.clientId === friend.clientId,
      );
      if (index !== -1) {
        state.friends.splice(index, 1, { ...state.friends[index], ...friend });
        return;
      }
    }
    const exists = state.friends.some((f) => f.id === friend.id);
    if (!exists) {
      state.friends.push(friend);
    }
  },
  REMOVE_FRIEND(state, friendId) {
    state.friends = state.friends.filter((f) => f.id !== friendId);
  },
};

const actions = {
  async loadFriends({ commit }) {
    commit("SET_LOADING", true);

    try {
      const friends = await fetchFriends();
      const { userAllBalances } = await import("@/utils/settlements");

      // Single call to get all balances for the user across all groups
      const allBalances = await userAllBalances();

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
      commit("SET_FRIENDS", friendsWithNet);
    } catch (error) {
      handleApolloError(error);

      commit("SET_FRIENDS", []);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async createFriend({ commit, state }, friendId) {
    let friendData = state.friends.find((friend) => friend.id === friendId);

    if (!friendData) {
      friendData = await getUserById(friendId);
    }
    const { name, email, profilePic, profilePicVersion } = friendData;
    const clientId = `temp_${Date.now()}`;

    const tempFriend = {
      id: friendId,
      clientId,
      name,
      displayName: name,
      email,
      profilePic,
      profilePicVersion,
      netBalance: 0,
      groupId: clientId,
      groupType: "PERSONAL",
    };

    try {
      commit("ADD_FRIEND", tempFriend);

      const friend = await createFriend(friendId);

      // Update the friend with the real group ID
      commit("ADD_FRIEND", {
        ...tempFriend,
        groupId: friend.groupId,
        clientId,
      });

      return friend.groupId;
    } catch (error) {
      commit("REMOVE_FRIEND", friendId);

      throw error;
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
    return friend?.groupType === "PERSONAL" || false;
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

  getFriendById: (state) => (id) => {
    const friend = state.friends.find((friend) => friend.id === id);
    return friend;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
