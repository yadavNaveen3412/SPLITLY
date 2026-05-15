import { getInitials } from "@/utils/stringHelpers";
import { mapActions, mapGetters } from "vuex";
import QRcodeVue from "qrcode.vue";
import { handleApolloError } from "@/utils/errorHandler";
import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";
import { useToast } from "vue-toastification";

const toast = useToast();

const BASE_URL = process.env.VUE_APP_BASE_URL;

export default {
  name: "ProfilePage",

  components: { QRcodeVue, ErrorWrapper },

  data() {
    return {
      profileData: {
        name: "",
        email: "",
        contact: "",
        profilePic: "",
        profilePicVersion: "",
        shareCode: "",
        createdAt: "",
      },
      originalData: {},
      previewProfileUrl: null,
      isEditing: {
        name: false,
        contact: false,
      },
      loadingText: "Updating profile...",
      errors: {
        name: "",
        contact: "",
      },
      generalError: "",
      saving: false,
      photoFile: null,
      codeCopied: false,
      friendShareCode: "",
    };
  },

  computed: {
    ...mapGetters("auth", ["getUser"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),
    user() {
      return this.getUser;
    },

    hasChanges() {
      return (
        this.profileData.name?.trim() !== this.originalData.name?.trim() ||
        this.profileData.contact?.trim() !==
          this.originalData.contact?.trim() ||
        this.photoFile !== null
      );
    },

    formattedCreatedAt() {
      if (!this.profileData.createdAt) return null;
      return new Date(parseInt(this.profileData.createdAt)).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
    },

    profileUrl() {
      if (this.previewProfileUrl) {
        return this.previewProfileUrl;
      }

      if (!this.profileData.profilePic) {
        return null;
      }

      return `${this.getCloudinaryBaseUrl}v${this.profileData.profilePicVersion}/${this.profileData.profilePic}`;
    },

    shareUrl() {
      return `${BASE_URL}/add-friend/${this.profileData.shareCode}`;
    },
  },

  methods: {
    ...mapActions("auth", ["updateUserProfile"]),
    ...mapActions("cloudinary", ["uploadUserAvatar"]),

    getInitials,

    loadProfileData() {
      if (!this.user) return;

      const {
        name = "",
        email = "",
        contact = "",
        profilePic = "",
        profilePicVersion = "",
        shareCode = "",
        createdAt = new Date().toISOString(),
      } = this.user;

      this.profileData = {
        name,
        email,
        contact,
        profilePic,
        profilePicVersion,
        shareCode,
        createdAt,
      };
      this.originalData = { ...this.profileData };
    },

    resetChanges() {
      this.profileData = { ...this.originalData };
      this.photoFile = null;
      this.previewProfileUrl = null;
      this.isEditing = { name: false, contact: false };
      this.errors = { name: "", contact: "" };
      this.generalError = "";
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },

    enableEdit(field) {
      this.isEditing[field] = true;
      this.$nextTick(() => {
        const inputType = field === "contact" ? "tel" : "text";
        const input = this.$el.querySelector(`input[type="${inputType}"]`);
        if (input && !input.disabled) input.focus();
      });
    },

    validateField(field) {
      this.errors[field] = "";

      if (field === "name") {
        const value = this.profileData.name?.trim();
        if (!value) {
          this.errors.name = "Name is required";
          return false;
        }
        if (value.length < 3 || value.length > 50) {
          this.generalError = "Name must be between 3 and 50 characters";
          return false;
        }
      }

      if (field === "contact" && this.profileData.contact?.trim()) {
        if (this.profileData.contact.length === 10) {
          this.profileData.contact = "+91" + this.profileData.contact;
        }
        const regex = /^\+91[6-9]\d{9}$/;
        if (!regex.test(this.profileData.contact)) {
          this.generalError = "Please enter a valid 10-digit contact number";
          return false;
        }
      }

      return true;
    },

    saveField(field) {
      if (this.validateField(field)) {
        this.isEditing[field] = false;
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handlePhotoChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.generalError = "";

      if (!file.type.startsWith("image/")) {
        this.generalError = "Please select an image file";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.generalError = "File size should not exceed 5MB";
        return;
      }

      this.photoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewProfileUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async buildUpdatePayload() {
      const payload = {};

      if (this.profileData.name?.trim() !== this.originalData.name?.trim()) {
        payload.name = this.profileData.name?.trim();
      }

      if (
        this.profileData.contact?.trim() !== this.originalData.contact?.trim()
      ) {
        payload.contact = this.profileData.contact?.trim();
      }

      if (this.photoFile) {
        const { public_id, version } = await this.uploadUserAvatar(
          this.photoFile,
        );
        payload.profilePic = public_id;
        payload.profilePicVersion = version.toString();
      }

      return payload;
    },

    async saveProfile() {
      if (!this.hasChanges) return;

      if (!this.validateField("name") || !this.validateField("contact")) {
        return;
      }

      this.saving = true;
      this.generalError = "";

      try {
        const payload = await this.buildUpdatePayload();
        if (!Object.keys(payload).length) return;

        this.loadingText = "Saving Changes...";
        await this.updateUserProfile(payload);

        toast.success("Profile updated successfully");

        this.previewProfileUrl = null;
        this.loadProfileData();
        this.photoFile = null;
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.generalError = gqlError.message;
        }
      } finally {
        this.saving = false;
      }
    },

    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.profileData.shareCode);
        this.codeCopied = true;
        setTimeout(() => (this.codeCopied = false), 2000);
      } catch (error) {
        console.error("Failed to copy code:", error);
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    confirmDeleteAccount() {
      // if (
      //   confirm(
      //     "Are you sure you want to delete your account? This action cannot be undone.",
      //   )
      // ) {
      alert("Feature not available yet");
      // }
    },

    openAddFriendModal() {
      const code = this.friendShareCode.trim();
      this.generalError = "";

      if (!code) {
        this.generalError = "Please enter a friend's share code";
        return;
      }

      this.$router.push({
        name: "Profile-AddFriend",
        query: { type: "shareCode", value: code },
      });
      this.friendShareCode = "";
    },
  },

  async mounted() {
    this.loadProfileData();
  },

  watch: {
    profileData: {
      handler(newval, oldval) {
        if (newval === oldval) {
          this.generalError = "";
        }
      },
      deep: true,
    },
  },
};
