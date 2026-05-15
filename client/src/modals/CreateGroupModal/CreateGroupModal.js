import { mapActions, mapGetters } from "vuex";
import { handleApolloError } from "@/utils/errorHandler";
import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";
import { useToast } from "vue-toastification";

const toast = useToast();

export default {
  name: "CreateGroupModal",
  components: {
    ErrorWrapper,
  },
  data() {
    return {
      groupTitle: "",
      selectedMembers: [],
      profilePhoto: null,
      profilePhotoPreview: null,
      isUploading: false,
      error: "",
      searchQuery: "",
      emailInput: "",
      isAddingMembers: false,
      memberSelectorError: "",
      memberSelectorSuccess: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["getUser"]),
    ...mapGetters("friends", ["getFriends"]),
    canCreate() {
      return (
        this.groupTitle.trim().length >= 3 && this.selectedMembers.length > 0
      );
    },
    memberCount() {
      return this.selectedMembers.length;
    },
  },
  methods: {
    ...mapActions("group", ["createGroup", "fetchGroupsWithBalances"]),
    ...mapActions("friends", ["loadFriends"]),
    ...mapActions("cloudinary", ["uploadAvatar"]),

    closeModal() {
      // Reset form
      this.groupTitle = "";
      this.selectedMembers = [];
      this.profilePhoto = null;
      this.profilePhotoPreview = null;
      this.error = "";
      this.$router.back();
    },

    // Handle photo upload
    async handlePhotoUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        this.error = "Please upload an image file";
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = "Image size must be less than 5MB";
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.profilePhoto = file;
      this.error = "";
    },

    // Remove photo
    removePhoto() {
      this.profilePhoto = null;
      this.profilePhotoPreview = null;
      const photoInput = this.$refs.photoInput;
      if (photoInput) {
        photoInput.value = "";
      }
    },

    // Open add members modal via routing
    openAddMembersModal() {
      // this.resetMemberSelector();
      this.$router.push({
        name: "CreateGroupAddMembers",
      });
    },

    resetMemberSelector() {
      this.selectedMembers = [];
      this.searchQuery = "";
      this.emailInput = "";
      this.isAddingMembers = false;
      this.memberSelectorError = "";
      this.memberSelectorSuccess = "";
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    handleAddByEmail() {
      this.memberSelectorError = "";
      this.memberSelectorSuccess = "";

      if (!this.emailInput.trim()) {
        this.memberSelectorError = "Please enter an email address";
        return;
      }

      if (!this.isValidEmail(this.emailInput)) {
        this.memberSelectorError = "Please enter a valid email address";
        return;
      }

      if (
        this.selectedMembers.some(
          (m) => m.email === this.emailInput.toLowerCase(),
        )
      ) {
        this.memberSelectorError = "This email is already selected";
        this.emailInput = "";
        return;
      }

      this.selectedMembers.push({
        id: `pending-${Date.now()}`,
        email: this.emailInput.toLowerCase(),
        name: this.emailInput,
        isPending: true,
      });

      this.memberSelectorSuccess = `${this.emailInput} will be invited to join`;
      this.emailInput = "";
      this.memberSelectorSuccess = "";
    },

    handleAddFriend(friend) {
      const friendData = {
        id: friend.id || friend.friendId,
        email: friend.email,
        name: friend.name,
      };

      if (!this.selectedMembers.some((m) => m.id === friendData.id)) {
        this.selectedMembers.push(friendData);
      }
    },

    handleRemoveMember(memberId) {
      this.selectedMembers = this.selectedMembers.filter(
        (m) => m.id !== memberId,
      );
    },

    handleSubmitMembers() {
      this.closeMemberSelector();
    },

    closeMemberSelector() {
      this.$router.back();
    },

    async handleCreate() {
      if (!this.canCreate) return;
      const payload = {};
      payload.title = this.groupTitle;
      payload.type = "GROUP";
      payload.members = this.selectedMembers.map((m) => m.id);

      try {
        this.isUploading = true;
        this.error = "";

        if (this.profilePhoto) {
          const { public_id, version } = await this.uploadAvatar(
            this.profilePhoto,
          );
          payload.profilePic = public_id;
          payload.profilePicVersion = version.toString();
        }

        await this.createGroup({
          title: payload.title,
          type: payload.type,
          profilePic: payload.profilePic,
          profilePicVersion: payload.profilePicVersion,
          members: payload.members,
        });

        toast.success("Group created successfully");
        this.closeModal();
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.error = gqlError.message;
        }
      } finally {
        this.isUploading = false;
      }
    },
  },
  watch: {
    groupTitle() {
      this.error = "";
    },
    emailInput() {
      this.memberSelectorError = "";
    },
  },
  async created() {
    if (!this.getFriends || this.getFriends.length === 0) {
      await this.loadFriends();
    }
  },
  mounted() {
    document.body.style.overflow = "hidden";
  },
  unmounted() {
    document.body.style.overflow = "auto";
    // Reset form on unmount
    this.groupTitle = "";
    this.selectedMembers = [];
    this.profilePhoto = null;
    this.profilePhotoPreview = null;
    this.error = "";
  },
};
