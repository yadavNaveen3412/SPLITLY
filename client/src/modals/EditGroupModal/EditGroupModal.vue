<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h5 class="modal-title">Edit Group</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          @click="closeModal"
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
        </div>

        <!-- Group Title Input -->
        <div class="mb-4">
          <label for="groupTitleInput" class="form-label fw-600"
            >Group Title</label
          >
          <input
            id="groupTitleInput"
            v-model="groupTitle"
            type="text"
            class="form-control"
            placeholder="Enter group title"
            maxlength="50"
          />
          <small class="text-muted">Minimum 3 characters</small>
        </div>

        <!-- Group Photo Section -->
        <div class="mb-4">
          <label class="form-label fw-600">Group Photo (Optional)</label>
          <div class="photo-upload-section">
            <div v-if="profileUrl && !isRemoved" class="photo-preview">
              <img :src="profileUrl" alt="Group photo preview" />
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
                  id="editGroupPhotoInput"
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
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="isUploading"
          @click="handleSave"
        >
          <span v-if="isUploading">
            <span class="spinner-border spinner-border-sm me-2"></span>Saving...
          </span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./EditGroupModal.js" />
<style src="./EditGroupModal.css" scoped />
