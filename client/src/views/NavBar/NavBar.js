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

    getAddExpenseRoute() {
      const currentPath = this.$route.path;
      const currentName = this.$route.name;

      // Check if we're in a chat context
      if (currentPath.includes("/chats/")) {
        const id = this.$route.params.id;
        if (currentPath.includes("/friends/")) {
          // Friend chat
          return {
            name: "AddExpense",
            query: { source: "friend", friendId: id },
          };
        } else if (currentPath.includes("/groups/")) {
          // Group chat
          return {
            name: "AddExpense",
            query: { source: "group", groupId: id },
          };
        }
      }

      // Check page context
      if (currentName === "Friends") {
        return { name: "AddExpense", query: { source: "friends" } };
      } else if (currentName === "Groups") {
        return { name: "AddExpense", query: { source: "groups" } };
      }

      // Default: Home or no special context
      return { name: "AddExpense" };
    },

    goToAddExpense() {
      const route = this.getAddExpenseRoute();
      this.$router.push(route);
    },

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
      } catch (error) {
        console.error("Logout failed", error);
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
