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
    ...mapGetters("friends", ["getFriends"]),
    ...mapGetters("group", ["getGroups"]),
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
    friendsData: {
      async handler(newVal) {
        if (newVal?.length && this.id) {
          await this.loadFriendData();
          await this.calculateNet();
        }
      },
      deep: true,
    },
    id: {
      immediate: true,
      async handler() {
        if (this.id) {
          await this.loadFriendData();
          await this.loadGroupData();
          await this.calculateNet();
        }
      },
    },
    groupsData: {
      async handler(newVal) {
        if (newVal?.length && this.id) {
          await this.loadGroupData();
        }
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions("chats", ["loadChats"]),

    goToDetails() {
      if (this.group) {
        this.$router.push({ name: "Group", params: { id: this.id } });
      }
    },

    loadFriendData() {
      this.setLoading(true);
      try {
        const friend = this.friendsData.find((f) => f.id === this.id);
        this.friend = friend ? { ...friend } : null;
      } catch (error) {
        console.error("Error loading friend data:", error);
      } finally {
        this.setLoading(false);
      }
    },

    loadGroupData() {
      this.setLoading(true);
      try {
        const group = this.groupsData.find((g) => g.id === this.id);
        this.group = group ? { ...group } : null;
      } catch (error) {
        console.error("Error loading group data:", error);
      } finally {
        this.setLoading(false);
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

    profileUrl(friend) {
      if (friend.profilePic) {
        return `${this.getCloudinaryBaseUrl}v${friend.profilePicVersion}/${friend.profilePic}`;
      }
    },
  },
};
