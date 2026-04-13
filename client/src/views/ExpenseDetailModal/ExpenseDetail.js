import { expenseService } from "@/services/expenses.service";
import { mapGetters } from "vuex";

export default {
  name: "ExpenseDetail",
  props: {
    expense: Object,
  },
  // data() {},
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
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    editExpense() {
      this.$emit("edit-expense", this.expense);
    },
    async deleteExpense() {
      if (!confirm("Are you sure you want to delete this expense?")) return;

      try {
        const { deleteExpense: success } = await expenseService.deleteExpense(
          this.expense.id
        );

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
