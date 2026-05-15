<template>
  <div class="expense-form-container">
    <!-- Left Part: Form Details -->
    <ExpenseDetails
      :form-data="formData"
      :categories="categories"
      :is-form-valid="isFormValid"
      :backend-error="backendError"
      :general-error="generalError"
      @update:form-data="updateFormData"
      @amount-change="handleAmountChange"
      @cancel="$emit('cancel')"
      @submit="handleSubmit"
    />

    <!-- Right Part: Tabs for Split & Paid By -->
    <div class="form-right">
      <div class="right-tabs">
        <button
          :class="['right-tab', { active: activeTab === 'split' }]"
          @click="activeTab = 'split'"
        >
          Split Method
        </button>
        <button
          :class="['right-tab', { active: activeTab === 'paidby' }]"
          @click="activeTab = 'paidby'"
        >
          Paid By
        </button>
      </div>

      <div class="tab-content">
        <!-- Split Tab -->
        <ExpenseSplit
          v-if="activeTab === 'split'"
          :participants="participants"
          :current-user="currentUser"
          :splits="splits"
          :split-method="formData.splitMethod"
          :total-amount="parseFloat(formData.amount) || 0"
          :has-amount="hasAmount"
          :split-error="splitError"
          :excluded-members="excludedMembersFromSplit"
          @update:split-method="handleSplitMethodChange"
          @split-update="handleSplitUpdate"
          @toggle-member="toggleMemberInSplit"
        />

        <!-- Paid By Tab -->
        <ExpensePaidBy
          v-if="activeTab === 'paidby'"
          :participants="participants"
          :current-user="currentUser"
          :paid-by="paidBy"
          :total-amount="parseFloat(formData.amount) || 0"
          :selected-paid-by="selectedPaidBy"
          :has-amount="hasAmount"
          @update:paid-by="updatePaidBy"
          @toggle-paid-by="togglePaidBy"
          @validate-paid-total="validatePaidTotal"
        />
      </div>
    </div>
  </div>
</template>

<script src="./ExpenseForm.js" />
<style src="./ExpenseForm.css" scoped />
