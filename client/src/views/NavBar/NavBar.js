import { mapActions, mapGetters } from "vuex";
import { sidebarState } from "@/store/sidebarStore";

export default {
  name: "NavBar",

  data() {
    return {
      menuOpen: false,
    };
  },

  computed: {
    ...mapGetters("auth", ["isLoggedIn", "getUser"]),
    ...mapGetters("cloudinary", ["getCloudinaryBaseUrl"]),
    user() {
      return this.getUser;
    },
    userName() {
      return this.user?.name ?? "";
    },
    userEmail() {
      return this.user?.email ?? "";
    },
    initials() {
      if (!this.user?.name) return "?";
      return this.user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    },
    userProfileUrl() {
      if (this.user?.profilePic) {
        return `${this.getCloudinaryBaseUrl}v${this.user.profilePicVersion}/${this.user.profilePic}`;
      }
      return null;
    },
    isCollapsed() {
      return sidebarState.isCollapsed;
    },
  },

  methods: {
    ...mapActions("auth", ["logout"]),

    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
    async handleLogout() {
      this.closeMenu();
      try {
        await this.logout();
        this.$router.push({ name: "Register" });
      } catch (err) {
        console.error("Logout failed", err);
      }
    },
    handleOutsideClick(e) {
      if (this.$refs.menuRef && !this.$refs.menuRef.contains(e.target)) {
        this.menuOpen = false;
      }
    },
  },

  mounted() {
    document.addEventListener("mousedown", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleOutsideClick);
  },
};
