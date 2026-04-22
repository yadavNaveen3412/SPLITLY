import { fetchFriends } from "@/services/friends.service";
import { groupService } from "@/services/groups.service";
import { getUserById } from "@/services/user.service";
import { calculateNetWithFriend } from "@/utils/settlements";

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

      const friendsWithNet = await Promise.all(
        friends.map(async (friend) => {
          const net = await calculateNetWithFriend(userId, friend.id);

          return {
            ...friend,
            displayName: friend.name,
            netBalance: net, // > 0: owes you, < 0: you owe
          };
        }),
      );

      commit("SET_FRIENDS", friendsWithNet);
      // commit("SET_FRIENDS", friends);
    } catch (error) {
      console.error("Error loading friends: ", error);
      commit("SET_FRIENDS", []);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async createFriend({ rootGetters }, friendId) {
    try {
      const { name: friendName, email } = await getUserById(friendId);
      const name = await rootGetters["auth/getUserName"];

      // console.log("Friend Store Username:", name);

      const title = `${name.split(" ")[0]}_${friendName.split(" ")[0]}`;
      const { createGroup } = await groupService.createGroup(title, "PERSONAL");
      const groupId = createGroup.id;

      await groupService.addMemberToGroup(groupId, [email]);

      return groupId;
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
