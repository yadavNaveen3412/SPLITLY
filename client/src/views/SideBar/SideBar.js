import { sidebarState, toggleSidebar } from "@/store/sidebarStore.js";
import { mapGetters } from "vuex";

export default {
  name: "SideBar",
  computed: {
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
  },

  data() {
    return {
      activeItem: "",
      sidebarState,
    };
  },

  watch: {
    $route(to) {
      this.updateActiveItem(to.path);
    },
  },

  mounted() {
    this.updateActiveItem(this.$route.path);
  },

  methods: {
    toggleSidebar,
    setActive(val) {
      this.activeItem = val;
    },
    updateActiveItem(path) {
      if (path.includes("/home")) {
        this.setActive("Home");
      } else if (path.includes("/friends")) {
        this.setActive("Friends");
      } else if (path.includes("/groups")) {
        this.setActive("Groups");
      } else {
        this.setActive("");
      }
    },
  },
};
