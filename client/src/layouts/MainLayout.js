import NavBar from "@/views/NavBar/NavBar.vue";
import SideBar from "../views/SideBar/SideBar.vue";
import { sidebarState } from "@/store/sidebarStore.js";

export default {
  name: "MainLayout",
  components: {
    SideBar,
    NavBar,
  },

  data() {
    return {
      sidebarState,
    };
  },
  computed: {
    hasChatPanel() {
      const chatRoutes = ["Chats", "GroupChats"];
      return chatRoutes.includes(this.$route.name);
    },
  },
};
