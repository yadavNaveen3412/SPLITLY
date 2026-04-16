<template>
  <button
    class="base-button rounded-pill"
    :class="[variantClass, customClass]"
    @click="handleClick"
  >
    <i v-if="icon" :class="icon" class="me-2"></i>
    <span><slot>{{ label }}</slot></span>
  </button>
</template>

<script>
export default {
  name: "BaseButton",
  props: {
    label: String,
    icon: String,
    to: [String, Object],
    variant: {
      type: String,
      default: "primary",
    },
    customClass: String,
  },
  computed: {
    variantClass() {
      return `btn-${this.variant}`;
    },
  },
  methods: {
    handleClick(event) {
      if (this.to) {
        this.$router.push(this.to);
      } else {
        this.$emit("click", event);
      }
    },
  },
};
</script>

<style scoped>
.base-button {
  background-color: #225750;
  color: white;
  border: 2px solid #225750;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}

.base-button:hover {
  transform: scale(1.05);
  background-color: #1a443e;
  border-color: #1a443e;
  color: white;
}

/* Add other variants if needed */
.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}
</style>
