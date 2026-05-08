import PersonalSettlement from "@/views/Settlements/PersonalSettlement/PersonalSettlement.vue";
import ExpenseDetail from "@/views/ExpenseDetailModal/ExpenseDetail.vue";
import { mapActions, mapGetters } from "vuex";
import ExpenseImage from "@/assets/images/ExpenseImage.png";

export default {
  name: "ExpenseTab",

  components: { ExpenseDetail, PersonalSettlement },

  props: ["id", "page"],

  data() {
    return {
      isFriend: false,
      isCheckingFriend: true,
      isShowSettleUpModal: false,
      showExpenseModal: false,
      selectedExpense: null,
      ExpenseImage,
    };
  },

  computed: {
    ...mapGetters("expenses", [
      "getFriendExpenses",
      "getGroupExpenses",
      "getExpenseById",
    ]),
    ...mapGetters("friends", ["checkFriendById"]),
    expenses() {
      if (this.page === "friends") {
        return this.getFriendExpenses.directExpenses;
      }
      return this.getGroupExpenses;
    },

    groupExpenses() {
      if (this.page === "friends") {
        return this.getFriendExpenses.groupSummaries.map((s) => ({
          ...s,
          groupTitle: s.groupName,
        }));
      }
      return [];
    },
  },

  watch: {
    id: {
      immediate: true,
      async handler(newVal) {
        if (!newVal) return;
        if (this.page === "friends") {
          await this.fetchFriendExpenses(newVal);
        } else {
          await this.fetchGroupExpenses(newVal);
        }
      },
    },
  },

  methods: {
    ...mapActions("friends", ["createFriend"]),
    ...mapActions("expenses", ["fetchFriendExpenses", "fetchGroupExpenses"]),

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
    showSettleUpModal() {
      if (this.page === "friends") this.isShowSettleUpModal = true;
      else if (this.page === "groups") {
        this.$router.push({
          name: "Group",
          params: { id: this.id },
          query: { settleUp: "true" },
        });
      }
    },
    closeSettleUpModal() {
      this.isShowSettleUpModal = false;
    },
    async goToAddExpense() {
      if (this.page === "friends") {
        await this.checkIfFriend();

        if (!this.isFriend) {
          await this.createFriend(this.id);
        }

        this.$router.push({
          name: "AddExpense",
          query: { source: "friend", friendId: this.id },
        });
      } else {
        this.$router.push({
          name: "AddExpense",
          query: { source: "group", groupId: this.id },
        });
      }
    },

    async checkIfFriend() {
      try {
        this.isFriend = this.checkFriendById(this.id);
      } catch (error) {
        console.log("Error checking friend status:", error);
        this.isFriend = false;
      }
    },

    openExpenseModal(expenseId) {
      const expense = this.getExpenseById(expenseId);
      this.selectedExpense = expense;
      this.showExpenseModal = true;
    },

    closeExpenseModal() {
      this.selectedExpense = null;
      this.showExpenseModal = false;
    },

    goToGroup(id) {
      this.$router.push({ name: "GroupChats", params: { id } });
    },
  },
};
