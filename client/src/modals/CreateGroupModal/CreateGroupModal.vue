<template>
  <div class="modal-overlay">
    <div class="modal-container modal-wide">
      <div class="modal-header">
        <h2>Create New Group</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-content">
        <!-- Error Alert -->
        <ErrorWrapper :message="error" />

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

        <!-- Profile Photo Upload -->
        <div class="mb-4">
          <label class="form-label">Group Photo (Optional)</label>
          <div class="photo-upload-section">
            <div v-if="profilePhotoPreview" class="photo-preview">
              <img :src="profilePhotoPreview" alt="Group photo preview" />
              <button
                type="button"
                class="btn-remove-photo"
                @click="removePhoto"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div v-else class="upload-placeholder">
              <label class="upload-label">
                <input
                  ref="photoInput"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoUpload"
                  style="display: none"
                />
                <div class="upload-content">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload group photo</p>
                  <small>JPG, PNG up to 5MB</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Add Members Button and Selected Members -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <label class="form-label mb-0">Add Members</label>
            <span
              class="badge"
              :class="memberCount >= 2 ? 'bg-success' : 'bg-warning text-dark'"
            >
              {{ memberCount }} members
            </span>
          </div>

          <!-- Selected Members Display -->
          <div
            v-if="selectedMembers.length > 0"
            class="selected-members-display mb-3"
          >
            <div
              v-for="member in selectedMembers"
              :key="member.id"
              class="member-chip"
            >
              <span>{{ member.name }}</span>
              <button
                type="button"
                class="btn-remove-member"
                @click="
                  selectedMembers = selectedMembers.filter(
                    (m) => m.id !== member.id,
                  )
                "
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Add Members Modal Button -->
          <button
            type="button"
            class="btn btn-outline-primary w-100"
            @click="openAddMembersModal"
          >
            <i class="fas fa-plus"></i> Add Members
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button class="btn btn-cancel" @click="closeModal">Cancel</button>
          <button
            class="btn btn-primary create-btn"
            :disabled="!canCreate || isUploading"
            @click="handleCreate"
          >
            <span v-if="isUploading">
              <span class="spinner-border spinner-border-sm me-2"></span
              >Creating...
            </span>
            <span v-else>Create Group</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Member Selector Modal via Router -->
    <router-view
      v-if="$route.name === 'CreateGroupAddMembers'"
      :friends="getFriends"
      :selected-members="selectedMembers"
      :exclude-members="[]"
      :current-user-id="getUser?.id"
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
  </div>
</template>

<script src="./CreateGroupModal.js" />
<style src="./CreateGroupModal.css" scoped />
