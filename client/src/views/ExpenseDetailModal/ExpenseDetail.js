import { mapActions, mapGetters } from "vuex";

export default {
  name: "ExpenseDetail",
  props: {
    expense: Object,
  },
  data() {
    return {
      isDescriptionExpanded: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },

    peopleSummary() {
      const summaryMap = new Map();

      (this.expense.participants || []).forEach((p) => {
        if (p.paidAmount > 0 || p.owedAmount > 0) {
          summaryMap.set(p.userId, {
            id: p.userId,
            name: p.user?.name ?? "Unknown",
            paid: Number(p.paidAmount),
            shared: Number(p.owedAmount),
          });
        }
      });

      return Array.from(summaryMap.values());
    },

    sortedPeople() {
      const userId = this.user.id;

      return this.peopleSummary.slice().sort((a, b) => {
        if (a.id === userId) return -1;
        if (b.id === userId) return 1;
        return 0;
      });
    },

    shouldTruncate() {
      return this.expense.description && this.expense.description.length > 100;
    },

    displayedDescription() {
      if (this.isDescriptionExpanded || !this.shouldTruncate) {
        return this.expense.description;
      }
      return this.expense.description.substring(0, 100) + "...";
    },
  },
  methods: {
    ...mapActions("expenses", ["deleteExpenseById"]),

    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    toggleDescription() {
      this.isDescriptionExpanded = !this.isDescriptionExpanded;
    },
    editExpense() {
      this.$emit("edit-expense", this.expense);
    },
    async deleteExpense() {
      if (!confirm("Are you sure you want to delete this expense?")) return;

      try {
        const success = await this.deleteExpenseById(this.expense.id);

        if (success) {
          console.log("expense deleted");
          console.log("groupid", this.expense.groupId);
          this.$emit("deleted");
        } else {
          console.error("Error deleting expense");
        }
      } catch (error) {
        console.error("Server error while deleting expense:", error);
      }
    },
  },
  mounted() {
    console.log("expense detail mounted");
    console.log("expense", this.expense);
  },
};
