import { mapGetters, mapActions } from "vuex";
import { getInitials } from "@/utils/stringHelpers";
import BaseHeader from "@/components/layout/BaseHeader/BaseHeader.vue";
import BaseButton from "@/components/ui/BaseButton/BaseButton.vue";
import BaseList from "@/components/layout/BaseList/BaseList.vue";
import GroupListItem from "@/components/features/GroupListItem/GroupListItem.vue";
import { handleApolloError } from "@/utils/errorHandler";

export default {
  name: "GroupsPage",
  components: {
    BaseHeader,
    BaseButton,
    BaseList,
    GroupListItem,
  },
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
    async $route(to) {
      if (to.name === "Groups") {
        try {
          await this.fetchGroupsWithBalances("GROUP");
        } catch (error) {
          handleApolloError(error);
        }
      }
    },
  },

  async created() {
    try {
      if (!this.groups || this.groups.length === 0) {
        await this.fetchGroupsWithBalances("GROUP");
      }
    } catch (error) {
      handleApolloError(error);
    }
  },
};
