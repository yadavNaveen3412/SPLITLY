<template>
  <div class="friend-detail-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="friend-info-header">
        <div class="avatar-large" @click="goToDetails">
          <div v-if="friend && friend.profilePic">
            <img :src="profileUrl(friend)" alt="Profile" />
          </div>
          <div v-else-if="group && group.profilePic">
            <img :src="profileUrl(group)" alt="Profile" />
          </div>
          <div v-else>
            {{
              getInitials(friend ? friend.name : group ? group.title : "N A")
            }}
          </div>
        </div>
        <div>
          <h4 class="mb-1">
            {{ friend ? friend.name : group ? group.title : "N A" }}
          </h4>
          <div class="balance-summary">
            <span v-if="loadingNet" class="text-muted-custom"
              >loading net...</span
            >
            <span v-else-if="net > 0" class="text-success-custom">
              you are owed ₹{{ Math.abs(net).toFixed(2) }}
            </span>
            <span v-else-if="net < 0" class="text-danger-custom">
              you owe ₹{{ Math.abs(net).toFixed(2) }}
            </span>
            <span v-else class="text-muted-custom">settled up</span>
          </div>
        </div>
      </div>
      <button class="btn-close-panel" @click="closeDetail">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
    <!-- Tabs -->
    <div class="tabs-container">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'expenses' }"
        @click="activeTab = 'expenses'"
      >
        <i class="fa-solid fa-receipt"></i> Expenses
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'chats' }"
        @click="activeTab = 'chats'"
      >
        <i class="fa-solid fa-comment"></i> Chats
      </button>
    </div>
    <!-- Tab Content -->
    <div class="panel-content">
      <ExpenseTab
        v-if="activeTab === 'expenses'"
        :id="id"
        :page="currentPage"
      />
      <ChatTab v-else :id="id" :page="currentPage" />
    </div>
  </div>
</template>

<script src="./Chats.js" />
<style src="./Chats.css" scoped />
