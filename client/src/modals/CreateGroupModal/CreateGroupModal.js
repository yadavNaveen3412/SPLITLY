import BaseSelectionList from "@/components/ui/BaseSelectionList/BaseSelectionList.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "CreateGroupModal",
  components: {
    BaseSelectionList,
  },
  data() {
    return {
      groupTitle: "",
      inviteEmail: "",
      selectedFriendIds: [],
      invitedEmails: [], // For members added via email
    };
  },
  computed: {
    ...mapGetters("friends", ["getFriends"]),
    allAvailableFriends() {
      // Combine friends from store with any temporary email-invited members
      // For now, just show friends
      return this.getFriends;
    },
    canCreate() {
      return this.groupTitle.trim().length >= 3;
    },
  },
  methods: {
    ...mapActions("friends", ["loadFriends"]),
    ...mapActions("group", ["createGroup", "fetchGroupsWithBalances"]),

    closeModal() {
      this.$router.back();
    },

    addEmailMember() {
      if (!this.isValidEmail(this.inviteEmail)) return;
      // console.log("Inviting email:", this.inviteEmail);
      this.invitedEmails.push(this.inviteEmail);
      this.inviteEmail = "";
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    async handleCreate() {
      if (!this.canCreate) return;

      try {
        console.log("Creating group with members:", this.groupTitle);
        await this.createGroup({
          title: this.groupTitle,
          type: "GROUP",
          members: [...this.selectedFriendIds, ...this.invitedEmails],
        });

        this.closeModal();
      } catch (err) {
        console.error("Failed to create group", err);
      }
    },

    // Placeholder function as requested
    async addMembersToGroup(payload) {
      console.log("Placeholder: addMembersToGroup", payload);
    },
  },
  mounted() {
    this.loadFriends();
    document.body.style.overflow = "hidden";
  },
  unmounted() {
    document.body.style.overflow = "auto";
  },
};
