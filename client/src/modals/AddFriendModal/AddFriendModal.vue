<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2 v-if="!isFriend">Add Friend</h2>
        <h2 v-else>Already Friends!</h2>
        <button class="close-btn" @click="closeModal">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Search Section -->
      <div class="modal-content">
        <div v-if="!searchResult" class="search-section">
          <p class="search-hint">
            Search for friends using their email, phone number, or share code
          </p>

          <!-- Search Input Type Tabs -->
          <div class="search-tabs">
            <button
              :class="['search-tab', { active: searchType === 'email' }]"
              @click="changeSearchType('email')"
            >
              <i class="fa-solid fa-envelope"></i>
              Email
            </button>
            <button
              :class="['search-tab', { active: searchType === 'contact' }]"
              @click="changeSearchType('contact')"
            >
              <i class="fa-solid fa-phone"></i>
              Phone
            </button>
            <button
              :class="['search-tab', { active: searchType === 'shareCode' }]"
              @click="changeSearchType('shareCode')"
            >
              <i class="fa-solid fa-qrcode"></i>
              Share Code
            </button>
          </div>

          <!-- Search Input -->
          <div :key="searchType" class="search-input-wrapper">
            <i :class="['input-icon', getInputIcon]"></i>
            <input
              v-model="searchQuery"
              :type="getInputType"
              :placeholder="getPlaceholder"
              :maxlength="getMaxLength"
              class="search-input"
              @input="errorMessage = ''"
              @keyup.enter="handleSearch"
            />
            <button
              class="btn-search"
              :disabled="!searchQuery.trim() || searching"
              @click="handleSearch"
            >
              <i
                :class="
                  searching
                    ? 'fa-solid fa-spinner fa-spin'
                    : 'fa-solid fa-search'
                "
              ></i>
            </button>
          </div>

          <!-- Error Message -->
          <ErrorWrapper :message="errorMessage" />
        </div>

        <!-- Search Result Section -->
        <div v-else class="result-section">
          <div class="result-card">
            <div class="result-avatar">
              <img
                v-if="searchResult.profilePic"
                :src="getProfileUrl(searchResult)"
                alt="Profile"
              />
              <div v-else class="avatar-placeholder">
                {{ getInitials(searchResult.name) }}
              </div>
            </div>

            <div class="result-info">
              <h3 class="result-name">{{ searchResult.name }}</h3>
              <p class="result-email">
                <i class="fa-solid fa-envelope"></i>
                {{ searchResult.email }}
              </p>
              <p v-if="searchResult.contact" class="result-contact">
                <i class="fa-solid fa-phone"></i>
                {{ searchResult.contact }}
              </p>
            </div>

            <div class="result-actions">
              <button class="btn btn-secondary" @click="searchAnother">
                <i class="fa-solid fa-search"></i>
                Search Another
              </button>
              <button
                class="btn btn-primary"
                v-if="!isFriend"
                @click="addFriend"
              >
                <i
                  :class="
                    adding
                      ? 'fa-solid fa-spinner fa-spin'
                      : 'fa-solid fa-user-plus'
                  "
                ></i>
                {{ adding ? "Adding..." : "Add Friend" }}
              </button>

              <button
                class="btn btn-primary"
                v-else
                @click="addExpense(searchResult.id)"
              >
                <i class="fa-solid fa-plus"></i> Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AddFriendModal.js" />
<style src="./AddFriendModal.css" scoped />
