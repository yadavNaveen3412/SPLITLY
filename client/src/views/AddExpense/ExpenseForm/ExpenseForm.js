import ExpenseDetails from "./ExpenseDetails/ExpenseDetails.vue";
import ExpenseSplit from "./ExpenseSplit/ExpenseSplit.vue";
import ExpensePaidBy from "./ExpensePaidBy/ExpensePaidBy.vue";
import { mapActions, mapGetters } from "vuex";

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

    /**
     * Helper function to distribute amount exactly among participants
     * Distributes remainder to the first participant to ensure total matches exactly
     */
    distributeExactly(totalAmount, participantCount) {
      const amountInCents = Math.round(totalAmount * 100);
      const baseAmountInCents = Math.floor(amountInCents / participantCount);
      const remainderInCents =
        amountInCents - baseAmountInCents * participantCount;

      const amounts = [];
      for (let i = 0; i < participantCount; i++) {
        // Add remainder to first participant
        const amount =
          (baseAmountInCents + (i === 0 ? remainderInCents : 0)) / 100;
        amounts.push(amount);
      }

      return amounts;
    },

    initializeSplits() {
      const totalAmount = parseFloat(this.formData.amount) || 0;

      const includedParticipants =
        this.formData.splitMethod === "equal"
          ? this.allParticipants.filter(
              (p) => !this.excludedMembersFromSplit.has(p.id)
            )
          : this.allParticipants;

      this.manuallyEditedSplits.clear();

      if (this.formData.splitMethod === "equal") {
        // Use exact distribution for equal splits
        const amounts = this.distributeExactly(
          totalAmount,
          includedParticipants.length
        );
        let amountIndex = 0;

        this.allParticipants.forEach((p) => {
          if (this.excludedMembersFromSplit.has(p.id)) {
            this.splits[p.id] = 0;
          } else {
            this.splits[p.id] = amounts[amountIndex];
            amountIndex++;
          }
        });
      } else if (this.formData.splitMethod === "shares") {
        this.allParticipants.forEach((p) => {
          this.splits[p.id] = 1;
        });
      } else if (this.formData.splitMethod === "percentage") {
        // Use exact distribution for percentage splits
        const amounts = this.distributeExactly(
          100,
          this.allParticipants.length
        );
        this.allParticipants.forEach((p, index) => {
          this.splits[p.id] = amounts[index];
        });
      } else if (this.formData.splitMethod === "unequal") {
        this.allParticipants.forEach((p) => {
          this.splits[p.id] = null;
        });
      }

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

      if (autoDistributed.length > 0) {
        // Use exact distribution for auto-distributed participants
        const amounts = this.distributeExactly(
          remaining,
          autoDistributed.length
        );
        autoDistributed.forEach((p, index) => {
          this.splits[p.id] = amounts[index];
        });
      }

      this.splits = { ...this.splits };
      this.validateSplitTotals();
    },

    redistributePercentage(changedParticipantId) {
      this.manuallyEditedSplits.add(changedParticipantId);

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
      const remaining = 100 - manualTotal;

      if (autoDistributed.length > 0) {
        // Use exact distribution for auto-distributed percentages
        const amounts = this.distributeExactly(
          remaining,
          autoDistributed.length
        );
        autoDistributed.forEach((p, index) => {
          this.splits[p.id] = amounts[index];
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
          (p) => !this.excludedMembersFromSplit.has(p.id)
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
            2
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
            2
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

        if (autoDistributed.length > 0) {
          // Use exact distribution
          const amounts = this.distributeExactly(
            remaining,
            autoDistributed.length
          );
          autoDistributed.forEach((p, index) => {
            this.splits[p.id] = amounts[index];
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
        participantsMap.set(p.id, { userId: p.id, paidAmount: 0, owedAmount: 0 });
      });

      // Calculate owed (shared) amounts
      let totalAssignedCents = 0;
      const targetCents = Math.round(parseFloat(this.formData.amount) * 100);
      const owedAssignments = [];

      this.allParticipants.forEach((participant) => {
        let amount = 0;

        if (this.formData.splitMethod === "equal") {
          amount = this.splits[participant.id] || 0;
        } else if (this.formData.splitMethod === "unequal") {
          amount = parseFloat(this.splits[participant.id]) || 0;
        } else if (this.formData.splitMethod === "percentage") {
          const percentage = parseFloat(this.splits[participant.id]) || 0;
          amount = (parseFloat(this.formData.amount) * percentage) / 100;
        } else if (this.formData.splitMethod === "shares") {
          const totalShares = Object.values(this.splits).reduce(
            (sum, shares) => {
              return sum + (parseInt(shares) || 1);
            },
            0
          );
          const amountPerShare = parseFloat(this.formData.amount) / totalShares;
          const participantShares = parseInt(this.splits[participant.id]) || 1;
          amount = amountPerShare * participantShares;
        }

        if (amount > 0 && participantsMap.has(participant.id)) {
          const cents = Math.round(amount * 100);
          owedAssignments.push({ participantId: participant.id, cents });
          totalAssignedCents += cents;
        }
      });

      // Assign leftover missing cents to the first participant to ensure perfect balancing
      if (this.formData.splitMethod !== "unequal" && owedAssignments.length > 0) {
        const remainderCents = targetCents - totalAssignedCents;
        if (remainderCents !== 0) {
          owedAssignments[0].cents += remainderCents;
        }
      }

      owedAssignments.forEach(({ participantId, cents }) => {
        participantsMap.get(participantId).owedAmount = cents / 100;
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

      // Filter to only include participants who have non-zero amounts
      const participants = Array.from(participantsMap.values()).filter(
        (p) => p.paidAmount > 0 || p.owedAmount > 0
      );

      const expenseData = {
        title: this.formData.title,
        description: this.formData.description,
        totalAmount: parseFloat(this.formData.amount),
        categoryId: this.formData.category,
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
