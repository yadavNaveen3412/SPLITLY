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
      ExpenseImage,
    };
  },

  computed: {
    ...mapGetters("expenses", ["getExpenses", "getGroupExpensesByFriend"]),
    expenses() {
      return this.getExpenses;
    },

    groupExpenses() {
      return this.getGroupExpensesByFriend;
    },
  },

  watch: {
    id: {
      immediate: true,
      async handler(newVal) {
        await this.loadExpenses({ type: this.page, id: newVal });
      },
    },
  },

  methods: {
    ...mapActions("friends", ["createFriend", "checkFriendById"]),
    ...mapActions("expenses", ["loadExpenses", "getExpenseById"]),

    formatDate(date) {
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

    async openExpenseModal(expenseId) {
      const expense = await this.getExpenseById(expenseId);
      this.selectedExpense = expense;
      this.showExpenseModal = true;
    },

    closeExpenseModal() {
      this.selectedExpense = null;
      this.showExpenseModal = false;
    },

    goToGroup(id) {
      this.$router.push({ name: "Group", params: { id } });
    },
  },
};
