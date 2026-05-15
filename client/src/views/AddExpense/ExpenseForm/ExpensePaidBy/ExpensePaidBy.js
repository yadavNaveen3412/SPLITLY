import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";

export default {
  name: "ExpensePaidBy",
  components: {
    ErrorWrapper,
  },

  props: {
    participants: {
      type: Array,
      required: true,
    },
    currentUser: {
      type: Object,
      required: true,
    },
    paidBy: {
      type: Object,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    selectedPaidBy: {
      type: Set,
      required: true,
    },
    hasAmount: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:paidBy", "toggle-paid-by", "validate-paid-total"],

  data() {
    return {
      paidByError: "",
    };
  },

  methods: {
    isPaidBy(participantId) {
      return this.selectedPaidBy.has(participantId);
    },

    togglePaidBy(participantId) {
      if (!this.hasAmount) return;
      this.$emit("toggle-paid-by", participantId);
    },

    updatePaidAmount(participantId, value) {
      if (!this.hasAmount) return;
      const updatedPaidBy = { ...this.paidBy, [participantId]: value };
      this.$emit("update:paidBy", updatedPaidBy);
      this.validatePaidTotal(updatedPaidBy);
    },

    validatePaidTotal(paidByData = this.paidBy) {
      const totalPaid = Object.values(paidByData).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0,
      );

      const diff = totalPaid - this.totalAmount;

      const invalidEntry = Object.keys(paidByData).find(
        (id) => (parseFloat(paidByData[id]) || 0) > this.totalAmount,
      );

      if (invalidEntry) {
        this.paidByError = `Amount should not exceed total amount ₹${this.totalAmount.toFixed(
          2,
        )}`;
      } else if (Math.abs(diff) > 0.01) {
        if (diff < 0) {
          const left = this.totalAmount - totalPaid;
          this.paidByError = `₹${left.toFixed(2)} left`;
        } else {
          const excess = totalPaid - this.totalAmount;
          this.paidByError = `₹${excess.toFixed(2)} extra`;
        }
      } else {
        this.paidByError = "";
      }

      this.$emit("validate-paid-total", this.paidByError);
    },
    handleKeyDown(event, participantId) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentValue = parseFloat(this.paidBy[participantId]) || 0;
        this.updatePaidAmount(participantId, currentValue + 1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentValue = parseFloat(this.paidBy[participantId]) || 0;
        const nextValue = Math.max(0, currentValue - 1);
        this.updatePaidAmount(participantId, nextValue);
      }
    },
  },

  watch: {
    totalAmount() {
      this.validatePaidTotal();
    },
    paidBy: {
      handler() {
        this.validatePaidTotal();
      },
      deep: true,
    },
  },
};