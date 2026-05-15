<template>
  <div class="modal-overlay">
    <div
      :class="[
        'modal-container',
        currentStep === 3 ? 'modal-wide' : 'modal-narrow',
      ]"
    >
      <div class="modal-header">
        <button
          v-if="currentStep > 1"
          class="back-btn"
          @click="goToPreviousStep"
        >
          ←
        </button>
        <h2>{{ getHeaderTitle }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div v-if="currentStep === 1" class="tabs">
        <button
          :class="['tab', { active: activeTab === 'groups' }]"
          @click="handleTabChange('groups')"
        >
          Groups
        </button>
        <button
          :class="['tab', { active: activeTab === 'friends' }]"
          @click="handleTabChange('friends')"
        >
          Friends
        </button>
      </div>

      <div class="modal-content-wrapper">
        <transition
          :name="isBackward ? 'slide-content-backward' : 'slide-content'"
          mode="out-in"
          appear
        >
          <!-- Step 1: Groups/Friends Selection -->
          <div v-if="currentStep === 1" key="step-1" class="modal-content">
            <SelectionList
              :type="activeTab"
              :selected-ids="currentSelectedIds"
              @update:selected-ids="updateSelectedIds"
              @add-new="handleAddNew"
            />
          </div>

          <!-- Step 2: Group Members Selection -->
          <div v-else-if="currentStep === 2" key="step-2" class="modal-content">
            <MemberSelection
              :groupId="selectedGroupId"
              :selected-members="selectedMembers"
              @update:selected-members="updateSelectedMembers"
            />
          </div>

          <!-- Step 3: Expense Form -->
          <div
            v-else-if="currentStep === 3"
            key="step-3"
            class="modal-content no-padding"
          >
            <ExpenseForm
              :participants="finalParticipants"
              :current-user="currentUser"
              :backend-error="backendError"
              @submit="handleSubmit"
              @cancel="closeModal"
              @clear-backend-error="backendError = ''"
            />
          </div>
        </transition>
      </div>

      <div v-if="currentStep < 3" class="modal-footer">
        <button
          class="btn btn-primary btn-block"
          :disabled="!canProceed"
          @click="goToNextStep"
        >
          Next
        </button>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script src="./AddExpenseModal.js" />
<style src="./AddExpenseModal.css" scoped />
