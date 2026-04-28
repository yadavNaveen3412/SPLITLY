import { getInitials } from "@/utils/stringHelpers";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "FriendsPage",

  data() {
    return {
      friendShareCode: "SPLIT-YAM-82470-C",
    };
  },

  computed: {
    ...mapGetters("friends", ["getFriends", "isLoading"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),
    friends() {
      return this.getFriends;
    },
    loading() {
      return this.isLoading;
    },
    selectedFriendId() {
      return this.$route.params.friendId
        ? parseInt(this.$route.params.friendId)
        : null;
    },
    hasChatPanel() {
      return !!this.$route.params.id;
    },
  },

  methods: {
    ...mapActions("friends", ["loadFriends"]),
    goToFriendChat(friendId) {
      this.$router.push({ name: "Chats", params: { id: friendId } });
    },
    goToAddExpense() {
      this.$router.push({ name: "AddExpense", query: { source: "friends" } });
    },
    getInitials,
    profileUrl(friend) {
      if (friend.profilePic) {
        return `${this.getCloudinaryBaseUrl}v${friend.profilePicVersion}/${friend.profilePic}`;
      }
    },

    openAddFriendModal() {
      this.$router.push({
        name: "AddFriend",
      });
    },
  },

  async created() {
    await this.loadFriends();
  },
};
