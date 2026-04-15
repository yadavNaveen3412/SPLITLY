import { mapGetters, mapActions } from "vuex";
import * as bootstrap from "bootstrap";
import { calculateUserBalanceList } from "@/utils/settlements";
import { getInitials } from "@/utils/stringHelpers";

export default {
  name: "AllGroups",
  computed: {
    ...mapGetters("group", ["getGroups", "isLoading"]),
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
    groups() {
      return this.getGroups;
    },
    hasChatPanel() {
      return !!this.$route.params.id;
    },
  },
  data() {
    return {
      newGroupTitle: "",
      modalInstance: null,
      localGroups: [],
    };
  },
  methods: {
    ...mapActions("group", ["fetchGroups", "createGroup"]),
    getInitials,
    openModal() {
      const modalEl = document.getElementById("createGroupModal");
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    },

    closeModal() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }

      this.newGroupTitle = "";
    },
    async handleCreateGroup() {
      if (!this.newGroupTitle.trim()) {
        alert("Please enter a valid group name.");

        return;
      }
      await this.createGroup({ title: this.newGroupTitle, type: "GROUP" });
      this.closeModal();
    },
    goToGroup(id) {
      this.$router.push({ name: "GroupChats", params: { id } });
    },
    goBack() {
      this.$router.push({ name: "Home" });
    },
    async allGroupsWithBalances() {
      if (!this.groups || !this.groups.length) return;

      this.localGroups = await Promise.all(
        this.groups.map(async (group) => {
          const transactions = await calculateUserBalanceList(
            this.user.id,
            group.id,
          );

          let netBalance = 0;
          transactions.forEach((t) => {
            if (t.type === "owed") netBalance += t.amount;
            if (t.type === "owe") netBalance -= t.amount;
          });

          return {
            ...group,
            netBalance,
          };
        }),
      );
    },
  },
  watch: {
    groups: {
      immediate: true,
      async handler(newGroups) {
        if (!newGroups || !newGroups.length) {
          this.localGroups = [];
          return;
        }
        await this.allGroupsWithBalances();
      },
    },
  },

  async created() {
    await this.fetchGroups("GROUP");
    await this.allGroupsWithBalances();
  },
};
