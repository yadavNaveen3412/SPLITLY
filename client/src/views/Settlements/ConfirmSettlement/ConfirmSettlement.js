import { mapActions, mapGetters } from "vuex";

export default {
  name: "ConfirmSettlement",
  props: {
    selectedUser: Object,
    group: Object,
  },
  data() {
    return {
      settlement: {},
    };
  },
  computed: {
    ...mapGetters("auth", ["getUser"]),
    user() {
      return this.getUser;
    },
    isOverall() {
      return this.selectedUser?.overall === true;
    },
  },
  methods: {
    ...mapActions("settlements", ["createSettlement"]),

    getUserName(id) {
      if (!this.group || !Array.isArray(this.group.members)) {
        return "";
      }

      const user = this.group.members.find((p) => p.user.id === id);
      return user?.user?.name || "";
    },
    async confirmSettlement() {
      if (this.isOverall) {
        await this.confirmOverallSettlement();
        this.$emit("close");
        return;
      }

      let payerId = "";
      let receiverId = "";
      if (this.selectedUser.type === "owed") {
        payerId = this.selectedUser.person;
        receiverId = this.user.id;
      } else {
        payerId = this.user.id;
        receiverId = this.selectedUser.person;
      }

      const input = {
        group_id: this.group.id,
        payer_id: payerId,
        receiver_id: receiverId,
        amount: Number(this.selectedUser.amount),
      };

      const createSettlement = await this.createSettlement(input);
      this.$emit("settlement", createSettlement);
      this.$emit("close");
    },

    async confirmOverallSettlement() {
      const settlements = [];

      for (const tx of this.selectedUser.transactions) {
        let payerId = "";
        let receiverId = "";

        if (tx.type === "owed") {
          payerId = tx.person;
          receiverId = this.user.id;
        } else {
          payerId = this.user.id;
          receiverId = tx.person;
        }

        settlements.push(
          this.createSettlement({
            group_id: tx.groupId,
            payer_id: payerId,
            receiver_id: receiverId,
            amount: Number(tx.amount),
          }),
        );
      }

      //  all settlements in parallel
      await Promise.all(settlements);

      this.$emit("settlement", { overall: true });
    },
  },
  mounted() {},
};
