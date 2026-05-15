import { mapGetters, mapActions } from "vuex";
import GroupSettlement from "../Settlements/GroupSettlement/GroupSettlement.vue";
import { calculateUserBalanceList } from "@/utils/settlements";
import { groupService } from "@/services/groups.service";
import { getInitials } from "@/utils/stringHelpers";
import { handleApolloError } from "@/utils/errorHandler";
import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";

export default {
  name: "GroupDetails",
  components: { GroupSettlement, ErrorWrapper },
  props: ["id"],
  data() {
    return {
      userBalances: [],
      isShowSettleUpModal: false,
      error: "",
      isLoadingAction: false,
      selectedMembers: [],
      searchQuery: "",
      emailInput: "",
      isAddingMembers: false,
      memberSelectorError: "",
      memberSelectorSuccess: "",
    };
  },

  computed: {
    ...mapGetters("group", ["isLoading", "getGroupById"]),
    ...mapGetters("friends", ["getFriends"]),
    ...mapGetters("auth", ["getUser"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),

    user() {
      return this.getUser;
    },

    loading() {
      return this.isLoading;
    },

    group() {
      return this.getGroupById(this.groupId);
    },

    groupId() {
      return this.$route.params.id;
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

    profileUrl() {
      if (this.group?.profilePic) {
        return `${this.getCloudinaryBaseUrl}v${this.group.profilePicVersion}/${this.group.profilePic}`;
      }
    },

    // groupInitials() {
    //   if (!this.group?.title) return "?";
    //   return this.group.title
    //     .split(" ")
    //     .map((w) => w[0])
    //     .join("")
    //     .toUpperCase()
    //     .slice(0, 2);
    // },
  },

  methods: {
    ...mapActions("group", ["fetchGroupsWithBalances", "fetchGroupDetails"]),
    ...mapActions("settlements", ["getSettlementsByGroup"]),
    ...mapActions("friends", ["loadFriends"]),

    getInitials,

    getUserNamesById(userId) {
      if (!this.group?.members) return "Unknown";
      const member = this.group.members.find((m) => m.id === userId);
      return member ? member.name : "Unknown";
    },

    async fetchGroupDetail() {
      try {
        await this.fetchGroupDetails(this.groupId);
      } catch (error) {
        console.error("Error loading group:", error);
        this.$router.push({ name: "Groups" });
      }
    },

    async fetchAll() {
      await Promise.all([
        this.fetchGroupDetail(),
        this.getSettlementsByGroup(this.groupId),
      ]);

      this.userBalances = await calculateUserBalanceList(this.groupId);
    },

    goBack() {
      this.$router.back();
    },

    openEditGroupModal() {
      this.$router.push({
        name: "EditGroup",
        params: { id: this.groupId },
      });
    },

    openAddMembersModal() {
      // this.resetMemberSelector();
      this.$router.push({
        name: "AddGroupMembers",
        // params: { id: this.groupId },
      });
    },

    resetMemberSelector() {
      this.selectedMembers = [];
      this.searchQuery = "";
      this.emailInput = "";
      this.isAddingMembers = false;
      this.memberSelectorError = "";
      this.memberSelectorSuccess = "";
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    handleAddByEmail() {
      this.memberSelectorError = "";
      this.memberSelectorSuccess = "";

      if (!this.emailInput.trim()) {
        this.memberSelectorError = "Please enter an email address";
        return;
      }

      if (!this.isValidEmail(this.emailInput)) {
        this.memberSelectorError = "Please enter a valid email address";
        return;
      }

      if (
        this.selectedMembers.some(
          (m) => m.email === this.emailInput.toLowerCase(),
        )
      ) {
        this.memberSelectorError = "This email is already selected";
        this.emailInput = "";
        return;
      }

      if (
        this.group?.members?.some(
          (m) => m.email === this.emailInput.toLowerCase(),
        )
      ) {
        this.memberSelectorError = "This member is already in the group";
        this.emailInput = "";
        return;
      }

      this.selectedMembers.push({
        id: `pending-${Date.now()}`,
        email: this.emailInput.toLowerCase(),
        name: this.emailInput,
        isPending: true,
      });

      this.memberSelectorSuccess = `${this.emailInput} will be invited to join`;
      this.emailInput = "";
      setTimeout(() => {
        this.memberSelectorSuccess = "";
      }, 2000);
    },

    handleAddFriend(friend) {
      const friendData = {
        id: friend.id || friend.friendId,
        email: friend.email,
        name: friend.name,
      };

      if (!this.selectedMembers.some((m) => m.id === friendData.id)) {
        this.selectedMembers.push(friendData);
      }
    },

    handleRemoveMember(memberId) {
      this.selectedMembers = this.selectedMembers.filter(
        (m) => m.id !== memberId,
      );
    },

    async handleSubmitMembers() {
      if (this.selectedMembers.length === 0) {
        this.memberSelectorError = "Please select at least one member to add";
        return;
      }

      try {
        this.isAddingMembers = true;
        this.memberSelectorError = "";

        // Extract member IDs (only existing members, not pending invites)
        const memberIds = this.selectedMembers
          .filter((m) => !m.isPending)
          .map((m) => m.id);

        if (memberIds.length > 0) {
          await groupService.addMemberToGroup(this.groupId, memberIds);
        }

        this.memberSelectorSuccess = "Members added successfully!";
        setTimeout(() => {
          this.closeMemberSelector();
        }, 1500);
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.memberSelectorError = gqlError.message;
        }
      } finally {
        this.isAddingMembers = false;
      }
    },

    closeMemberSelector() {
      this.resetMemberSelector();
      this.$router.back();
    },

    async leaveGroup() {
      // if (!confirm("Are you sure you want to leave this group?")) {
      //   return;
      // }

      alert("Feature not available yet");

      // try {
      //   this.isLoadingAction = true;
      //   this.error = "";

      //   // Call delete group (soft delete for current user)
      //   await groupService.deleteGroup(this.groupId);

      //   // Navigate back to groups
      //   this.$router.push({ name: "Groups" });
      // } catch (err) {
      //   console.error("Error leaving group:", err);
      //   this.error = err.message || "Failed to leave group";
      // } finally {
      //   this.isLoadingAction = false;
      // }
    },

    showSettleUpModal() {
      this.isShowSettleUpModal = true;
    },

    closeSettleUpModal() {
      this.isShowSettleUpModal = false;
    },

    async onSettlementSuccess() {
      this.isShowSettleUpModal = false;
      await this.fetchAll();
    },
  },

  async mounted() {
    if (this.$store.state.group.groups.length === 0) {
      await this.fetchGroupsWithBalances("GROUP");
    }

    if (this.$store.state.friends.friends.length === 0) {
      await this.loadFriends();
    }

    await this.fetchAll();
  },

  watch: {
    groupId(newId) {
      if (newId) this.fetchAll();
    },
    emailInput() {
      this.memberSelectorError = "";
    },
  },
};
