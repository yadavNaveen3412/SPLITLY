import { expenseService } from "@/services/expenses.service";
import { handleApolloError } from "@/utils/errorHandler";

const state = () => ({
  groupExpenses: [],
  friendExpenses: {
    directExpenses: [],
    groupSummaries: [],
  },
});

const mutations = {
  SET_GROUP_EXPENSES(state, expenses) {
    state.groupExpenses = Array.isArray(expenses) ? [...expenses] : [];
  },

  SET_FRIEND_EXPENSES(state, payload) {
    state.friendExpenses = {
      directExpenses: payload?.directExpenses
        ? [...payload.directExpenses]
        : [],
      groupSummaries: payload?.groupSummaries
        ? [...payload.groupSummaries]
        : [],
    };
  },

  ADD_OR_UPDATE_EXPENSE(state, { expense, source }) {
    if (source === "group") {
      const index = state.groupExpenses.findIndex(
        (e) =>
          e.id === expense.id ||
          (expense.clientId && e.clientId === expense.clientId),
      );
      if (index !== -1) {
        state.groupExpenses.splice(index, 1, {
          ...state.groupExpenses[index],
          ...expense,
        });
      } else {
        state.groupExpenses = [expense, ...state.groupExpenses];
      }
    } else {
      const index = state.friendExpenses.directExpenses.findIndex(
        (e) =>
          e.id === expense.id ||
          (expense.clientId && e.clientId === expense.clientId),
      );
      if (index !== -1) {
        state.friendExpenses.directExpenses.splice(index, 1, {
          ...state.friendExpenses.directExpenses[index],
          ...expense,
        });
      } else {
        state.friendExpenses = {
          ...state.friendExpenses,
          directExpenses: [expense, ...state.friendExpenses.directExpenses],
        };
      }
    }
  },

  REMOVE_EXPENSE(state, { expenseId, source }) {
    if (source === "group") {
      state.groupExpenses = state.groupExpenses.filter(
        (e) => e.id !== expenseId,
      );
    } else {
      state.friendExpenses = {
        ...state.friendExpenses,
        directExpenses: state.friendExpenses.directExpenses.filter(
          (e) => e.id !== expenseId,
        ),
      };
    }
  },
};

const actions = {
  async fetchGroupExpenses({ commit }, groupId) {
    try {
      const expenses = await expenseService.getGroupExpenses(groupId);

      commit("SET_GROUP_EXPENSES", expenses);
    } catch (error) {
      handleApolloError(error);
    }
  },

  async fetchFriendExpenses({ commit }, friendId) {
    try {
      const expenses = await expenseService.getFriendExpenses(friendId);

      commit("SET_FRIEND_EXPENSES", expenses);
    } catch (error) {
      handleApolloError(error);
    }
  },

  async createExpense({ commit, rootGetters, dispatch }, payload) {
    const clientId = `temp_${Date.now()}`;
    const userId = rootGetters["auth/getUserId"];
    const source = payload.source || (payload.groupId ? "group" : "friend");

    // Create optimistic expense object
    const tempExpense = {
      id: clientId,
      clientId,
      title: payload.title,
      totalAmount: payload.totalAmount,
      createdAt: new Date().toISOString(),
      categoryId: payload.categoryId,
      category: rootGetters["categories/getCategoryById"](payload.categoryId),
      participants: payload.participants.map((p) => ({
        ...p,
        user: { id: p.userId, name: "Loading..." },
      })),
      createdByUser: { id: userId, name: "You" },
      amount: 0,
      type: "no-balance",
    };

    // Calculate derived fields optimistically
    const userParticipant = payload.participants.find(
      (p) => p.userId === userId,
    );
    if (userParticipant) {
      const paid = userParticipant.paidAmount || 0;
      const estimatedOwed = payload.totalAmount / payload.participants.length;
      const net = paid - estimatedOwed;
      tempExpense.amount = net;
      tempExpense.type = net > 0 ? "owed" : net < 0 ? "owe" : "no-balance";
    }

    try {
      commit("ADD_OR_UPDATE_EXPENSE", { expense: tempExpense, source });

      // Strip out non-schema fields (like source) before sending to server
      const {
        title,
        description,
        groupId,
        totalAmount,
        categoryId,
        splitMethod,
        participants,
      } = payload;

      const cleanedInput = {
        title,
        description,
        groupId,
        totalAmount,
        categoryId,
        splitMethod,
        participants: participants.map((p) => ({
          userId: p.userId,
          paidAmount: p.paidAmount,
          splitValue: p.splitValue,
        })),
      };

      const result = await expenseService.createExpense(cleanedInput);
      if (result) {
        commit("ADD_OR_UPDATE_EXPENSE", {
          expense: { ...result, clientId },
          source,
        });

        // Trigger global balance refresh
        await Promise.all([
          dispatch("friends/loadFriends", null, { root: true }),
          dispatch("group/fetchGroupsWithBalances", "GROUP", { root: true }),
        ]);
      }
      return result;
    } catch (error) {
      commit("REMOVE_EXPENSE", { expenseId: clientId, source });

      throw error;
    }
  },

  async updateExpense({ commit, dispatch }, { id, input, source }) {
    const result = await expenseService.updateExpense(id, input);
    commit("ADD_OR_UPDATE_EXPENSE", { expense: result, source });

    // Trigger global balance refresh
    await Promise.all([
      dispatch("friends/loadFriends", null, { root: true }),
      dispatch("group/fetchGroupsWithBalances", "GROUP", { root: true }),
    ]);

    return result;
  },

  async deleteExpenseById({ commit, dispatch, getters }, { id, source }) {
    const expense = getters.getExpenseById(id);
    try {
      commit("REMOVE_EXPENSE", { expenseId: id, source });
      await expenseService.deleteExpense(id);

      // Trigger global balance refresh
      await Promise.all([
        dispatch("friends/loadFriends", null, { root: true }),
        dispatch("group/fetchGroupsWithBalances", "GROUP", { root: true }),
      ]);

      return true;
    } catch (error) {
      if (expense) commit("ADD_OR_UPDATE_EXPENSE", { expense, source });

      throw error;
    }
  },
};

const getters = {
  getGroupExpenses: (state) => state.groupExpenses,
  getFriendExpenses: (state) => state.friendExpenses,
  getExpenseById: (state) => (id) => {
    return (
      state.groupExpenses.find((e) => e.id === id) ||
      state.friendExpenses.directExpenses.find((e) => e.id === id)
    );
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
