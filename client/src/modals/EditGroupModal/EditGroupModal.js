import { mapActions, mapGetters } from "vuex";

export default {
  name: "EditGroupModal",
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      groupTitle: "",
      profilePhoto: null,
      previewProfileUrl: null,
      isUploading: false,
      error: "",
      successMessage: "",
      group: null,
      isRemoved: false,
    };
  },
  computed: {
    ...mapGetters("group", ["getGroupById"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),

    profileUrl() {
      if (this.previewProfileUrl) {
        return this.previewProfileUrl;
      }

      if (!this.group?.profilePic) {
        return null;
      }

      return `${this.getCloudinaryBaseUrl}v${this.group.profilePicVersion}/${this.group.profilePic}`;
    },
  },
  methods: {
    ...mapActions("cloudinary", ["uploadGroupImage"]),
    ...mapActions("group", ["editGroupDetails"]),

    handlePhotoUpload(event) {
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
        this.previewProfileUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      this.profilePhoto = file;
      this.isRemoved = false;
      this.error = "";
    },

    removePhoto() {
      this.profilePhoto = null;
      this.previewProfileUrl = null;
      this.isRemoved = true;
      const photoInput = document.getElementById("editGroupPhotoInput");
      if (photoInput) {
        photoInput.value = "";
      }
    },

    async buildUpdatePayload() {
      const payload = { title: this.groupTitle.trim(), groupId: this.id };
      if (this.profilePhoto) {
        try {
          const { public_id, version } = await this.uploadGroupImage({
            file: this.profilePhoto,
            groupId: this.id,
          });
          payload.profilePic = public_id;
          payload.profilePicVersion = version.toString();
        } catch (err) {
          console.error("Error uploading image:", err);
          throw new Error("Failed to upload image. Please try again.");
        }
      }
      console.log(`PYLOAD: `, payload);
      return payload;
    },

    async handleSave() {
      if (!this.groupTitle.trim()) {
        this.error = "Group title cannot be empty";
        return;
      }

      if (this.groupTitle.trim().length < 3) {
        this.error = "Group title must be at least 3 characters";
        return;
      }

      try {
        this.isUploading = true;
        this.error = "";
        const payload = await this.buildUpdatePayload();
        await this.editGroupDetails(payload);
        this.previewProfileUrl = null;
        this.successMessage = "Group updated successfully!";
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      } catch (err) {
        console.error("Error updating group:", err);
        this.error = err.message || "Failed to update group. Please try again.";
      } finally {
        this.isUploading = false;
      }
    },

    closeModal() {
      this.$router.back();
    },
  },
  mounted() {
    this.group = this.getGroupById(this.id);
    if (this.group) {
      this.groupTitle = this.group.title;
    }
  },
};
