<template>
  <div class="row g-4">
    <div class="col-12">
      <div class="card shadow-sm list-card">
        <div class="card-body p-4">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">{{ loadingMessage }}</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!items || items.length === 0"
            class="text-center py-5"
          >
            <img
              v-if="emptyIcon"
              :src="emptyIcon"
              alt="No items"
              class="mb-3 opacity-50 empty-icon"
            />
            <p class="text-muted-custom">{{ emptyMessage }}</p>
          </div>

          <!-- List Content -->
          <div v-else class="items-list">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GroupImage from "@/assets/images/GroupImage.png";
export default {
  name: "BaseList",
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingMessage: {
      type: String,
      default: "Loading...",
    },
    emptyMessage: {
      type: String,
      default: "No items found.",
    },
    emptyIcon: {
      type: String,
      default: GroupImage,
    },
  },
};
</script>

<style scoped>
.list-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-icon {
  width: 96px;
  height: 96px;
}
</style>
