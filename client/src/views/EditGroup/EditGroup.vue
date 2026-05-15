<template>
  <div class="main">
    <div class="container mt-4">
      <button
        class="btn btn-link text-muted-custom p-0 mb-3"
        @click="goBack"
        title="Groups"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h2>Edit Group</h2>
      <!-- Change Name -->
      <div class="mb-3">
        <label>Enter new Name</label>
        <input
          v-model="newGroupName"
          class="form-control"
          :placeholder="group.title"
          maxlength="50"
        />
        <button @click="handleRenameGroup" class="btn btn-primary mt-2">
          Change Name
        </button>
        <p v-if="errorMessage" class="text-danger-custom small mt-1">
          {{ errorMessage }}
        </p>
      </div>
      <!-- Leave Group -->
      <div class="mb-3">
        <button @click="handleLeaveGroup" class="btn btn-warning">
          Leave Group
        </button>
      </div>
      <!-- Delete Group -->
      <div class="mb-3" title="Only admins can delete this group.">
        <button
          @click="handleDeleteGroupAction"
          class="btn btn-danger"
          :disabled="!canDeleteGroup"
        >
          Delete Group
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./EditGroup.js" />
<style src="./EditGroup.css" scoped />
