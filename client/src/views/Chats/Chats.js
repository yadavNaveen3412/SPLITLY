import { mapActions, mapGetters } from "vuex";
import ChatTab from "./ChatTab/ChatTab.vue";
import ExpenseTab from "./ExpenseTab/ExpenseTab.vue";
import { getInitials } from "@/utils/stringHelpers";
import { calculateNetWithFriend } from "@/utils/settlements";

export default {
  name: "ChatsPage",

  components: {
    ChatTab,
    ExpenseTab,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      activeTab: "expenses",
      friend: null,
      loading: false,
      group: null,
      net: 0,
      loadingNet: false,
    };
  },

  computed: {
    ...mapGetters("friends", ["getFriends", "getFriendById"]),
    ...mapGetters("group", ["getGroups", "getGroupById"]),
    ...mapGetters("auth", ["getUser"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),
    user() {
      return this.getUser;
    },
    ...mapGetters("expenses", ["getTotal"]),
    friendsData() {
      return this.getFriends;
    },
    groupsData() {
      return this.getGroups;
    },
    total() {
      return this.getTotal;
    },

    currentPage() {
      return this.$route.path.includes("/groups") ? "groups" : "friends";
    },
  },

  watch: {
    id: {
      immediate: true,
      async handler() {
        if (this.id) {
          await this.loadCurrentResource();
        }
      },
    },
    friendsData: {
      async handler(newVal) {
        if (newVal?.length && this.currentPage === "friends") {
          this.loadFriendData();
          await this.calculateNet();
        }
      },
      deep: true,
    },
    groupsData: {
      async handler(newVal) {
        if (newVal?.length && this.currentPage === "groups") {
          this.loadGroupData();
          await this.calculateNet();
        }
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions("chats", ["loadChats"]),
    ...mapActions("friends", ["loadFriends"]),
    ...mapActions("group", ["fetchGroupsWithBalances"]),

    async loadCurrentResource() {
      this.setLoading(true);
      try {
        if (this.currentPage === "friends") {
          if (!this.friendsData.length) {
            await this.loadFriends();
          }
          this.loadFriendData();
        } else {
          if (!this.groupsData.length) {
            await this.fetchGroupsWithBalances("GROUP");
          }
          this.loadGroupData();
        }
        await this.calculateNet();
      } catch (error) {
        console.error("Error loading resource:", error);
      } finally {
        this.setLoading(false);
      }
    },

    loadFriendData() {
      const friend = this.getFriendById(this.id);
      this.friend = friend ? { ...friend } : null;
      if (this.friend) {
        this.group = null; // Ensure group is null if we are in friend chat
      }
    },

    loadGroupData() {
      const group = this.getGroupById(this.id);
      this.group = group ? { ...group } : null;
      if (this.group) {
        this.friend = null; // Ensure friend is null if we are in group chat
      }
    },

    setLoading(state) {
      this.loading = state;
    },

    closeDetail() {
      if (this.$route.path.includes("/friends")) {
        this.$router.push({ name: "Friends" });
      } else if (this.$route.path.includes("/groups")) {
        this.$router.push({ name: "Groups" });
      } else {
        this.$router.go(-1);
      }
    },

    getInitials,

    async calculateNet() {
      if (this.currentPage !== "friends" || !this.id || !this.user?.id) {
        return;
      }
      this.loadingNet = true;
      this.net = await calculateNetWithFriend(this.user.id, this.id);
      this.loadingNet = false;
    },

    profileUrl(entity) {
      if (entity.profilePic) {
        return `${this.getCloudinaryBaseUrl}v${entity.profilePicVersion}/${entity.profilePic}`;
      }
    },

    goToDetails() {
      if (this.group) {
        this.$router.push({ name: "Group", params: { id: this.id } });
      }
    },
  },
};
