import { mapGetters, mapActions } from "vuex";
import ConfirmSettlement from "../ConfirmSettlement/ConfirmSettlement.vue";
import { calculateNetWithFriend, userFriendBalance } from "@/utils/settlements";
import { getUserById } from "@/services/user.service";

export default {
  name: "PersonalFriendSettlement",
  props: ["friendId"],

  components: {
    ConfirmSettlement,
  },
  data() {
    return {
      showConfirmModal: false,
      selectedUserItem: {},
      friendTransaction: [],
      friendName: "",
      net: 0,
      group: {},
    };
  },
  computed: {
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
    overallSettlementItem() {
      if (!this.friendName) return null;
      if (this.net < 0) {
        return {
          text: `Overall, you owe ${this.friendName} ₹${Math.abs(
            this.net
          ).toFixed(2)}`,
          class: "text-danger",
        };
      } else if (this.net > 0) {
        return {
          text: `Overall, ${this.friendName} owes you ₹${Math.abs(
            this.net
          ).toFixed(2)}`,
          class: "text-success",
        };
      }
    },
  },
  methods: {
    ...mapActions("group", ["fetchGroupDetails"]),

    async getUserName() {
      const user = await getUserById(this.friendId);
      this.friendName = user.name;
    },

    async openConfirmationModal(item) {
      this.selectedUserItem = item;
      if (item.overall) {
        this.group = {};

        this.showConfirmModal = true;
        return;
      }

      this.group = await this.fetchGroupDetails(item.groupId);

      this.showConfirmModal = true;
    },
    closeConfirmationModal() {
      this.showConfirmModal = false;
      this.selectedUserItem = {};
    },
    handleSettlement(payload) {
      this.$emit("settlement", payload);
      this.$emit("close");
    },
  },
  async mounted() {
    await this.getUserName();
    this.friendTransaction = await userFriendBalance(
      this.user.id,
      this.friendId
    );
    this.net = await calculateNetWithFriend(this.user.id, this.friendId);
  },
};
