import { settlementService } from "@/services/settlements.service";

const state = () => ({
  settlements: [],
  loading: false,
});

const mutations = {
  SET_SETTLEMENTS(state, settlements) {
    state.settlements = Array.isArray(settlements)
      ? settlements.map((s) => ({ ...s }))
      : [];
  },
  SET_LOADING(state, val) {
    state.loading = val;
  },
  ADD_SETTLEMENT(state, settlement) {
    if (settlement.clientId) {
      const index = state.settlements.findIndex(
        (s) => s.clientId === settlement.clientId,
      );
      if (index !== -1) {
        state.settlements.splice(index, 1, {
          ...state.settlements[index],
          ...settlement,
        });
        return;
      }
    }
    const exists = state.settlements.some((s) => s.id === settlement.id);
    if (!exists) {
      state.settlements.unshift(settlement);
    }
  },
  REMOVE_SETTLEMENT(state, settlementId) {
    state.settlements = state.settlements.filter((s) => s.id !== settlementId);
  },
};

const actions = {
  async createSettlement({ commit, dispatch }, payload) {
    const clientId = `temp_${Date.now()}`;
    const tempSettlement = {
      id: clientId,
      clientId,
      ...payload,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    try {
      commit("ADD_SETTLEMENT", tempSettlement);
      const result = await settlementService.createSettlement(payload);
      commit("ADD_SETTLEMENT", { ...result, clientId });

      // Trigger global balance refresh
      dispatch("friends/loadFriends", null, { root: true });
      dispatch("group/fetchGroupsWithBalances", "GROUP", { root: true });

      return result;
    } catch (error) {
      console.log(`Error creating settlement: ${error}`);
      commit("REMOVE_SETTLEMENT", clientId);
      throw error;
    }
  },

  async getSettlementsByGroup({ commit }, groupId) {
    commit("SET_LOADING", true);
    try {
      const settlements = await settlementService.getSettlementsByGroup(
        groupId,
      );
      commit("SET_SETTLEMENTS", settlements);
      return settlements;
    } catch (error) {
      console.log(`Error getting settlements: ${error}`);
      commit("SET_SETTLEMENTS", []);
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const getters = {
  getSettlements: (state) => state.settlements,
  isLoading: (state) => state.loading,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
