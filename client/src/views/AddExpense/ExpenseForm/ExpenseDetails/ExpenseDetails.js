import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";

export default {
  name: "ExpenseDetails",
  components: {
    ErrorWrapper,
  },

  props: {
    formData: {
      type: Object,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    isFormValid: {
      type: Boolean,
      required: true,
    },
    backendError: {
      type: String,
      default: "",
    },
    generalError: {
      type: String,
      default: "",
    },
  },

  watch: {
    backendError(newVal) {
      if (newVal) {
        console.log(`BERROR from Expense Details:`, newVal);
      }
    },
  },

  emits: ["update:formData", "cancel", "submit"],

  methods: {
    updateField(field, value) {
      this.$emit("update:formData", { ...this.formData, [field]: value });
    },

    handleAmountChange(value) {
      this.updateField("amount", value);
    },
  },
};
