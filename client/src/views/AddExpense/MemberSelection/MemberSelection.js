import { mapGetters } from "vuex";

export default {
  name: "MemberSelection",

  props: {
    groupId: {
      type: String,
      required: true,
    },
    selectedMembers: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["update:selectedMembers"],

  data() {
    return {};
  },

  computed: {
    ...mapGetters("group", ["getGroupById"]),
    ...mapGetters("auth", ["getUserId"]),

    groupData() {
      const group = this.getGroupById(this.groupId);
      if (!group) return {};

      const members = [...group.members].sort((a, b) => {
        if (a.name === "You") return -1;
        if (b.name === "You") return 1;
        return 0;
      });
      return { ...group, members };
    },

    allSelected() {
      const otherMembers = this.groupData.members.filter(m => m.id !== this.userId);
      return (
        otherMembers.length > 0 &&
        this.selectedMembers.length === otherMembers.length
      );
    },

    userId() {
      return this.getUserId;
    },
  },

  methods: {
    isSelected(memberId) {
      if (memberId === this.userId) return true;
      return this.selectedMembers.some((m) => m.id === memberId);
    },

    toggleMember(memberId) {
      if (memberId === this.userId) return; // Current user is included by default

      const member = this.groupData.members.find((m) => m.id === memberId);
      if (!member) return;

      const currentSelection = [...this.selectedMembers];
      const index = currentSelection.findIndex((m) => m.id === memberId);

      if (index > -1) {
        currentSelection.splice(index, 1);
      } else {
        currentSelection.push(member);
      }

      this.$emit("update:selectedMembers", currentSelection);
    },

    toggleSelectAll() {
      if (this.allSelected) {
        this.$emit("update:selectedMembers", []);
      } else {
        const otherMembers = this.groupData.members.filter((member) => {
          return member.id !== this.userId;
        });
        this.$emit("update:selectedMembers", otherMembers);
      }
    },
  },

  watch: {
    groupData(newVal, oldVal) {
      console.log("gData new:::", newVal);
      console.log("gData old:::", oldVal);
    },
  },
};
