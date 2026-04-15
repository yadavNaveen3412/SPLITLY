import ExpenseDetails from "./ExpenseDetails/ExpenseDetails.vue";
import ExpenseSplit from "./ExpenseSplit/ExpenseSplit.vue";
import ExpensePaidBy from "./ExpensePaidBy/ExpensePaidBy.vue";
import { mapActions, mapGetters } from "vuex";
import {
  distributeExactly,
  calculateOwedAmounts,
} from "@splitly/expense-split-logic";

export default {
  name: "ExpenseForm",

  components: {
    ExpenseDetails,
    ExpenseSplit,
    ExpensePaidBy,
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
  },

  emits: ["submit", "cancel"],

  data() {
    return {
      activeTab: "split",
      formData: {
        title: "",
        description: "",
        amount: "",
        category: "",
        splitMethod: "equal",
      },
      splits: {},
      paidBy: {},
      selectedPaidBy: new Set(),
      paidByError: "",
      splitError: "",
      manuallyEditedSplits: new Set(),
      excludedMembersFromSplit: new Set(),
    };
  },

  computed: {
    ...mapGetters("categories", ["getCategories"]),
    categories() {
      return this.getCategories;
    },

    allParticipants() {
      return [this.currentUser, ...this.participants];
    },

    hasAmount() {
      return (
        this.formData.amount !== "" && parseFloat(this.formData.amount) > 0
      );
    },

    isFormValid() {
      const hasTitle = this.formData.title.trim() !== "";
      const hasAmount = this.hasAmount;
      const hasCategory = this.formData.category !== "";
      const hasPaidBy = this.selectedPaidBy.size > 0;
      const paidByValid = this.paidByError === "";
      const splitValid = this.splitError === "";

      return (
        hasTitle &&
        hasAmount &&
        hasCategory &&
        hasPaidBy &&
        paidByValid &&
        splitValid
      );
    },
  },

  methods: {
    ...mapActions("categories", ["loadCategories"]),

    initializeSplits() {
      const totalAmount = parseFloat(this.formData.amount) || 0;
      const method = this.formData.splitMethod;

      this.manuallyEditedSplits.clear();

      const participantsForLib = this.allParticipants.map((p) => {
        let splitValue = 1;
        if (method === "equal") {
          splitValue = this.excludedMembersFromSplit.has(p.id) ? 0 : 1;
        } else if (method === "percentage") {
          splitValue = 100 / this.allParticipants.length;
        } else if (method === "shares") {
          splitValue = 1;
        } else if (method === "unequal") {
          splitValue = null;
        }
        return { userId: p.id, splitValue };
      });

      const results = calculateOwedAmounts(
        totalAmount,
        method,
        participantsForLib,
      );
      results.forEach((res) => {
        this.splits[res.userId] = method === "unequal" ? null : res.owedAmount;
      });

      this.splits = { ...this.splits };
      this.initializePaidBy();
    },

    toggleMemberInSplit(participantId) {
      if (this.excludedMembersFromSplit.has(participantId)) {
        this.excludedMembersFromSplit.delete(participantId);
      } else {
        this.excludedMembersFromSplit.add(participantId);
      }

      this.excludedMembersFromSplit = new Set(this.excludedMembersFromSplit);

      if (this.formData.splitMethod === "equal") {
        this.initializeSplits();
        this.validateSplitTotals();
      }
    },

    initializePaidBy() {
      if (this.hasAmount) {
        this.selectedPaidBy = new Set([this.currentUser.id]);
        this.paidBy = { [this.currentUser.id]: this.formData.amount };
        this.paidByError = "";
      }
    },

    redistributeUnequal(changedParticipantId) {
      const totalAmount = parseFloat(this.formData.amount) || 0;
      this.manuallyEditedSplits.add(changedParticipantId);

      const manualTotal = this.allParticipants.reduce((sum, p) => {
        return (
          sum +
          (this.manuallyEditedSplits.has(p.id)
            ? parseFloat(this.splits[p.id]) || 0
            : 0)
        );
      }, 0);

      const remaining = totalAmount - manualTotal;
      const autoParticipants = this.allParticipants.filter(
        (p) => !this.manuallyEditedSplits.has(p.id),
      );

      if (autoParticipants.length > 0) {
        const amounts = distributeExactly(remaining, autoParticipants.length);
        autoParticipants.forEach((p, i) => {
          this.splits[p.id] = amounts[i];
        });
      }

      this.splits = { ...this.splits };
      this.validateSplitTotals();
    },

    redistributePercentage(changedParticipantId) {
      this.manuallyEditedSplits.add(changedParticipantId);

      const manualTotal = this.allParticipants.reduce((sum, p) => {
        return (
          sum +
          (this.manuallyEditedSplits.has(p.id)
            ? parseFloat(this.splits[p.id]) || 0
            : 0)
        );
      }, 0);

      const remaining = 100 - manualTotal;
      const autoParticipants = this.allParticipants.filter(
        (p) => !this.manuallyEditedSplits.has(p.id),
      );

      if (autoParticipants.length > 0) {
        const amounts = distributeExactly(remaining, autoParticipants.length);
        autoParticipants.forEach((p, i) => {
          this.splits[p.id] = amounts[i];
        });
      }

      this.splits = { ...this.splits };
      this.validateSplitTotals();
    },

    redistributeShares() {
      this.splits = { ...this.splits };
      this.splitError = "";
    },

    validateSplitTotals() {
      const totalAmount = parseFloat(this.formData.amount) || 0;

      if (this.formData.splitMethod === "equal") {
        const includedCount = this.allParticipants.filter(
          (p) => !this.excludedMembersFromSplit.has(p.id),
        ).length;

        if (includedCount < 2) {
          this.splitError =
            "At least two members must be included in the split";
          return;
        }
      }
      if (this.formData.splitMethod === "unequal") {
        const totalSplit = this.allParticipants.reduce((sum, p) => {
          return sum + (parseFloat(this.splits[p.id]) || 0);
        }, 0);

        if (Math.abs(totalSplit - totalAmount) > 0.01) {
          this.splitError = `Total split (₹${totalSplit.toFixed(
            2,
          )}) must equal expense amount (₹${totalAmount.toFixed(2)})`;
        } else {
          this.splitError = "";
        }
      } else if (this.formData.splitMethod === "percentage") {
        const totalPercentage = this.allParticipants.reduce((sum, p) => {
          return sum + (parseFloat(this.splits[p.id]) || 0);
        }, 0);

        if (Math.abs(totalPercentage - 100) > 0.01) {
          this.splitError = `Total percentage (${totalPercentage.toFixed(
            2,
          )}%) must equal 100%`;
        } else {
          this.splitError = "";
        }
      } else {
        this.splitError = "";
      }
    },

    updateFormData(newFormData) {
      this.formData = { ...this.formData, ...newFormData };
    },

    handleAmountChange() {
      if (this.formData.splitMethod === "equal") {
        this.initializeSplits();
      } else if (this.formData.splitMethod === "unequal") {
        const totalAmount = parseFloat(this.formData.amount) || 0;

        const manuallyEdited = [];
        const autoDistributed = [];

        this.allParticipants.forEach((p) => {
          if (this.manuallyEditedSplits.has(p.id)) {
            manuallyEdited.push({
              id: p.id,
              value: parseFloat(this.splits[p.id]) || 0,
            });
          } else {
            autoDistributed.push({ id: p.id });
          }
        });

        const manualTotal = manuallyEdited.reduce((sum, p) => sum + p.value, 0);
        const remaining = totalAmount - manualTotal;
        const autoParticipants = this.allParticipants.filter(
          (p) => !this.manuallyEditedSplits.has(p.id),
        );

        if (autoParticipants.length > 0) {
          const amounts = distributeExactly(remaining, autoParticipants.length);
          autoParticipants.forEach((p, i) => {
            this.splits[p.id] = amounts[i];
          });
        }

        this.splits = { ...this.splits };
      } else if (this.formData.splitMethod === "shares") {
        this.splits = { ...this.splits };
      } else if (this.formData.splitMethod === "percentage") {
        this.splits = { ...this.splits };
      }

      this.initializePaidBy();
    },

    handleSplitMethodChange(method) {
      this.formData.splitMethod = method;
      this.excludedMembersFromSplit.clear();
      this.initializeSplits();
    },

    handleSplitUpdate(participantId, value) {
      if (this.formData.splitMethod === "unequal") {
        this.splits[participantId] =
          value === "" || value === null ? null : parseFloat(value);
        this.redistributeUnequal(participantId);
      } else if (this.formData.splitMethod === "percentage") {
        this.splits[participantId] = parseFloat(value) || 0;
        this.redistributePercentage(participantId);
      } else if (this.formData.splitMethod === "shares") {
        this.splits[participantId] = parseInt(value) || 1;
        this.redistributeShares();
      }
    },

    togglePaidBy(participantId) {
      const newSelectedPaidBy = new Set(this.selectedPaidBy);

      if (newSelectedPaidBy.has(participantId)) {
        newSelectedPaidBy.delete(participantId);
        const newPaidBy = { ...this.paidBy };
        delete newPaidBy[participantId];
        this.paidBy = newPaidBy;
      } else {
        newSelectedPaidBy.add(participantId);
        if (!(participantId in this.paidBy)) {
          this.paidBy = { ...this.paidBy, [participantId]: "" };
        }
      }

      this.selectedPaidBy = newSelectedPaidBy;
    },

    updatePaidBy(newPaidBy) {
      this.paidBy = { ...newPaidBy };
    },

    validatePaidTotal(error) {
      this.paidByError = error;
    },

    handleSubmit() {
      if (!this.isFormValid) return;

      const participantsMap = new Map();
      this.allParticipants.forEach((p) => {
        participantsMap.set(p.id, {
          userId: p.id,
          paidAmount: 0,
          splitValue: null,
        });
      });

      // Pass raw split configs directly to backend without pre-computing amounts locally
      this.allParticipants.forEach((p) => {
        if (participantsMap.has(p.id)) {
          let val = this.splits[p.id];

          // For EQUAL splits, flag exclusion physically so backend excludes them from denominator
          if (this.formData.splitMethod === "equal") {
            val = this.excludedMembersFromSplit.has(p.id) ? 0 : 1;
          }

          if (val !== undefined && val !== null) {
            participantsMap.get(p.id).splitValue = parseFloat(val);
          }
        }
      });

      // Calculate paid amounts
      Object.keys(this.paidBy).forEach((participantId) => {
        if (this.selectedPaidBy.has(participantId)) {
          const amount = parseFloat(this.paidBy[participantId]) || 0;
          if (amount > 0 && participantsMap.has(participantId)) {
            participantsMap.get(participantId).paidAmount = amount;
          }
        }
      });

      // Filter to only include participants who have non-zero interactions
      const participants = Array.from(participantsMap.values()).filter((p) => {
        const paidSomething = p.paidAmount > 0;
        let isOwedSomething = false;

        if (this.formData.splitMethod === "equal") {
          isOwedSomething = !this.excludedMembersFromSplit.has(p.userId);
        } else if (
          this.formData.splitMethod === "shares" ||
          this.formData.splitMethod === "percentage" ||
          this.formData.splitMethod === "unequal"
        ) {
          isOwedSomething = (p.splitValue || 0) > 0;
        }

        return paidSomething || isOwedSomething;
      });

      const expenseData = {
        title: this.formData.title,
        description: this.formData.description,
        totalAmount: parseFloat(this.formData.amount),
        categoryId: this.formData.category,
        splitMethod: this.formData.splitMethod,
        participants,
      };

      this.$emit("submit", expenseData);
    },
  },

  async mounted() {
    this.initializeSplits();
    await this.loadCategories();
  },

  watch: {
    "formData.amount"() {
      this.handleAmountChange();
    },
    participants: {
      handler() {
        this.initializeSplits();
      },
      deep: true,
    },
  },
};
