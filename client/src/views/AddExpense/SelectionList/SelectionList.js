import { mapGetters } from "vuex";

export default {
  name: "SelectionList",

  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ["groups", "friends"].includes(value),
    },
    preselectedId: {
      type: String,
      default: null,
    },
    selectedIds: {
      type: [String, Array],
      default: null,
    },
  },

  emits: ["update:selectedIds", "add-new"],

  data() {
    return {};
  },

  computed: {
    ...mapGetters("group", ["getGroupsWithMemberCount"]),
    ...mapGetters("friends", ["getFriends"]),
    items() {
      return this.type === "groups"
        ? this.getGroupsWithMemberCount
        : this.getFriends;
    },

    isDisabled() {
      return !!this.preselectedId;
    },

    normalizedSelectedIds() {
      if (this.type === "groups") {
        return this.selectedIds || null;
      } else {
        return Array.isArray(this.selectedIds) ? this.selectedIds : [];
      }
    },
  },

  methods: {
    isSelected(id) {
      if (this.type === "groups") {
        return this.normalizedSelectedIds === id;
      } else {
        return this.normalizedSelectedIds.includes(id);
      }
    },

    toggleSelection(id) {
      if (this.type === "groups") {
        this.$emit("update:selectedIds", id);
      } else {
        const currentSelection = [...this.normalizedSelectedIds];
        const index = currentSelection.indexOf(id);

        if (index > -1) {
          currentSelection.splice(index, 1);
        } else {
          currentSelection.push(id);
        }
        this.$emit("update:selectedIds", currentSelection);
      }
    },
  },

  watch: {
    preselectedId: {
      handler(newId) {
        if (newId && !this.isSelected(newId)) {
          this.$emit("update:selectedIds", newId);
        }
      },
      immediate: true,
    },
  },
};
