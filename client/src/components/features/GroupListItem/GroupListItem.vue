<template>
  <div class="list-item hover-card" :class="{ active: isActive }">
    <div class="item-info">
      <div class="item-avatar">
        <img v-if="item.profilePic" :src="profileUrl" alt="Profile" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="item-name">
        <h5 class="mb-0">{{ item.displayName }}</h5>
      </div>
    </div>
    <div class="item-balances">
      <div v-if="item.netBalance > 0" class="balance-item owed">
        <span class="balance-label">you are owed</span>
        <span class="balance-amount">₹{{ item.netBalance.toFixed(2) }}</span>
      </div>
      <div v-else-if="item.netBalance < 0" class="balance-item owe">
        <span class="balance-label">you owe</span>
        <span class="balance-amount"
          >₹{{ Math.abs(item.netBalance).toFixed(2) }}</span
        >
      </div>
      <div v-else class="balance-item settled">
        <span class="balance-label">settled</span>
      </div>
    </div>
  </div>
</template>

<script>
import { CLOUDINARY_BASE_URL } from "@/services/cloudinary.service";
import { getInitials } from "@/utils/stringHelpers";

export default {
  name: "GroupListItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    initials() {
      return getInitials(this.item.displayName);
    },
    profileUrl() {
      if (this.item.profilePic) {
        return `${CLOUDINARY_BASE_URL}v${this.item.profilePicVersion}/${this.item.profilePic}`;
      }
      return null;
    },
  },
};
</script>

<style scoped>
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  width: 100%;
  text-align: left;
}

.list-item:hover {
  background: #ffffff;
  border-color: #225750;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.list-item.active {
  background: #ffffff;
  border-color: #225750;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.item-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-start;
}

.item-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #225750;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
  overflow: hidden;
}

.item-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-name h5 {
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1rem;
}

.item-balances {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 120px;
}

.balance-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.balance-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.balance-item.owed .balance-label {
  color: #059669;
}
.balance-item.owed .balance-amount {
  color: #10b981;
}
.balance-item.owe .balance-label {
  color: #dc2626;
}
.balance-item.owe .balance-amount {
  color: #ef4444;
}
.balance-item.settled {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  align-items: center;
}

@media (max-width: 768px) {
  .list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .item-balances {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
  }
}
</style>
