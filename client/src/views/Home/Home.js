import { userAllBalances } from "@/utils/settlements";
import { mapActions, mapGetters } from "vuex";
import FriendImage from "@/assets/images/FriendImage.jpeg";
import GroupImage from "@/assets/images/GroupImage.png";
import ExpenseImage from "@/assets/images/ExpenseImage.png";
import { handleApolloError } from "@/utils/errorHandler";

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
    ...mapActions("group", ["fetchGroupsWithBalances"]),
    goToGroups() {
      this.$router.push({ name: "Groups" });
      this.fetchGroupsWithBalances();
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
    async calculateOverallBalance() {
      try {
        let owed = 0;
        let owe = 0;

        const transactions = await userAllBalances();

        transactions.forEach((t) => {
          if (t.type === "owed") {
            owed += t.amount;
          } else if (t.type === "owe") {
            owe += t.amount;
          }
        });

        this.balances.owedToYou = Number(owed).toFixed(2);
        this.balances.youOwe = Number(owe).toFixed(2);
      } catch (error) {
        handleApolloError(error);
      }
    },
  },
  async mounted() {
    const storedUser = this.getUserId;

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
