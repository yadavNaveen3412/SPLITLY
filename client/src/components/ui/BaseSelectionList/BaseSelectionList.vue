<template>
  <div class="selection-list-container">
    <div v-if="items.length === 0" class="empty-state">
      <div v-if="emptyIcon" class="empty-icon">{{ emptyIcon }}</div>
      <div class="empty-title">{{ emptyTitle }}</div>
      <p class="empty-message text-muted">{{ emptyMessage }}</p>
    </div>

    <div v-else class="selection-list custom-scrollbar">
      <div
        v-for="item in items"
        :key="item.id"
        :class="['selection-item', { selected: isSelected(item.id) }]"
        @click="toggleSelection(item.id)"
      >
        <div class="item-avatar">
          <img v-if="item.profilePic" :src="getProfileUrl(item)" alt="" />
          <span v-else>{{ getInitials(item.displayName || item.name) }}</span>
        </div>
        <div class="item-info">
          <div class="item-name">{{ item.displayName || item.name }}</div>
          <div v-if="item.email" class="item-email">{{ item.email }}</div>
        </div>
        <div v-if="isSelected(item.id)" class="check-icon">
          <i class="fa-solid fa-check"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CLOUDINARY_BASE_URL } from "@/services/cloudinary.service";
import { getInitials } from "@/utils/stringHelpers";

export default {
  name: "BaseSelectionList",
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    selectedIds: {
      type: Array,
      default: () => [],
    },
    emptyTitle: {
      type: String,
      default: "No items found",
    },
    emptyMessage: {
      type: String,
      default: "There are no items to display.",
    },
    emptyIcon: String,
  },
  emits: ["update:selectedIds"],
  methods: {
    getInitials,
    getProfileUrl(item) {
      if (item.profilePic) {
        return `${CLOUDINARY_BASE_URL}v${item.profilePicVersion}/${item.profilePic}`;
      }
      return null;
    },
    isSelected(id) {
      return this.selectedIds.includes(id);
    },
    toggleSelection(id) {
      const newSelection = [...this.selectedIds];
      const index = newSelection.indexOf(id);
      if (index > -1) {
        newSelection.splice(index, 1);
      } else {
        newSelection.push(id);
      }
      this.$emit("update:selectedIds", newSelection);
    },
  },
};
</script>

<style scoped>
.selection-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selection-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.selection-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.selection-item:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.selection-item.selected {
  background-color: #f0f7f6;
  border-color: #225750;
}

.item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #225750;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}

.item-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #1f2937;
}

.item-email {
  font-size: 0.8rem;
  color: #6b7280;
}

.check-icon {
  width: 24px;
  height: 24px;
  background-color: #225750;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
