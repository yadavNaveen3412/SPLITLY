<template>
  <div class="paid-by-section">
    <h3 class="section-title">Who Paid?</h3>

    <!-- Disabled overlay if no amount -->
    <div v-if="!hasAmount" class="disabled-overlay">
      <div class="disabled-message">
        <span class="warning-icon">⚠️</span>
        <p>Please enter an amount first</p>
      </div>
    </div>

    <div class="error-padding">
      <ErrorWrapper :message="paidByError" />
    </div>

    <div class="paid-by-list">
      <!-- Current User -->
      <div
        :class="[
          'paid-by-item',
          { selected: isPaidBy(currentUser.id), disabled: !hasAmount },
        ]"
        @click="hasAmount && togglePaidBy(currentUser.id)"
      >
        <div class="participant-info">
          <div class="participant-avatar">
            {{ currentUser.name.charAt(0) }}
          </div>
          <div class="participant-name">{{ currentUser.name }}</div>
        </div>
        <div v-if="isPaidBy(currentUser.id)" class="paid-amount-input">
          <span class="currency-small">₹</span>
          <input
            :value="paidBy[currentUser.id]"
            @input="updatePaidAmount(currentUser.id, $event.target.value)"
            type="number"
            class="paid-input"
            placeholder="0.00"
            :disabled="!hasAmount"
            @focus="$event.target.select()"
            @keydown="handleKeyDown($event, currentUser.id)"
            @click.stop
          />
        </div>
        <div v-else class="check-placeholder"></div>
      </div>

      <!-- Other Participants -->
      <div
        v-for="participant in participants"
        :key="participant.id"
        :class="[
          'paid-by-item',
          { selected: isPaidBy(participant.id), disabled: !hasAmount },
        ]"
        @click="hasAmount && togglePaidBy(participant.id)"
      >
        <div class="participant-info">
          <div class="participant-avatar">
            {{ participant.name.charAt(0) }}
          </div>
          <div class="participant-name">{{ participant.name }}</div>
        </div>
        <div v-if="isPaidBy(participant.id)" class="paid-amount-input">
          <span class="currency-small">₹</span>
          <input
            :value="paidBy[participant.id]"
            @input="updatePaidAmount(participant.id, $event.target.value)"
            type="number"
            class="paid-input"
            placeholder="0.00"
            :disabled="!hasAmount"
            @focus="$event.target.select()"
            @keydown="handleKeyDown($event, participant.id)"
            @click.stop
          />
        </div>
        <div v-else class="check-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script src="./ExpensePaidBy.js" />
<style src="./ExpensePaidBy.css" scoped />
