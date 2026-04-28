import { userAllBalances } from "@/utils/settlements";
import { mapActions, mapGetters } from "vuex";
import FriendImage from "@/assets/images/FriendImage.jpeg";
import GroupImage from "@/assets/images/GroupImage.png";
import ExpenseImage from "@/assets/images/ExpenseImage.png";

export default {
  name: "HomePage",
  computed: {
    ...mapGetters("auth", ["getUser", "isLoading", "getUserId"]),
    user() {
      return this.getUser;
    },
    loading() {
      return this.isLoading;
    },
  },

  data() {
    return {
      balances: {
        owedToYou: 0, // from backend
        youOwe: 0, // from backend
      },
      FriendImage,
      GroupImage,
      ExpenseImage,
    };
  },

  methods: {
    ...mapActions("group", ["fetchGroups"]),
    goToGroups() {
      this.$router.push({ name: "Groups" });
      this.fetchGroups();
    },
    goToFriend() {
      this.$router.push({ name: "Friends" });
    },
    goToGeneral() {
      this.$router.push("/general");
    },
    goToAnalysis() {
      this.$router.push("/analysis");
    },
    goToAddExpense() {
      this.$router.push({ name: "AddExpense" });
    },
    async calculateOverallBalance() {
      let owed = 0;
      let owe = 0;

      const transactions = await userAllBalances(this.user.id);

      transactions.forEach((t) => {
        if (t.type === "owed") {
          owed += t.amount;
        } else if (t.type === "owe") {
          owe += t.amount;
        }
      });

      this.balances.owedToYou = Number(owed).toFixed(2);
      this.balances.youOwe = Number(owe).toFixed(2);
      console.log("transactions", transactions);
    },
  },
  async mounted() {
    const storedUser = this.getUserId;
    console.log("mounting home");

    if (!storedUser) {
      this.$router.push({ name: "Register" });
    }
  },
  watch: {
    user: {
      immediate: true,
      async handler(val) {
        if (val?.id) {
          await this.calculateOverallBalance();
        }
      },
    },
  },
};
