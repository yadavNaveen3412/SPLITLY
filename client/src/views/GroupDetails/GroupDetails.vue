<template>
  <div class="main">
    <div class="container my-4">
      <div class="whole-section mt-4 pt-3 border-top">
        <!-- Error Message -->
        <ErrorWrapper :message="error" />

        <!-- Group Header -->
        <div class="group-header">
          <!-- Back Button | Group Avatar + Name | Action Buttons -->
          <div class="d-flex align-items-center gap-3 mb-4">
            <!-- Back Button -->
            <button
              class="btn btn-link text-muted p-0"
              @click="goBack"
              title="Back to Groups"
            >
              <i class="fa-solid fa-arrow-left"></i>
            </button>

            <!-- Group Avatar + Name -->
            <div class="group-avatar-section d-flex align-items-center gap-2">
              <div v-if="group?.profilePic" class="avatar-large">
                <img :src="profileUrl" alt="Profile" />
              </div>
              <div v-else class="group-avatar">
                {{ getInitials(group?.title) }}
              </div>
              <h2 class="mb-0">{{ group?.title }}</h2>
            </div>

            <!-- Action Buttons (Right side) -->
            <div class="ms-auto d-flex gap-2">
              <!-- Edit Group Button -->
              <button
                class="btn btn-sm btn-action-icon"
                @click="openEditGroupModal"
                title="Edit Group"
                :disabled="isLoadingAction"
              >
                <i class="fa-solid fa-gear"></i>
              </button>

              <!-- Leave Group Button -->
              <button
                class="btn btn-sm btn-action-icon btn-danger-subtle"
                @click="leaveGroup"
                title="Leave Group"
                :disabled="isLoadingAction"
              >
                <i class="fa-solid fa-sign-out-alt"></i>
              </button>
            </div>
          </div>

          <!-- Balances Section -->
          <div class="balances-section mb-4">
            <div class="d-flex justify-content-between align-items-start">
              <div class="balance-info">
                <div
                  v-for="item in topThreeBalances"
                  :key="item.person + '-' + item.type"
                  class="balance-item mb-2"
                >
                  <span
                    v-if="item.type === 'owe'"
                    class="text-danger-custom fw-semibold"
                  >
                    You owe ₹{{ item.amount.toFixed(2) }} to
                    {{ getUserNamesById(item.person) }}
                  </span>

                  <span v-else class="text-success-custom fw-semibold">
                    {{ getUserNamesById(item.person) }} owes you ₹{{
                      item.amount.toFixed(2)
                    }}
                  </span>
                </div>

                <div
                  v-if="remainingBalanceCount > 0"
                  class="text-muted-custom small mt-2"
                  @click="showSettleUpModal"
                  style="cursor: pointer"
                >
                  + {{ remainingBalanceCount }} more…
                </div>

                <div v-if="isAllSettled" class="text-muted-custom">
                  🎉 You are all settled up in this group.
                </div>
              </div>

              <!-- Settle Up Button -->
              <button
                @click="showSettleUpModal"
                class="btn btn-sm btn-outline-primary fw-semibold"
                :disabled="!userBalances || userBalances.length === 0"
                title="Settle your balances"
              >
                Settle up
              </button>
            </div>
          </div>

          <!-- Group Members Section -->
          <div class="group-members-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Members ({{ group?.members?.length || 0 }})</h5>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="openAddMembersModal"
                title="Add Members"
                :disabled="isLoadingAction"
              >
                <i class="fa-solid fa-user-plus"></i> Add Member
              </button>
            </div>

            <!-- Members List -->
            <div class="members-list">
              <div
                v-if="group?.members && group.members.length > 0"
                class="list-group"
              >
                <div
                  v-for="member in group.members"
                  :key="member.id"
                  class="list-group-item d-flex align-items-center"
                >
                  <div class="member-avatar me-3">
                    {{ member.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-grow-1">
                    <div class="member-name">{{ member.name }}</div>
                  </div>
                  <span v-if="member.id === user?.id" class="badge bg-info">
                    You
                  </span>
                </div>
              </div>
              <div v-else class="text-muted text-center py-3">
                No members in this group yet
              </div>
            </div>
          </div>
        </div>

        <!-- Settlement Modal -->
        <GroupSettlement
          v-if="isShowSettleUpModal"
          :group="group"
          :userBalances="userBalances"
          @close="closeSettleUpModal"
          @settlement="onSettlementSuccess"
        />
      </div>
    </div>

    <!-- Modals via Router -->
    <router-view
      v-if="$route.name === 'AddGroupMembers'"
      :friends="getFriends"
      :selected-members="selectedMembers"
      :exclude-members="group?.members || []"
      :current-user-id="user?.id"
      :search-query="searchQuery"
      :email-input="emailInput"
      :loading="false"
      :is-submitting="isAddingMembers"
      :error="memberSelectorError"
      :success-message="memberSelectorSuccess"
      @close="closeMemberSelector"
      @add-by-email="handleAddByEmail"
      @add-friend="handleAddFriend"
      @remove-member="handleRemoveMember"
      @submit="handleSubmitMembers"
      @update:searchQuery="searchQuery = $event"
      @update:emailInput="emailInput = $event"
      @clear-error="memberSelectorError = ''"
      @clear-success="memberSelectorSuccess = ''"
    ></router-view>
    <router-view v-else></router-view>
  </div>
</template>

<script src="./GroupDetails.js" />
<style src="./GroupDetails.css" scoped />
