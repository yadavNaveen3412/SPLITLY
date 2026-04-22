import { mapGetters, mapActions } from "vuex";
import { userService } from "@/services/user.service";
import { expenseService } from "@/services/expenses.service";
import ExpenseDetail from "../ExpenseDetailModal/ExpenseDetail.vue";
import GroupSettlement from "../Settlements/GroupSettlement/GroupSettlement.vue";
import { calculateUserBalanceList } from "@/utils/settlements";
import { settlementService } from "@/services/settlements.service";
export default {
  name: "GroupPage",
  components: { ExpenseDetail, GroupSettlement },
  props: ["id"],
  data() {
    return {
      group: null,

      expenses: [],
      settlements: [],
      userBalances: [],

      showPast: false,

      selectedExpense: null,
      showExpenseModal: false,
      isModalOpen: false, // Add Member Modal
      isShowMembersOpen: false, // Show Members Modal
      selectedFriends: [],
      emailInput: "",
      userExists: null,
      loadingExpenses: false,
      addingMembers: false,
      addMemberResult: "",
      addMemberResultClass: "",
      checkUserTimeout: null,
      isShowSettleUpModal: false,

      page: 1,
      pastPage: 1,
      pageSize: 12,
    };
  },

  computed: {
    ...mapGetters("group", ["getGroupById", "isLoading"]),
    ...mapGetters("friends", ["getFriends", "isLoading"]),
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
    friends() {
      return this.getFriends;
    },
    loading() {
      return this.isLoading;
    },
    groupId() {
      return this.$route.params.id;
    },
    currentCycleId() {
      return this.group?.currentCycleId;
    },
    suggestedFriends() {
      if (!this.friends || this.friends.length === 0) {
        console.log("no friends found");
        return;
      }
      if (
        !this.group ||
        !this.group.members ||
        this.group.members.length === 0
      ) {
        console.log("no members found");
        return;
      }
      const diff = this.friends
        .filter(
          (friend) =>
            !this.group.members.some((member) => member.user?.id === friend.id),
        )
        .map((friend) => ({
          id: friend.id,
          name: friend.name,
          email: friend.email,
        }));

      return diff;
    },

    topThreeBalances() {
      return this.userBalances.slice(0, 3);
    },
    remainingBalanceCount() {
      return Math.max(0, this.userBalances.length - 3);
    },
    isAllSettled() {
      return this.userBalances.length === 0;
    },

    currentActivities() {
      return [...this.currentExpenses, ...this.currentSettlements].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    },

    pastActivities() {
      return [...this.pastExpenses, ...this.pastSettlements].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    },

    visibleCurrentActivities() {
      return this.currentActivities.slice(0, this.page * this.pageSize);
    },

    visiblePastActivities() {
      return this.pastActivities.slice(0, this.pastPage * this.pageSize);
    },

    currentExpenses() {
      return this.expenses.filter((e) => e.cycleId === this.currentCycleId);
    },

    pastExpenses() {
      return this.expenses.filter((e) => e.cycleId < this.currentCycleId);
    },

    currentSettlements() {
      return this.settlements.filter((s) => s.cycleId === this.currentCycleId);
    },

    pastSettlements() {
      return this.settlements.filter((s) => s.cycleId < this.currentCycleId);
    },
    showSettledSeparator() {
      return (
        this.pastActivities.length > 0 &&
        this.visibleCurrentActivities.length === this.currentActivities.length
      );
    },
  },
  methods: {
    ...mapActions("friends", ["loadFriends"]),
    ...mapActions("group", ["addMembers", "fetchGroups", "fetchGroupDetails"]),

    getUserNamesById(userId) {
      const member = this.group.members.find((m) => m.user.id === userId);
      if (member) {
        return member.user.name;
      }
      return "Unknown";
    },

    getPaidBySummary(expense) {
      const payers = (expense.participants || []).filter(
        (p) => p.paidAmount > 0,
      );
      if (!payers || payers.length === 0) {
        return "No payment info";
      }
      if (payers.length === 1) {
        const name =
          this.getUserNamesById(payers[0].userId) || payers[0].user?.name;
        return `Paid by ${name} `;
      }
      return `Paid by ${payers.length} people`;
    },

    getAmountShared(expense) {
      try {
        const userId = this.user.id;
        const participant = (expense.participants || []).find(
          (p) => p.userId === userId,
        );

        const payerAmount = Number(participant?.paidAmount || 0);
        const sharerAmount = Number(participant?.owedAmount || 0);

        return payerAmount - sharerAmount;
      } catch (e) {
        console.error("user not found", e);
      }
    },

    async openExpenseModal(expenseId) {
      const { getExpenseById } = await expenseService.getExpenseById(expenseId);
      this.selectedExpense = getExpenseById;
      this.showExpenseModal = true;
    },
    closeExpenseModal() {
      this.selectedExpense = null;
      this.showExpenseModal = false;
    },

    async fetchGroupDetail() {
      try {
        const getGroupDetails = await this.fetchGroupDetails(this.groupId);
        this.group = getGroupDetails;
      } catch (error) {
        console.error("Error loading group:", error);
        this.$router.push({ name: "Groups" });
      }
    },

    async fetchAll() {
      await this.fetchGroupDetail();

      const expRes = await expenseService.getExpensesByGroup(this.groupId);
      this.expenses = expRes.getExpensesByGroup.map((e) => ({
        ...e,
        type: "EXPENSE",
      }));

      const setRes = await settlementService.getSettlementsByGroup(
        this.groupId,
      );
      this.settlements = setRes.getSettlementsByGroup.map((s) => ({
        ...s,
        type: "SETTLEMENT",
      }));

      this.userBalances = await calculateUserBalanceList(
        this.user.id,
        this.group.id,
      );
    },
    async checkUserExists() {
      if (this.checkUserTimeout) clearTimeout(this.checkUserTimeout);
      if (!this.isValidEmail(this.emailInput)) {
        this.userExists = null;
        return;
      }
      this.checkUserTimeout = setTimeout(async () => {
        try {
          const exists = await userService.checkUserExists(this.emailInput);
          this.userExists = exists;
        } catch (error) {
          console.error("Error checking user:", error);
          this.userExists = null;
        }
      }, 500);
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    addByEmail() {
      if (this.emailInput && this.isValidEmail(this.emailInput)) {
        if (!this.selectedFriends.includes(this.emailInput)) {
          this.selectedFriends.push(this.emailInput);
        }
        this.emailInput = "";
        this.userExists = null;
      }
    },
    isSelected(email) {
      return this.selectedFriends.includes(email);
    },
    removeSelectedEmail(email) {
      this.selectedFriends = this.selectedFriends.filter((e) => e !== email);
    },
    async handleAddMembers() {
      if (this.selectedFriends.length === 0) return;
      this.addingMembers = true;
      this.addMemberResult = "";
      try {
        const result = await this.addMembers({
          groupId: this.groupId,
          userIds: this.selectedFriends,
        });

        let message = "";
        if (result.added?.length) {
          message += `✓ Added ${result.added.length} member(s). `;
        }
        if (result.alreadyMembers?.length) {
          message += `${result.alreadyMembers.length} already in group. `;
        }
        if (result.invited?.length) {
          message += `Invited ${result.invited.length} new users. `;
        }

        this.addMemberResult = message;
        this.addMemberResultClass = "alert-success";
        this.group = result.updatedGroup;

        setTimeout(() => {
          this.selectedFriends = [];
          this.addMemberResult = "";
          this.isModalOpen = false;
        }, 2000);
      } catch (error) {
        console.error("Error adding members:", error);
        this.addMemberResult = "Failed to add members: " + error.message;
        this.addMemberResultClass = "alert-danger";
      } finally {
        this.addingMembers = false;
      }
    },
    getYourShareText(expense) {
      const share = this.getAmountShared(expense);
      if (share > 0) return `you lent ₹${share.toFixed(2)}`;
      if (share < 0) return `you owe ₹${Math.abs(share).toFixed(2)}`;
      return "Not included";
    },
    getShareClass(expense) {
      const share = this.getAmountShared(expense);
      if (share > 0) return "text-success";
      if (share < 0) return "text-danger";
      return "text-muted";
    },
    goBack() {
      this.$router.push(`/groups`);
    },
    editGroup() {
      this.$router.push(`/group/${this.groupId}/edit`);
    },
    goToAddExpense() {
      this.$router.push({
        name: "AddExpense",
        query: { source: "group", groupId: this.id },
      });
    },
    toggleModal() {
      this.isModalOpen = !this.isModalOpen;
      if (this.isModalOpen === false) {
        this.selectedFriends = [];
      }
    },
    openShowMembers() {
      this.isShowMembersOpen = true;
    },
    closeShowMembers() {
      this.isShowMembersOpen = false;
    },
    showSettleUpModal() {
      this.isShowSettleUpModal = true;
    },
    closeSettleUpModal() {
      this.isShowSettleUpModal = false;
    },
    async onSettlementSuccess() {
      this.isShowSettleUpModal = false;
      this.showPast = false;
      await this.fetchAll();
    },
    async fetchData() {
      await this.fetchGroupDetail();
      this.userBalances = await calculateUserBalanceList(
        this.user.id,
        this.group.id,
      );
    },
    async handleSettlement(payload) {
      await this.fetchData();
      console.log("payload from group js", payload);
      if (payload) {
        return true;
      }
      return false;
    },
  },
  async created() {
    await this.loadFriends();
  },
  async mounted() {
    await this.fetchGroups("GROUP");
    await this.fetchAll();
    document.body.style.overflow = "";
    console.log("pastExpenses", this.pastExpenses);
    console.log("currentExpenses", this.currentExpenses);
    console.log("[pastSettlements]", this.pastSettlements);
    console.log("currentSettlements", this.currentSettlements);
  },

  watch: {
    groupId(newId) {
      this.fetchGroupDetail(newId);
    },
    groupActivities() {
      this.page = 1;
    },

    "$route.query.settleUp": {
      immediate: true,
      handler(val) {
        this.isShowSettleUpModal = val === "true";
      },
    },
  },
};
