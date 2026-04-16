<template>
  <div class="form-left">
    <div class="form-section">
      <label class="form-label">Title *</label>
      <input
        :value="formData.title"
        @input="updateField('title', $event.target.value)"
        type="text"
        class="form-input"
        placeholder="e.g., Dinner at restaurant"
        maxlength="50"
      />
    </div>

    <div class="form-section">
      <label class="form-label">Description</label>
      <textarea
        :value="formData.description"
        @input="updateField('description', $event.target.value)"
        class="form-textarea"
        placeholder="Add details about the expense..."
        rows="3"
        maxlength="255"
      ></textarea>
    </div>

    <div class="form-section">
      <label class="form-label">Amount *</label>
      <div class="amount-input-wrapper">
        <span class="currency-symbol">₹</span>
        <input
          :value="formData.amount"
          @input="handleAmountChange($event.target.value)"
          type="number"
          step="0.01"
          min="0.01"
          max="1000000"
          class="form-input amount-input"
          placeholder="0.00"
        />
      </div>
    </div>

    <div class="form-section">
      <label class="form-label">Category *</label>
      <select
        :value="formData.category"
        @change="updateField('category', $event.target.value)"
        class="form-select"
      >
        <option value="" disabled>Select category</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button
        class="btn btn-primary"
        @click="$emit('submit')"
        :disabled="!isFormValid"
      >
        Add Expense
      </button>
    </div>
  </div>
</template>

<script src="./ExpenseDetails.js"></script>
<style src="./ExpenseDetails.css" scoped></style>
