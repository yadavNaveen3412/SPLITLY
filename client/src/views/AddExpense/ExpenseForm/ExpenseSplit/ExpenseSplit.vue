<template>
  <div class="split-section">
    <!-- Method Selection View -->
    <div v-if="showMethodSelection">
      <div class="split-header">
        <h3 class="split-title">Select Split Method</h3>
      </div>

      <!-- Disabled overlay if no amount -->
      <div v-if="!hasAmount" class="disabled-overlay">
        <div class="disabled-message">
          <span class="warning-icon">⚠️</span>
          <p>Please enter an amount first</p>
        </div>
      </div>

      <div class="method-selection">
        <div
          v-for="method in splitMethods"
          :key="method.value"
          class="method-card"
          :class="{ disabled: !hasAmount }"
          @click="hasAmount && selectMethod(method.value)"
        >
          <div class="method-icon">{{ method.icon }}</div>
          <div class="method-label">{{ method.label }}</div>
        </div>
      </div>
    </div>

    <!-- Participants Split View -->
    <div class="participation-split-view" v-else>
      <div class="split-header">
        <button class="back-btn-split" @click="goBackToMethodSelection">
          ←
        </button>
        <h3 class="split-title">{{ selectedMethodLabel }}</h3>
      </div>

      <!-- Split Error Message -->
      <div class="error-padding">
        <ErrorWrapper :message="splitError" />
      </div>

      <div class="participants-list">
        <!-- Current User -->
        <div
          class="participant-item"
          :class="{
            excluded:
              splitMethod === 'equal' && isMemberExcluded(currentUser.id),
          }"
        >
          <label v-if="splitMethod === 'equal'" class="participant-checkbox">
            <input
              type="checkbox"
              :checked="!isMemberExcluded(currentUser.id)"
              @change="handleToggleMember(currentUser.id)"
            />
            <span class="checkbox-custom"></span>
          </label>

          <div class="participant-info">
            <div class="participant-avatar">
              {{ currentUser.name.charAt(0) }}
            </div>
            <div class="participant-name">{{ currentUser.name }}</div>
          </div>
          <div class="participant-amount">
            <ParticipantAmount
              :participant="currentUser"
              :split-method="splitMethod"
              :amount="splits[currentUser.id]"
              :total-amount="totalAmount"
              :all-splits="splits"
              :is-excluded="isMemberExcluded(currentUser.id)"
              @update="(value) => handleSplitUpdate(currentUser.id, value)"
            />
          </div>
        </div>

        <!-- Other Participants -->
        <div
          v-for="participant in participants"
          :key="participant.id"
          class="participant-item"
          :class="{
            excluded:
              splitMethod === 'equal' && isMemberExcluded(participant.id),
          }"
        >
          <label v-if="splitMethod === 'equal'" class="participant-checkbox">
            <input
              type="checkbox"
              :checked="!isMemberExcluded(participant.id)"
              @change="handleToggleMember(participant.id)"
            />
            <span class="checkbox-custom"></span>
          </label>

          <div class="participant-info">
            <div class="participant-avatar">
              {{ participant.name.charAt(0) }}
            </div>
            <div class="participant-name">{{ participant.name }}</div>
          </div>
          <div class="participant-amount">
            <ParticipantAmount
              :participant="participant"
              :split-method="splitMethod"
              :amount="splits[participant.id]"
              :total-amount="totalAmount"
              :all-splits="splits"
              :is-excluded="isMemberExcluded(participant.id)"
              @update="(value) => handleSplitUpdate(participant.id, value)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./ExpenseSplit.js" />
<style src="./ExpenseSplit.css" scoped />
