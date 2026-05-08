import { mapGetters } from "vuex";
import ConfirmSettlement from "../ConfirmSettlement/ConfirmSettlement.vue";

export default {
  name: "GroupSettlement",
  props: {
    group: Object,
    userBalances: Array,
  },
  components: {
    ConfirmSettlement,
  },
  data() {
    return { showConfirmModal: false, selectedUserItem: {} };
  },
  computed: {
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
  },
  methods: {
    getUserName(id) {
      const user = this.group.members.find((p) => p.id === id);
      return user.name;
    },
    openConfirmationModal(item) {
      this.showConfirmModal = true;
      this.selectedUserItem = item;
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
  mounted() {},
};
