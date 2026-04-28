import {
  createExpense,
  expenseService,
  getExpenseByFriendId,
} from "@/services/expenses.service";
import { getCommonGroups } from "@/services/groups.service";
import { calculateUserBalanceList } from "@/utils/settlements";

const state = () => ({
  expenses: [],
  groupExpensesByFriend: [],
});

const mutations = {
  SET_EXPENSES(state, expenses) {
    state.expenses = expenses;
  },

  SET_GROUP_EXPENSES_BY_FRIEND(state, payload) {
    state.groupExpensesByFriend = payload;
  },
};

const actions = {
  async loadExpenses({ commit, rootGetters }, payload) {
    try {
      const { type, id } = payload;
      const userId = rootGetters["auth/getUserId"];

      if (type === "friends") {
        const [commonGroups, data] = await Promise.all([
          getCommonGroups(id),
          getExpenseByFriendId(id),
        ]);

        const expenses = data || [];

        const groupTransactionsList = await Promise.all(
          commonGroups.map(async (group) => {
            const transactions = await calculateUserBalanceList(
              userId,
              group.id,
            );

            return transactions
              .filter((t) => t.person === id)
              .map((t) => ({
                ...t,
                groupId: group.id,
                groupType: group.type,
                groupTitle: group.title,
              }));
          }),
        );
        const groupExpenses = groupTransactionsList.flat() || [];

        commit("SET_EXPENSES", expenses);
        commit("SET_GROUP_EXPENSES_BY_FRIEND", groupExpenses);
        return;
      }

      if (type === "groups") {
        const { getExpensesByGroup } = await expenseService.getExpensesByGroup(
          id,
        );
        const expenses = SimplifyExpenses(getExpensesByGroup, userId);
        commit("SET_EXPENSES", expenses);
      }
    } catch (error) {
      console.error("loadExpenses error:", error);
    }
  },

  async createExpense(_, payload) {
    try {
      return await createExpense(payload);
    } catch (error) {
      console.error("createExpense error:", error);
      return false;
    }
  },

  async getExpenseById(_, id) {
    try {
      return await expenseService.getExpenseById(id);
    } catch (error) {
      console.error("getExpenseById error:", error);
      return false;
    }
  },

  async deleteExpenseById(_, id) {
    try {
      return await expenseService.deleteExpense(id);
    } catch (error) {
      console.error("deleteExpense error:", error);
      return false;
    }
  },

  async getExpensesByGroup(_, id) {
    try {
      return await expenseService.getExpensesByGroup(id);
    } catch (error) {
      console.error("getExpenseByGroup error:", error);
      return false;
    }
  },
};

const getters = {
  getExpenses: (state) => state.expenses,
  getGroupExpensesByFriend: (state) => state.groupExpensesByFriend,
  getTotal: (state) => state.total,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

function SimplifyExpenses(data, userId) {
  return data.map((e) => {
    const userParticipant = e.participants.find((p) => p.userId === userId);

    const amountPaid = userParticipant?.paidAmount || 0;
    const amountOwed = userParticipant?.owedAmount || 0;

    const isPaidByUser = amountPaid > 0;
    const isSharedByUser = amountOwed > 0;

    const amount = amountPaid - amountOwed;

    let type;

    // Case 1: User not involved at all
    if (!isPaidByUser && !isSharedByUser) {
      type = "not-involved";
    }
    // Case 2: User involved but net zero
    else if (amount === 0) {
      type = "no-balance";
    }
    // Case 3: User owes money
    else if (amount < 0) {
      type = "owe";
    }
    // Case 4: User is owed money
    else {
      type = "owed";
    }

    return {
      id: e.id,
      title: e.title,
      date: e.createdAt,
      category: e.category,
      totalAmount: e.totalAmount,
      amount,
      type,
    };
  });
}
