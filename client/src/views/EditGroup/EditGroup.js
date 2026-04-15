import { groupService } from "@/services/groups.service";
import { mapGetters } from "vuex";

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
    async fetchGroupDetails() {
      try {
        const { getGroupDetails } = await groupService.getGroupDetails(
          this.groupId,
        );
        this.group = getGroupDetails;
      } catch (e) {
        console.log("error in fetching group details in edit page", e);
      }
    },
    async renameGroup() {
      if (!this.newGroupName) {
        this.errorMessage = "Please enter a valid group name.";
        return;
      }
      try {
        const { renameGroup } = await groupService.renameGroup(
          this.groupId,
          this.newGroupName,
        );
        this.group = renameGroup;
        alert("Group name changed successfully");
        this.newGroupName = "";
      } catch (e) {
        console.log("error in renaming group", e);
      }
    },
    async handleDeleteGroup() {
      try {
        const { deleteGroup } = await groupService.deleteGroup(this.groupId);

        if (deleteGroup) {
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
