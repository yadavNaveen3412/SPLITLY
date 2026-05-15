import { getInitials } from "@/utils/stringHelpers";
import { mapActions, mapGetters } from "vuex";
import { handleApolloError } from "@/utils/errorHandler";
import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";
import { useToast } from "vue-toastification";

const toast = useToast();

export default {
  name: "AddFriendModal",
  components: {
    ErrorWrapper,
  },

  emits: ["close", "friend-added"],

  data() {
    return {
      searchType: "email",
      searchQuery: "",
      searchResult: null,
      errorMessage: "",
      searching: false,
      adding: false,
      isOpen: true,
      isFriend: false,
    };
  },

  computed: {
    ...mapGetters("auth", ["getUser"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),
    ...mapGetters("friends", ["checkFriendById"]),

    currentUser() {
      return this.getUser;
    },

    getInputIcon() {
      const icons = {
        email: "fa-solid fa-envelope",
        contact: "fa-solid fa-phone",
        shareCode: "fa-solid fa-qrcode",
      };
      return icons[this.searchType];
    },

    getInputType() {
      const types = {
        email: "email",
        contact: "tel",
        shareCode: "text",
      };
      return types[this.searchType];
    },

    getPlaceholder() {
      const placeholders = {
        email: "Enter email address",
        contact: "Enter 10-digit phone number",
        shareCode: "Enter the 17-character share code",
      };
      return placeholders[this.searchType];
    },

    getMaxLength() {
      const maxLengths = {
        email: null,
        contact: 10,
        shareCode: 17,
      };
      return maxLengths[this.searchType];
    },
  },

  methods: {
    ...mapActions("friends", ["createFriend", "loadFriends"]),
    ...mapActions("auth", ["findUser"]),

    getInitials,

    getProfileUrl(user) {
      if (!user.profilePic) return null;
      return `${this.getCloudinaryBaseUrl}v${user.profilePicVersion}/${user.profilePic}`;
    },

    changeSearchType(type) {
      this.searchType = type;
      this.searchQuery = "";
      this.errorMessage = "";
      this.searchResult = null;
    },
    validateInput() {
      const query = this.searchQuery.trim();

      if (!query) {
        this.errorMessage = "Please enter a search value";
        return false;
      }

      // Validate Email
      if (this.searchType === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(query)) {
          this.errorMessage = "Please enter a valid email address";
          return false;
        }

        if (query.toLowerCase() === this.currentUser?.email?.toLowerCase()) {
          this.errorMessage = "You cannot add yourself as a friend";
          return false;
        }
      }

      // Validate Contact
      if (this.searchType === "contact") {
        const contactRegex = /^[6-9]\d{9}$/;
        if (!contactRegex.test(query)) {
          this.errorMessage =
            "Please enter a valid 10-digit phone number starting with 6-9";
          return false;
        }

        if (query === this.currentUser?.contact) {
          this.errorMessage = "You cannot add yourself as a friend";
          return false;
        }
      }

      // Validate Share Code
      if (this.searchType === "shareCode") {
        const shareCodeRegex = /^SPLIT-[A-Z]{3}-[0-9]{5}-[A-Z]{1}$/;
        if (!shareCodeRegex.test(query.toUpperCase())) {
          this.errorMessage = "Invalid share code";
          return false;
        }

        if (
          query.toUpperCase() === this.currentUser?.shareCode?.toUpperCase()
        ) {
          this.errorMessage = "You cannot add yourself as a friend";
          return false;
        }
      }

      return true;
    },

    async handleSearch() {
      if (!this.validateInput()) return;

      this.searching = true;
      this.errorMessage = "";

      try {
        let response;
        if (this.searchType === "email") {
          response = await this.findUser({ email: this.searchQuery });
        } else if (this.searchType === "contact") {
          response = await this.findUser({ contact: this.searchQuery });
        } else if (this.searchType === "shareCode") {
          response = await this.findUser({
            shareCode: this.searchQuery.toUpperCase(),
          });
        }

        if (!response) {
          this.searchQuery = "";
          this.errorMessage = "User not found";
          setTimeout(() => {
            // this.searchQuery = "";
            this.errorMessage = "";
          }, 3000);
          return;
        }

        this.isFriend = this.checkFriendById(response.id);

        this.searchResult = response;
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.errorMessage = gqlError.message;
        }
        this.searchResult = null;
      } finally {
        this.searching = false;
      }
    },

    searchAnother() {
      this.searchResult = null;
      this.searchQuery = "";
      this.errorMessage = "";
      this.isFriend = false;
    },

    async addFriend() {
      if (!this.searchResult) return;

      this.adding = true;
      this.errorMessage = "";

      try {
        const groupId = await this.createFriend(this.searchResult.id);
        if (groupId) {
          this.isFriend = true;
          toast.success("Friend added successfully");
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        } else {
          this.errorMessage = "Failed to add friend";
        }
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.errorMessage = gqlError.message;
        }
      } finally {
        this.adding = false;
      }
    },

    addExpense(id) {
      this.$router.push({
        name: "AddExpense",
        query: { source: "friend", friendId: id },
      });
    },

    closeModal() {
      this.$router.back();
    },
  },

  async created() {
    const { type, value } = this.$route.query;

    if (type === "shareCode" && value) {
      this.searchType = type;
      this.searchQuery = value;
      await this.handleSearch();
    }

    if (this.$store.state.friends.friends.length === 0) {
      await this.loadFriends();
    }
  },
};
