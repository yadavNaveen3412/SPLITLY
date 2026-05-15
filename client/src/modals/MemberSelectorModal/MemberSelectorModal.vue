<template>
  <div class="modal-overlay">
    <div class="modal-container modal-wide">
      <!-- Header -->
      <div class="modal-header">
        <h5 class="modal-title">Select Members</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="$emit('close')"
        ></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Error Alert -->
        <ErrorWrapper :message="error" />

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {{ successMessage }}
          <button
            type="button"
            class="btn-close"
            @click="$emit('clear-success')"
          ></button>
        </div>

        <!-- Email Input Section -->
        <div class="email-input-section mb-4">
          <label for="emailInput" class="form-label fw-600"
            >Invite by Email</label
          >
          <div class="input-group">
            <input
              id="emailInput"
              :value="emailInput"
              type="email"
              class="form-control"
              placeholder="Enter email address"
              @input="$emit('update:emailInput', $event.target.value)"
              @keyup.enter="$emit('add-by-email')"
            />
            <button
              class="btn btn-outline-primary"
              type="button"
              @click="$emit('add-by-email')"
            >
              Add
            </button>
          </div>
          <small class="text-muted d-block mt-2">
            Members invited by email will receive an invitation to join.
          </small>
        </div>

        <!-- Selected Members Display -->
        <div
          v-if="selectedMembers.length > 0"
          class="selected-members-section mb-4"
        >
          <label class="form-label fw-600"
            >Selected Members ({{ selectedMembers.length }})</label
          >
          <div class="selected-members-list">
            <div
              v-for="member in selectedMembers"
              :key="member.id"
              class="selected-member-item"
            >
              <div class="member-info">
                <div class="member-avatar">
                  {{ member?.name?.charAt(0).toUpperCase() }}
                </div>
                <div class="member-details">
                  <div class="member-name">{{ member.name }}</div>
                  <div v-if="member.isPending" class="member-email">
                    <small class="badge bg-warning text-dark"
                      >Pending Invite</small
                    >
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="btn-remove"
                @click="$emit('remove-member', member.id)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Search and Friends List -->
        <div class="friends-section">
          <label for="searchInput" class="form-label fw-600"
            >Or Select from Friends</label
          >
          <div class="search-box mb-3">
            <input
              id="searchInput"
              :value="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search friends..."
              @input="$emit('update:searchQuery', $event.target.value)"
            />
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <!-- Friends List -->
          <div v-else-if="filteredFriends.length > 0" class="friends-list">
            <button
              v-for="friend in filteredFriends"
              :key="friend.id || friend.friendId"
              type="button"
              class="friend-item"
              @click="$emit('add-friend', friend)"
            >
              <div class="friend-avatar">
                {{ friend?.name?.charAt(0).toUpperCase() }}
              </div>
              <div class="friend-details">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-email text-muted">{{ friend.email }}</div>
              </div>
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>

          <!-- No Friends Available -->
          <div v-else class="text-center py-4 text-muted">
            <i
              class="fas fa-users mb-2 d-block"
              style="font-size: 24px; opacity: 0.5"
            ></i>
            <p>
              {{
                searchQuery
                  ? "No friends match your search"
                  : "No available friends"
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="selectedMembers.length === 0 || isSubmitting"
          @click="$emit('submit', selectedMembers)"
        >
          <span v-if="isSubmitting">
            <span class="spinner-border spinner-border-sm me-2"></span
            >Processing...
          </span>
          <span v-else>Add Members ({{ selectedMembers.length }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./MemberSelectorModal.js" />
<style src="./MemberSelectorModal.css" scoped />
