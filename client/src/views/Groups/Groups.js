import { mapGetters, mapActions } from "vuex";
import { getInitials } from "@/utils/stringHelpers";

export default {
  name: "GroupsPage",
  computed: {
    ...mapGetters("group", ["getGroups", "isLoading"]),
    groups() {
      return this.getGroups;
    },
    hasChatPanel() {
      return !!this.$route.params.id;
    },
  },
  methods: {
    ...mapActions("group", ["fetchGroupsWithBalances"]),
    getInitials,

    goToGroup(id) {
      this.$router.push({ name: "GroupChats", params: { id } });
    },
  },
  watch: {
    $route(to) {
      // Only refetch when coming BACK to groups page
      if (to.name === "GroupsPage") {
        this.fetchGroupsWithBalances("GROUP");
      }
    },
  },

  async created() {
    await this.fetchGroupsWithBalances("GROUP");
  },
};
