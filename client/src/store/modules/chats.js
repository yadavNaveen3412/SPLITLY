import {
  getChats,
  sendChat,
  subscribeToMessage,
} from "@/services/chat.service";

const state = () => ({
  chats: [],
  loading: false,
  subscription: null,
  groupId: null,
});

const mutations = {
  SET_CHATS(state, chats) {
    state.chats = chats;
  },

  ADD_CHAT(state, chat) {
    if (chat.clientId) {
      const index = state.chats.findIndex((c) => c.clientId === chat.clientId);

      if (index !== -1) {
        state.chats[index] = {
          ...chat,
          sentByYou: true,
        };
        return;
      }
    }

    const exists = state.chats.some((c) => c.id === chat.id);
    if (!exists) {
      state.chats.push(chat);
    }
  },

  SET_LOADING(state, status) {
    state.loading = status;
  },

  SET_SUBSCRIPTION(state, sub) {
    state.subscription = sub;
  },

  CLEAR_SUBSCRIPTION(state) {
    state.subscription = null;
  },

  SET_GROUP_ID(state, id) {
    state.groupId = id;
  },
};

const actions = {
  async loadChats({ commit, state, dispatch, rootGetters }, payload) {
    commit("SET_LOADING", true);
    try {
      await dispatch("setGroupId", payload);

      if (!state.groupId) {
        commit("SET_CHATS", []);
        return;
      }

      const rawChats = await getChats(state.groupId);
      const chats = rawChats.map((chat) => ({
        ...chat,
        sentByYou: chat.senderId === rootGetters["auth/getUserId"],
      }));
      commit("SET_CHATS", chats);
    } catch (err) {
      console.log("An error occured:", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async sendChat({ commit, state, rootGetters }, payload) {
    commit("SET_LOADING", true);
    if (!state.groupId) {
      console.log("Not a friend");
      return;
    }

    const clientId = `temp_${Date.now()}`;
    const tempMessage = {
      id: clientId,
      clientId,
      groupId: state.groupId,
      senderId: rootGetters["auth/getUserId"],
      chatMessage: payload.chatMessage,
      sentByYou: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      commit("ADD_CHAT", tempMessage);
      await sendChat({
        group_id: state.groupId,
        chatMessage: payload.chatMessage,
        clientId,
      });
    } catch (err) {
      commit(
        "SET_CHATS",
        state.chats.filter((c) => c.clientId !== clientId),
      );
      console.log("An error occured:", err);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async subscribeToChats({ commit, state, rootGetters }) {
    if (!state.groupId) return;

    if (state.subscription) return;

    const subscription = subscribeToMessage(state.groupId, (newMessage) => {
      commit("ADD_CHAT", {
        ...newMessage,
        sentByYou: newMessage.senderId === rootGetters["auth/getUserId"],
      });
    });

    commit("SET_SUBSCRIPTION", subscription);
  },

  stopSubscription({ state, commit }) {
    if (state.subscription) {
      state.subscription.unsubscribe();
      commit("CLEAR_SUBSCRIPTION");
    }
  },

  async setGroupId({ commit, rootGetters }, payload) {
    const { id, type } = payload;
    if (type === "friends") {
      const groupId = rootGetters["friends/getGroupIdByFriendId"](id);
      console.log(`GID CHAT STORE: ${groupId}`);
      commit("SET_GROUP_ID", groupId);
    } else {
      commit("SET_GROUP_ID", id);
    }
  },
};

const getters = {
  getChats: (state) => state.chats,
  getSubscription: (state) => state.subscription,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
