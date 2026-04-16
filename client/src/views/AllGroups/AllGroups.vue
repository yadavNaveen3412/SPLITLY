<template>
  <div class="main" :class="{ 'has-chat-panel': hasChatPanel }">
    <div class="container my-4">
      <button
        class="btn btn-link text-muted p-0 mb-3"
        @click="goBack"
        title="Groups"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-semibold">Your Groups</h2>
        <button @click="openModal" class="btn create-group-button">
          Create Group
        </button>
      </div>
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Loading groups...</p>
      </div>
      <!-- Groups List -->

      <div v-else-if="groups && groups.length" class="group-list">
        <div class="whole-section mt-4 p-4 border-top">
          <div
            v-for="group in localGroups"
            :key="group.id"
            class="group-row"
            @click="goToGroup(group.id)"
          >
            <div class="group-left">
              <div class="group-avatar">
                <div v-if="group.profilePic">
                  <img :src="profileUrl(group)" alt="Profile" />
                </div>
                <div v-else>
                  {{ getInitials(group.title) }}
                </div>
              </div>
              <h5 class="mb-0 text-dark fw-semibold">
                {{ group.title }}
              </h5>
            </div>
            <!-- right -->
            <div class="group-right">
              <div
                v-if="group.netBalance > 0"
                class="text-success fw-semibold text-end"
              >
                you are owed

                <div>₹{{ group.netBalance.toFixed(2) }}</div>
              </div>

              <div
                v-else-if="group.netBalance < 0"
                class="text-danger fw-semibold text-end"
              >
                you owe

                <div>₹{{ Math.abs(group.netBalance).toFixed(2) }}</div>
              </div>

              <div v-else class="text-muted small text-end">Settled</div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-muted text-center mt-4">No groups found yet.</p>
      <!-- Create Group Modal -->
      <div
        class="modal fade"
        id="createGroupModal"
        tabindex="-1"
        aria-labelledby="createGroupModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <form @submit.prevent="handleCreateGroup">
              <div class="modal-header">
                <h5 class="modal-title">Create New Group</h5>
                <button
                  type="button"
                  class="btn-close"
                  @click="closeModal"
                ></button>
              </div>
              <div class="modal-body">
                <input
                  type="text"
                  v-model="newGroupTitle"
                  class="form-control"
                  placeholder="Enter group title"
                  maxlength="50"
                  required
                />
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn create-group-button close-button"
                  @click="closeModal"
                >
                  Close
                </button>
                <button type="submit" class="btn create-group-button">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script src="./AllGroups.js" />
<style src="./AllGroups.css" scoped />
