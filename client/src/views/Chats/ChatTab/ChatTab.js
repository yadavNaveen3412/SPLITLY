import { getFriendById } from "@/services/friends.service";
import { getUserById } from "@/services/user.service";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ChatTab",

  props: {
    id: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      required: true,
      validator: (value) => ["friends", "groups"].includes(value),
    },
  },

  data() {
    return {
      newMessage: "",
      isFriend: false,
      isCheckingFriend: false,
      userCache: {},
    };
  },

  computed: {
    ...mapGetters("chats", ["getChats"]),
    chats() {
      return this.getChats;
    },
    shouldShowMessageBar() {
      return this.isFriend;
    },
    shouldShowStartChatButton() {
      return !this.isFriend && !this.isCheckingFriend;
    },
    isGroupChat() {
      return this.page === "groups";
    },
  },

  watch: {
    chats: {
      async handler() {
        // Load sender names for group chats
        if (this.page === "groups") {
          await this.loadSenderNames();
        }

        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom({ smooth: true });
          }, 1);
        });
      },
      deep: true,
    },

    id: {
      immediate: true,
      async handler(newId) {
        this.userCache = {}; // Clear cache when switching chats
        await this.stopSubscription();
        if (this.page === "friends") await this.checkIfFriend();
        if (this.isFriend || this.page === "groups") {
          await this.loadChats({ id: newId, type: this.page });
          await this.subscribeToChats();
        }
      },
    },
  },

  methods: {
    ...mapActions("chats", [
      "loadChats",
      "sendChat",
      "subscribeToChats",
      "stopSubscription",
    ]),

    ...mapActions("friends", ["createFriend"]),

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      return `${hours % 12 || 12}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
    },

    async sendMessage() {
      const text = this.newMessage.trim();

      if (!text) return;

      if (text.length > 1000) {
        alert("Message must not exceed 1000 characters.");
        return;
      }
      const message = {
        id: this.id,
        chatMessage: this.newMessage,
        type: this.page,
      };

      await this.sendChat(message);
      this.newMessage = "";

      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToBottom({ smooth: true });
        }, 30);
      });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const bottomAnchor = this.$refs.bottomAnchor;
        if (bottomAnchor) {
          bottomAnchor.scrollIntoView({ behavior: "smooth" });
        }
      });
    },

    async handleStartChat() {
      try {
        await this.createFriend(this.id);
        await this.checkIfFriend();
        if (this.isFriend) {
          await this.loadChats({ id: this.id, type: this.page });
          await this.subscribeToChats();
        }
        console.log("Friend Created successfully");
      } catch (error) {
        console.log("Error creating friend", error);
      }
    },

    async checkIfFriend() {
      this.isCheckingFriend = true;
      try {
        const result = await getFriendById(this.id);
        if (!result) {
          this.isFriend = false;
        } else {
          this.isFriend = true;
        }
      } catch (error) {
        console.log("Error checking friend status:", error);
        this.isFriend = false;
      } finally {
        this.isCheckingFriend = false;
      }
    },

    async getSenderName(senderId) {
      if (this.userCache[senderId]) {
        return this.userCache[senderId];
      }

      try {
        const user = await getUserById(senderId);
        const userName = user?.name || "Unknown User";
        this.userCache[senderId] = userName;
        return userName;
      } catch (error) {
        console.error("Error fetching user:", error);
        return "Unknown User";
      }
    },

    async loadSenderNames() {
      if (this.page === "groups" && this.chats?.length) {
        const senderIds = [...new Set(this.chats.map((msg) => msg.senderId))];
        await Promise.all(senderIds.map((id) => this.getSenderName(id)));
      }
    },

    goToSender(id) {
      this.$router.push({ name: "Chats", params: { id } });
    },
  },

  async mounted() {
    if (this.page === "friends") await this.checkIfFriend();
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom({ instant: true });
      }, 30);
    });
  },

  beforeUnmount() {
    this.stopSubscription();
  },
};
