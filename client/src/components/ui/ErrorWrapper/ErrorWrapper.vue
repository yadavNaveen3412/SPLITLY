<template>
  <transition name="fade-slide">
    <div v-if="message" class="error-wrapper" :class="customClass">
      <div class="error-content">
        <!-- <span class="error-icon">⚠️</span> -->
        <span class="error-message">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "ErrorWrapper",
  props: {
    message: {
      type: String,
      default: "",
    },
    customClass: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped>
.error-wrapper {
  width: 100%;
  margin-bottom: 12px;
  border-radius: var(--radius-md, 8px);
  background-color: var(--color-danger-light-bg, #fef2f2);
  border-left: 4px solid var(--color-danger, #ef4444);
  overflow: hidden;
}

.error-content {
  display: flex;
  align-items: center;

  gap: 10px;
  padding: 10px 14px;
}

.error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.error-message {
  color: var(--color-danger, #ef4444) !important;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 100px;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
