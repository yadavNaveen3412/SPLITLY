<template>
  <div class="profile-page">
    <!-- Loading Overlay -->
    <div v-if="saving" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <div v-else>
      <!-- Main Container -->
      <div class="profile-container" :class="{ 'pointer-events-none': saving }">
        <!-- LEFT COLUMN: Profile Photo & Actions -->
        <div class="profile-wrapper">
          <div class="profile-header">
            <button class="btn-back" @click="goBack">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2>Profile</h2>
          </div>

          <div class="profile-photo-section">
            <div class="photo-wrapper">
              <div class="profile-photo" @click="triggerFileInput">
                <img
                  v-if="profileData.profilePic"
                  :src="profileUrl"
                  alt="Profile"
                />
                <div v-else class="photo-placeholder">
                  {{ getInitials(profileData.name || "N A") }}
                </div>
                <div class="photo-overlay">
                  <i class="fa-solid fa-camera"></i>
                </div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="file-input"
                @change="handlePhotoChange"
              />
            </div>
            <p class="photo-hint">Click to change profile photo</p>
            <p v-if="formattedCreatedAt" class="account-created">
              <i class="fa-solid fa-calendar-check"></i>
              Account created on {{ formattedCreatedAt }}
            </p>
          </div>

          <div class="delete-account-section">
            <button class="btn-delete" @click="confirmDeleteAccount">
              <i class="fa-solid fa-trash"></i>
              Delete Account
            </button>
          </div>
        </div>

        <!-- CENTER COLUMN: Form -->
        <div class="profile-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-user"></i>
              Name
            </label>
            <div class="input-wrapper">
              <input
                v-model="profileData.name"
                type="text"
                class="form-input"
                :class="{ editing: isEditing.name }"
                :disabled="!isEditing.name"
                placeholder="Enter your name"
                maxlength="50"
              />
              <button
                v-if="!isEditing.name"
                class="btn-edit"
                @click="enableEdit('name')"
              >
                <i class="fa-solid fa-pen"></i>
              </button>
              <button v-else class="btn-save" @click="saveField('name')">
                <i class="fa-solid fa-check"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-envelope"></i>
              Email
            </label>
            <div class="input-wrapper">
              <input
                v-model="profileData.email"
                type="email"
                class="form-input"
                disabled
                placeholder="Email"
              />
              <span class="verified-badge">
                <i class="fa-solid fa-check-circle"></i>
              </span>
            </div>
            <p class="field-hint">Email cannot be changed</p>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fa-solid fa-phone"></i>
              Mobile Number
            </label>
            <div class="input-wrapper">
              <input
                v-model="profileData.contact"
                type="tel"
                class="form-input"
                :class="{ editing: isEditing.contact }"
                :disabled="!isEditing.contact"
                placeholder="Enter mobile number"
                maxlength="10"
              />
              <button
                v-if="!isEditing.contact"
                class="btn-edit"
                @click="enableEdit('contact')"
              >
                <i class="fa-solid fa-pen"></i>
              </button>
              <button v-else class="btn-save" @click="saveField('contact')">
                <i class="fa-solid fa-check"></i>
              </button>
            </div>
            <p v-if="errors.contact" class="field-error">
              {{ errors.contact }}
            </p>
          </div>

          <div class="profile-actions">
            <button class="btn btn-secondary" @click="resetChanges">
              <i class="fa-solid fa-rotate-left"></i>
              Reset Changes
            </button>
            <button
              class="btn btn-primary"
              :disabled="!hasChanges || saving"
              @click="saveProfile"
            >
              <i v-if="!saving" class="fa-solid fa-save"></i>
              <i v-else class="fa-solid fa-spinner fa-spin"></i>
              {{ saving ? "Saving..." : "Save Profile" }}
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN: Share QR -->
        <div class="share-qr">
          <h3>Share Account</h3>
          <div class="qr-card">
            <div class="qr-image-wrapper">
              <QRcodeVue :value="shareUrl" :size="140" level="M" />
            </div>
            <div class="qr-code-text">{{ profileData.shareCode }}</div>
            <button
              :class="['btn-copy-code', { copied: codeCopied }]"
              @click="copyCode"
            >
              <i
                :class="codeCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"
              ></i>
              {{ codeCopied ? "Copied!" : "Copy Code" }}
            </button>
            <p class="qr-hint">Scan QR or share code with friends</p>
            <input
              type="text"
              class="qr-code-text input-field"
              v-model="friendShareCode"
              placeholder="Enter friend's code"
            />
            <button class="btn-copy-code" @click="openAddFriendModal">
              <i class="fa-solid fa-user-plus"></i>
              Add Friend
            </button>
          </div>
        </div>
      </div>
    </div>

    <router-view></router-view>
  </div>
</template>

<script src="./ProfilePage.js"></script>
<style src="./ProfilePage.css" scoped></style>
