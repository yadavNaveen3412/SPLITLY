import ParticipantAmount from "../ParticipantAmount/ParticipantAmount.vue";
import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";

export default {
  name: "ExpenseSplit",

  components: { ParticipantAmount, ErrorWrapper },

  props: {
    participants: {
      type: Array,
      required: true,
    },
    currentUser: {
      type: Object,
      required: true,
    },
    splits: {
      type: Object,
      required: true,
    },
    splitMethod: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    hasAmount: {
      type: Boolean,
      default: false,
    },
    splitError: {
      type: String,
      default: "",
    },
    excludedMembers: {
      type: [Set, Object],
      default: () => new Set(),
      validator: (value) => value instanceof Set || value === undefined,
    },
  },

  emits: ["update:splitMethod", "split-update", "toggle-member"],

  data() {
    return {
      showMethodSelection: false,
      splitMethods: [
        { value: "equal", label: "Split Equally", icon: "=" },
        { value: "unequal", label: "Split Unequally", icon: "≠" },
        { value: "percentage", label: "Split By Percentage", icon: "%" },
        { value: "shares", label: "Split By Shares", icon: "#" },
      ],
    };
  },

  computed: {
    selectedMethodLabel() {
      const method = this.splitMethods.find(
        (m) => m.value === this.splitMethod,
      );
      return method ? method.label : "";
    },
  },

  methods: {
    selectMethod(method) {
      this.$emit("update:splitMethod", method);
      this.showMethodSelection = false;
    },

    goBackToMethodSelection() {
      this.showMethodSelection = true;
    },

    handleSplitUpdate(participantId, value) {
      this.$emit("split-update", participantId, value);
    },

    handleToggleMember(participantId) {
      this.$emit("toggle-member", participantId);
    },

    isMemberExcluded(participantId) {
      return this.excludedMembers.has(participantId);
    },
  },

  mounted() {
    this.showMethodSelection = false;
  },
};
