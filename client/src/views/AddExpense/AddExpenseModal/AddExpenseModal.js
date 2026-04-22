import SelectionList from "../SelectionList/SelectionList.vue";
import MemberSelection from "../MemberSelection/MemberSelection.vue";
import ExpenseForm from "../ExpenseForm/ExpenseForm.vue";
import { mapActions, mapGetters } from "vuex";
import { createExpense } from "@/services/expenses.service";

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
    ...mapActions("group", ["fetchGroups", "getNonGroupId", "getPersonalGroupId"]),
    ...mapActions("friends", ["loadFriends"]),
    initialize() {
      this.currentStep = 1;
      this.selectedGroupId = null;
      this.selectedFriendIds = [];
      this.selectedMembers = [];
      this.activeTab = "groups";
      this.fetchGroups("GROUP");
      this.loadFriends();
    },

    goToNextStep() {
      if (this.currentStep === 1 && this.activeTab === "groups") {
        this.currentStep = 2;
      } else {
        this.currentStep = 3;
      }
    },

    goToPreviousStep() {
      if (this.currentStep === 3 && this.activeTab === "groups") {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
    },

    closeModal() {
      this.$router.back();
    },

    handleAddNew() {
      if (this.activeTab === "friends") {
        this.$router.push({ name: "AddFriend" });
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

      if (this.selectedGroupId) {
        this.expenseData.groupId = this.selectedGroupId;
      } else if (
        this.selectedFriendIds &&
        this.selectedFriendIds.length === 1
      ) {
        this.expenseData.groupId = await this.getPersonalGroupId(
          this.selectedFriendIds[0],
        );
      } else {
        this.expenseData.groupId = await this.getNonGroupId([
          ...this.selectedFriendIds,
          this.currentUser.id,
        ]);
      }

      console.log("Expense Data:", this.expenseData);

      await createExpense(JSON.parse(JSON.stringify(this.expenseData)));

      this.closeModal();
    },
  },

  watch: {
    isOpen(val) {
      if (val) this.initialize();
    },

    activeTab() {
      this.selectedGroupId = null;
      this.selectedFriendIds = [];
      this.selectedMembers = [];
    },
  },

  mounted() {
    this.initialize();
    document.body.style.overflow = "hidden";

    const { source, groupId, friendId } = this.$route.query;

    if (source === "group" && groupId) {
      // Preselect group
      this.selectedGroupId = groupId;
      this.currentStep = 2; // Skip to member selection
      this.activeTab = "groups";
    } else if (source === "friend" && friendId) {
      // Preselect friend
      this.selectedFriendIds = [friendId];
      this.currentStep = 3; // Skip to expense form
      this.activeTab = "friends";
    } else if (source === "friends") {
      // Open friends tab
      this.activeTab = "friends";
      this.currentStep = 1;
    } else {
      // Default: groups tab
      this.activeTab = "groups";
      this.currentStep = 1;
    }
  },

  created() {
    const { source, groupId, friendId } = this.$route.query;

    if (source === "group" && groupId) {
      // Preselect group
      this.selectedGroupId = groupId;
      this.currentStep = 2; // Skip to member selection
      this.activeTab = "groups";
    } else if (source === "friend" && friendId) {
      // Preselect friend
      this.selectedFriendIds = [friendId];
      this.currentStep = 3; // Skip to expense form
      this.activeTab = "friends";
    } else if (source === "friends") {
      // Open friends tab
      this.activeTab = "friends";
      this.currentStep = 1;
    } else {
      // Default: groups tab
      this.activeTab = "groups";
      this.currentStep = 1;
    }
  },
};
