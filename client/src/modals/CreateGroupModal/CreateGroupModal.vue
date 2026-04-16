<template>
  <div class="modal-overlay">
    <div class="modal-container modal-narrow">
      <div class="modal-header">
        <h2>Create New Group</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-content">
        <!-- Group Title Input -->
        <div class="mb-4">
          <label class="form-label">Group Title</label>
          <input
            type="text"
            v-model="groupTitle"
            class="form-control custom-input"
            placeholder="What's this group called?"
            maxlength="50"
          />
        </div>

        <!-- Add by Email Input -->
        <div class="mb-4">
          <label class="form-label">Invite via Email</label>
          <div class="input-group">
            <input
              type="email"
              v-model="inviteEmail"
              class="form-control custom-input"
              placeholder="friend@example.com"
              @keyup.enter="addEmailMember"
            />
            <button
              class="btn btn-secondary add-email-btn"
              type="button"
              @click="addEmailMember"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Friend Selection -->
        <div class="selection-section">
          <label class="form-label">Select Friends</label>
          <BaseSelectionList
            :items="allAvailableFriends"
            v-model:selectedIds="selectedFriendIds"
            emptyTitle="No friends found"
            emptyMessage="Start by adding some friends to your account."
            emptyIcon="👤"
          />
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button class="btn btn-cancel" @click="closeModal">Cancel</button>
          <button
            class="btn btn-primary create-btn"
            :disabled="!canCreate"
            @click="handleCreate"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./CreateGroupModal.js"></script>
<style src="./CreateGroupModal.css" scoped></style>
