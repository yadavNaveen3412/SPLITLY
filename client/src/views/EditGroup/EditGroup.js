import { mapGetters, mapActions } from "vuex";

export default {
  name: "EditGroup",

  computed: {
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
    groupId() {
      return this.$route.params.id;
    },
    canDeleteGroup() {
      return this.user && this.group && this.group.createdById === this.user.id;
    },
  },
  data() {
    return {
      group: {},
      newGroupName: "",
      errorMessage: "",
    };
  },

  methods: {
    ...mapActions("group", ["fetchGroupDetails", "renameGroup", "deleteGroup"]),

    async handleFetchGroupDetails() {
      try {
        this.group = await this.fetchGroupDetails(this.groupId);
      } catch (e) {
        console.log("error in fetching group details in edit page", e);
      }
    },
    async handleRenameGroup() {
      if (!this.newGroupName || this.newGroupName.length < 3 || this.newGroupName.length > 50) {
        this.errorMessage = "Group name must be between 3 and 50 characters.";
        return;
      }
      try {
        this.group = await this.renameGroup({
          groupId: this.groupId,
          title: this.newGroupName,
        });
        alert("Group name changed successfully");
        this.newGroupName = "";
      } catch (e) {
        console.log("error in renaming group", e);
      }
    },
    async handleDeleteGroupAction() {
      try {
        const success = await this.deleteGroup({
          groupId: this.groupId,
          type: this.group.type,
        });

        if (success) {
          alert("Group deleted");
          this.$router.push({ name: "Groups" });
        }
      } catch (e) {
        console.log("error in deleteing group", e);
      }
    },
    handleLeaveGroup() {
      alert(
        "will Implement. can only leave after all expenses paid. make next person admin",
      );
    },
    goBack() {
      this.$router.push(`/group/${this.groupId}`);
    },
  },
  async mounted() {
    await this.fetchGroupDetails();
  },
};
