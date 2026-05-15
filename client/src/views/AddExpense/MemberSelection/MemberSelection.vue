<template>
  <div class="member-selection-container">
    <div class="group-info">
      <div class="group-avatar">
        {{ groupData.title.charAt(0).toUpperCase() }}
      </div>
      <div class="group-details">
        <div class="group-name">{{ groupData.title }}</div>
        <div class="group-meta">{{ groupData.members.length }} members</div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="groupData.members?.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <div class="empty-title">No Members in This Group</div>
      <div class="empty-message">
        This group doesn't have any members yet. Add members to the group first.
      </div>
    </div>

    <div v-else>
      <div class="select-all-section">
        <button
          :class="['select-all-btn', { 'all-selected': allSelected }]"
          @click="toggleSelectAll"
        >
          <span class="select-all-checkbox">
            {{ allSelected ? "✓" : "" }}
          </span>
          <span>{{ allSelected ? "Deselect All" : "Select All" }}</span>
        </button>
      </div>
    </div>

    <div class="members-list">
      <div
        v-for="member in groupData.members"
        :key="member.id"
        :class="[
          'member-item',
          { selected: isSelected(member.id), disabled: member.name === 'You' },
        ]"
        @click="member.name !== 'You' && toggleMember(member.id)"
      >
        <div class="member-avatar">
          {{ member?.name?.charAt(0).toUpperCase() }}
        </div>
        <div class="member-info">
          <div class="member-name">{{ member.name }}</div>
        </div>
        <div v-if="isSelected(member.id)" class="check-icon">✓</div>
      </div>
    </div>
  </div>
</template>

<script src="./MemberSelection.js" />
<style src="./MemberSelection.css" scoped />
