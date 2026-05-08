import ExpenseDetails from "./ExpenseDetails/ExpenseDetails.vue";
import ExpenseSplit from "./ExpenseSplit/ExpenseSplit.vue";
import ExpensePaidBy from "./ExpensePaidBy/ExpensePaidBy.vue";
import { mapActions, mapGetters } from "vuex";
import {
  distributeExactly,
  // calculateOwedAmounts,
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
      manuallyEditedPaidBy: new Set(),
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
      const participants = this.allParticipants;

      this.manuallyEditedSplits.clear();
      this.splits = {};

      if (method === "equal") {
        const includedCount = participants.filter(
          (p) => !this.excludedMembersFromSplit.has(p.id),
        ).length;
        const autoParticipants = participants.filter(
          (p) => !this.excludedMembersFromSplit.has(p.id),
        );

        if (includedCount > 0) {
          const amounts = distributeExactly(totalAmount, includedCount);
          autoParticipants.forEach((p, i) => {
            this.splits[p.id] = amounts[i];
          });
          participants.forEach((p) => {
            if (this.excludedMembersFromSplit.has(p.id)) this.splits[p.id] = 0;
          });
        } else {
          participants.forEach((p) => (this.splits[p.id] = 0));
        }
      } else if (method === "percentage") {
        if (participants.length > 0) {
          const percentages = distributeExactly(100, participants.length);
          participants.forEach((p, i) => {
            this.splits[p.id] = percentages[i];
          });
        }
      } else if (method === "shares" || method === "unequal") {
        participants.forEach((p) => {
          this.splits[p.id] = 0;
        });
      }

      this.splits = { ...this.splits };
      this.validateSplitTotals();
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

    initializePaidBy(forceReset = false) {
      if (!this.hasAmount) return;

      if (forceReset || this.selectedPaidBy.size === 0) {
        this.selectedPaidBy = new Set([this.currentUser.id]);
        this.paidBy = { [this.currentUser.id]: this.formData.amount };
        this.manuallyEditedPaidBy.clear();
        this.paidByError = "";
        return;
      }

      // If single payer, keep them and update amount
      if (this.selectedPaidBy.size === 1) {
        const payerId = Array.from(this.selectedPaidBy)[0];
        this.paidBy = { [payerId]: this.formData.amount };
        this.paidByError = "";
        return;
      }

      // Multi-payer: redistribute
      this.redistributePaidBy();
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
        const amounts = distributeExactly(
          Math.max(0, remaining),
          autoParticipants.length,
        );
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
        const amounts = distributeExactly(
          Math.max(0, remaining),
          autoParticipants.length,
        );
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

        if (includedCount < 1) {
          this.splitError = "At least one member must be included in the split";
          return;
        }
      }
      if (this.formData.splitMethod === "unequal") {
        const totalSplit = this.allParticipants.reduce((sum, p) => {
          return sum + (parseFloat(this.splits[p.id]) || 0);
        }, 0);

        const invalidEntry = this.allParticipants.find(
          (p) => (parseFloat(this.splits[p.id]) || 0) > totalAmount,
        );

        if (invalidEntry) {
          this.splitError = `Amount should not exceed total amount ₹${totalAmount.toFixed(
            2,
          )}`;
        } else if (Math.abs(totalSplit - totalAmount) > 0.01) {
          if (totalSplit < totalAmount) {
            const remaining = totalAmount - totalSplit;
            this.splitError = `₹${remaining.toFixed(2)} left`;
          } else {
            const excess = totalSplit - totalAmount;
            this.splitError = `₹${excess.toFixed(2)} extra`;
          }
        } else {
          this.splitError = "";
        }
      } else if (this.formData.splitMethod === "percentage") {
        const totalPercentage = this.allParticipants.reduce((sum, p) => {
          return sum + (parseFloat(this.splits[p.id]) || 0);
        }, 0);

        const invalidEntry = this.allParticipants.find(
          (p) => (parseFloat(this.splits[p.id]) || 0) > 100,
        );

        if (invalidEntry) {
          this.splitError = "Percentage should not exceed 100%";
        } else if (Math.abs(totalPercentage - 100) > 0.01) {
          if (totalPercentage < 100) {
            const remaining = 100 - totalPercentage;
            this.splitError = `${remaining.toFixed(2)}% left`;
          } else {
            const excess = totalPercentage - 100;
            this.splitError = `${excess.toFixed(2)}% extra`;
          }
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
        this.splits[participantId] = parseFloat(value) || 0;
        this.redistributeUnequal(participantId);
      } else if (this.formData.splitMethod === "percentage") {
        this.splits[participantId] = parseFloat(value) || 0;
        this.redistributePercentage(participantId);
      } else if (this.formData.splitMethod === "shares") {
        this.splits[participantId] = parseInt(value) || 0;
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
        this.manuallyEditedPaidBy.delete(participantId);
      } else {
        newSelectedPaidBy.add(participantId);
        if (!(participantId in this.paidBy)) {
          this.paidBy[participantId] = 0;
        }
      }

      this.selectedPaidBy = newSelectedPaidBy;

      // If single payer remains, auto-fill with total amount
      if (this.selectedPaidBy.size === 1) {
        const payerId = Array.from(this.selectedPaidBy)[0];
        this.paidBy = { [payerId]: this.formData.amount };
        this.manuallyEditedPaidBy.clear(); // Reset manual status if only one payer
      } else {
        this.redistributePaidBy();
      }
    },

    redistributePaidBy(changedParticipantId = null) {
      const totalAmount = parseFloat(this.formData.amount) || 0;
      if (changedParticipantId) {
        this.manuallyEditedPaidBy.add(changedParticipantId);
      }

      const manualTotal = Array.from(this.selectedPaidBy).reduce((sum, id) => {
        return (
          sum +
          (this.manuallyEditedPaidBy.has(id)
            ? parseFloat(this.paidBy[id]) || 0
            : 0)
        );
      }, 0);

      const remaining = totalAmount - manualTotal;
      const autoPayers = Array.from(this.selectedPaidBy).filter(
        (id) => !this.manuallyEditedPaidBy.has(id),
      );

      if (autoPayers.length > 0) {
        const amounts = distributeExactly(
          Math.max(0, remaining),
          autoPayers.length,
        );
        autoPayers.forEach((id, i) => {
          this.paidBy[id] = amounts[i];
        });
      }

      this.paidBy = { ...this.paidBy };
    },

    updatePaidBy(updatedPaidBy) {
      // Find which payer was changed by comparing with current this.paidBy
      const changedId = Object.keys(updatedPaidBy).find(
        (id) =>
          (parseFloat(updatedPaidBy[id]) || 0) !==
          (parseFloat(this.paidBy[id]) || 0),
      );

      this.paidBy = { ...updatedPaidBy };

      if (changedId) {
        this.redistributePaidBy(changedId);
      }
    },

    validatePaidTotal(error) {
      this.paidByError = error;
    },

    handleSubmit() {
      if (!this.isFormValid) return;

      const title = this.formData.title?.trim();
      const description = this.formData.description?.trim();
      const amount = parseFloat(this.formData.amount);

      if (!title || title.length < 3 || title.length > 50) {
        alert("Expense title must be between 3 and 50 characters.");
        return;
      }

      if (description && description.length > 255) {
        alert("Description must not exceed 255 characters.");
        return;
      }

      if (isNaN(amount) || amount < 0.01 || amount > 1000000) {
        alert("Total amount must be between 0.01 and 1,000,000.");
        return;
      }

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
    this.initializePaidBy();
    if (this.categories.length === 0) {
      await this.loadCategories();
    }
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
