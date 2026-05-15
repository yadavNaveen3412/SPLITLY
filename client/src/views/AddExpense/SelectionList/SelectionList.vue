<template>
  <div class="selection-list-container">
    <div class="add-new-section">
      <button class="add-new-btn" @click="$emit('add-new')">
        <span class="plus-icon">+</span>
        Add New {{ type === "groups" ? "Group" : "Friend" }}
      </button>
    </div>

    <div v-if="!items || items?.length === 0" class="empty-state">
      <div class="empty-icon">{{ type === "groups" ? "👥" : "👤" }}</div>
      <div class="empty-title">
        No {{ type === "groups" ? "Groups" : "Friends" }} Yet
      </div>
      <div class="empty-message">
        Click the button above to add your first
        {{ type === "groups" ? "group" : "friend" }}
      </div>
    </div>

    <div v-else class="selection-list">
      <div
        v-for="item in items"
        :key="item.id"
        :class="[
          'selection-item',
          { selected: isSelected(item.id), disabled: isDisabled },
        ]"
        @click="!isDisabled && toggleSelection(item.id)"
      >
        <div class="item-avatar">{{ item?.name?.charAt(0).toUpperCase() }}</div>
        <div class="item-info">
          <div class="item-name">{{ item.name }}</div>
          <div v-if="type === 'groups'" class="item-meta">
            {{ item.members }} members
          </div>
        </div>
        <div v-if="isSelected(item.id)" class="check-icon">✓</div>
      </div>
    </div>
  </div>
</template>

<script src="./SelectionList.js" />
<style src="./SelectionList.css" scoped />
