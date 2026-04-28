import { settlementService } from "@/services/settlements.service";

const state = () => ({});
const mutations = {};
const actions = {
  async createSettlement(_, payload) {
    try {
      return settlementService.createSettlement(payload);
    } catch (error) {
      console.log(`Error creating settlement: ${error}`);
      throw error;
    }
  },
  async getSettlementsByGroup(_, groupId) {
    try {
      return settlementService.getSettlementsByGroup(groupId);
    } catch (error) {
      console.log(`Error getting settlements: ${error}`);
      throw error;
    }
  },
};
const getters = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
