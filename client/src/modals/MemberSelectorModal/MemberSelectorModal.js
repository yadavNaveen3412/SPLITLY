import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";

export default {
  name: "MemberSelectorModal",
  components: {
    ErrorWrapper,
  },
  props: {
    friends: {
      type: Array,
      required: true,
      default: () => [],
    },
    selectedMembers: {
      type: Array,
      required: true,
      default: () => [],
    },
    excludeMembers: {
      type: Array,
      default: () => [],
    },
    currentUserId: {
      type: String,
      required: true,
    },
    searchQuery: {
      type: String,
      default: "",
    },
    emailInput: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: "",
    },
    successMessage: {
      type: String,
      default: "",
    },
  },
  computed: {
    filteredFriends() {
      return this.friends.filter((friend) => {
        const friendId = friend.id || friend.friendId;
        const isAlreadySelected = this.selectedMembers.some(
          (m) => m.id === friendId,
        );
        const isCurrentUser = friendId === this.currentUserId;
        const isExcluded = this.excludeMembers.some((m) => m.id === friendId);
        const matchesSearch =
          friend.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          friend.email?.toLowerCase().includes(this.searchQuery.toLowerCase());

        return (
          !isAlreadySelected && !isCurrentUser && !isExcluded && matchesSearch
        );
      });
    },
  },
};
