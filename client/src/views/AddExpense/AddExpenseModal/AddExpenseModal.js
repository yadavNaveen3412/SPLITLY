import SelectionList from "../SelectionList/SelectionList.vue";
import MemberSelection from "../MemberSelection/MemberSelection.vue";
import ExpenseForm from "../ExpenseForm/ExpenseForm.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "AddExpenseModal",

  components: {
    SelectionList,
    MemberSelection,
    ExpenseForm,
  },

  emits: ["close"],

  data() {
    return {
      isOpen: true,
      currentStep: 1,
      previousStep: 0,
      isBackward: false,
      activeTab: "groups",
      selectedGroupId: null,
      selectedFriendIds: [],
      selectedMembers: [],
      expenseData: {},
    };
  },

  computed: {
    ...mapGetters("friends", ["getFriendsByIds"]),
    ...mapGetters("auth", ["getUser"]),
    currentUser() {
      const user = this.getUser;
      return {
        id: user.id,
        name: "You",
        email: user.email,
      };
    },

    finalParticipants() {
      if (this.activeTab === "friends") {
        return this.getFriendsByIds(this.selectedFriendIds);
      } else {
        return this.selectedMembers;
      }
    },

    getHeaderTitle() {
      if (this.currentStep === 1) {
        return this.activeTab === "groups" ? "Select Group" : "Select Friends";
      } else if (this.currentStep === 2) {
        return "Select Members";
      } else {
        return "Add Expense";
      }
    },

    canProceed() {
      if (this.currentStep === 1) {
        return this.activeTab === "groups"
          ? this.selectedGroupId !== null
          : this.selectedFriendIds.length > 0;
      } else if (this.currentStep === 2) {
        return this.selectedMembers.length > 0;
      }
      return true;
    },

    currentSelectedIds() {
      return this.activeTab === "groups"
        ? this.selectedGroupId
        : this.selectedFriendIds;
    },
  },

  methods: {
    ...mapActions("group", [
      "fetchGroupsWithBalances",
      "getNonGroupId",
      "getPersonalGroupId",
    ]),
    ...mapActions("friends", ["loadFriends"]),
    ...mapActions("expenses", ["createExpense"]),
    initialize() {
      this.currentStep = 1;
      this.selectedGroupId = null;
      this.selectedFriendIds = [];
      this.selectedMembers = [];
      this.activeTab = "groups";

      if (this.$store.state.group.groups.length === 0) {
        this.fetchGroupsWithBalances("GROUP");
      }
      if (this.$store.state.friends.friends.length === 0) {
        this.loadFriends();
      }
    },

    goToNextStep() {
      this.previousStep = this.currentStep;
      this.isBackward = false;
      if (this.currentStep === 1 && this.activeTab === "groups") {
        this.currentStep = 2;
      } else {
        this.currentStep = 3;
      }
    },

    goToPreviousStep() {
      this.previousStep = this.currentStep;
      this.isBackward = true;
      if (this.currentStep === 3 && this.activeTab === "groups") {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
    },

    closeModal() {
      this.$router.back();
    },

    handleTabChange(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.selectedGroupId = null;
      this.selectedFriendIds = [];
      this.selectedMembers = [];
    },

    handleAddNew() {
      if (this.activeTab === "friends") {
        this.$router.push({ name: "AddExpense-AddFriend" });
      }
      if (this.activeTab === "groups") {
        this.$router.push({ name: "CreateGroup" });
      }
      console.log(
        `Add new ${this.activeTab === "groups" ? "group" : "friend"}`,
      );
    },

    updateSelectedIds(value) {
      if (this.activeTab === "groups") {
        this.selectedGroupId = value;
        this.selectedFriendIds = [];
      } else {
        this.selectedFriendIds = value;
        this.selectedGroupId = null;
      }
    },

    updateSelectedMembers(value) {
      this.selectedMembers = value;
    },

    async handleSubmit(expenseData) {
      this.expenseData = { ...expenseData };
      let source = "group";

      if (this.selectedGroupId) {
        this.expenseData.groupId = this.selectedGroupId;
        source = "group";
      } else if (
        this.selectedFriendIds &&
        this.selectedFriendIds.length === 1
      ) {
        this.expenseData.groupId = await this.getPersonalGroupId(
          this.selectedFriendIds[0],
        );
        source = "friend";
      } else {
        this.expenseData.groupId = await this.getNonGroupId([
          ...this.selectedFriendIds,
          this.currentUser.id,
        ]);
        source = "friend";
      }

      const payload = {
        ...JSON.parse(JSON.stringify(this.expenseData)),
        source,
      };

      await this.createExpense(payload);
      this.closeModal();
    },
  },

  watch: {
    isOpen(val) {
      if (val) this.initialize();
    },
  },

  created() {
    const { source, groupId, friendId } = this.$route.query;
    if (source === "group" && groupId) {
      // Preselect group
      this.activeTab = "groups";
      this.selectedGroupId = groupId;
      this.currentStep = 2; // Skip to member selection
    } else if (source === "friend" && friendId) {
      // Preselect friend
      this.activeTab = "friends";
      this.selectedFriendIds = [friendId];
      this.currentStep = 3; // Skip to expense form
    } else if (source === "friends") {
      // Open friends tab
      this.activeTab = "friends";
      this.currentStep = 1;
    } else {
      // Default: groups tab
      this.activeTab = "groups";
      this.currentStep = 1;
    }

    if (this.$store.state.group.groups.length === 0) {
      this.fetchGroupsWithBalances("GROUP");
    }
    if (this.$store.state.friends.friends.length === 0) {
      this.loadFriends();
    }
  },
};
