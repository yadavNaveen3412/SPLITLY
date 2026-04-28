export default {
  name: "ParticipantAmount",

  props: {
    participant: { type: Object, required: true },
    splitMethod: { type: String, required: true },
    amount: { type: Number, default: null },
    totalAmount: { type: Number, required: true },
    allSplits: { type: Object, default: () => ({}) },
    isExcluded: { type: Boolean, default: false },
  },

  emits: ["update"],

  data() {
    return {
      displayValue: "",
      isFocused: false,
    };
  },

  watch: {
    amount: {
      handler(newVal) {
        if (!this.isFocused) {
          this.displayValue =
            newVal === null || newVal === undefined || isNaN(newVal)
              ? ""
              : this.formatAmount(newVal);
        }
      },
      immediate: true,
    },
  },

  computed: {
    calculatePercentageAmount() {
      return this.totalAmount * ((this.amount || 0) / 100);
    },

    calculateShareAmount() {
      const totalShares = Object.values(this.allSplits).reduce(
        (sum, shares) => sum + (parseInt(shares) || 0),
        0
      );
      const amountPerShare = totalShares ? this.totalAmount / totalShares : 0;
      return amountPerShare * (parseInt(this.amount) || 0);
    },
  },

  methods: {
    formatAmount(value) {
      if (value === null || value === undefined || isNaN(value)) return "";
      return parseFloat(value).toFixed(2);
    },

    handleInput(event) {
      this.displayValue = event.target.value;
      const raw = parseFloat(event.target.value);
      this.$emit("update", isNaN(raw) ? 0 : raw);
    },

    handleFocus(event) {
      this.isFocused = true;
      this.displayValue =
        this.amount === null || this.amount === undefined
          ? ""
          : String(this.amount);

      // Ensure selection happens after Vue updates the input value
      if (event && event.target) {
        setTimeout(() => {
          event.target.select();
        }, 0);
      }
    },

    handleUpdate(value) {
      this.displayValue = value;
      this.$emit("update", parseFloat(value) || 0);
    },
    
    handleBlur() {
      this.isFocused = false;
      this.displayValue =
        this.amount === null || this.amount === undefined
          ? ""
          : this.formatAmount(this.amount);
    },

    incrementShare() {
      const currentValue = Math.round(this.amount) || 0;
      this.$emit("update", currentValue + 1);
    },

    decrementShare() {
      const currentValue = Math.round(this.amount) || 0;
      if (currentValue > 0) {
        this.$emit("update", currentValue - 1);
      }
    },

    handleKeyDown(event) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentValue = parseFloat(this.amount) || 0;
        this.$emit("update", currentValue + 1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentValue = parseFloat(this.amount) || 0;
        const nextValue = Math.max(0, currentValue - 1);
        this.$emit("update", nextValue);
      }
    },
  },
};