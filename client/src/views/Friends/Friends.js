import { getInitials } from "@/utils/stringHelpers";
import { mapGetters, mapActions } from "vuex";
import BaseHeader from "@/components/layout/BaseHeader/BaseHeader.vue";
import BaseButton from "@/components/ui/BaseButton/BaseButton.vue";
import BaseList from "@/components/layout/BaseList/BaseList.vue";
import FriendListItem from "@/components/features/FriendListItem/FriendListItem.vue";
import { handleApolloError } from "@/utils/errorHandler";

export default {
  name: "FriendsPage",
  components: {
    BaseHeader,
    BaseButton,
    BaseList,
    FriendListItem,
  },

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
    try {
      if (this.friends.length === 0) {
        await this.loadFriends();
      }
    } catch (error) {
      handleApolloError(error);
    }
  },
};
