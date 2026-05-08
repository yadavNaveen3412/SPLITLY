<template>
  <div
    v-if="
      (!expenses || expenses.length < 1) &&
      (!groupExpenses || groupExpenses.length < 1)
    "
    class="empty-state"
  >
    <img :src="ExpenseImage" alt="No Expenses" class="mb-2 opacity-50" />
    <p class="text-muted-custom">No expenses yet</p>
  </div>
  <div v-else class="expenses-list">
    <div
      v-for="expense in expenses"
      :key="expense.id"
      class="expense-item"
      @click="openExpenseModal(expense.id)"
    >
      <div class="expense-icon">
        <i :class="expense.category.icon"></i>
      </div>
      <div class="expense-info">
        <h6 class="mb-1">{{ expense.title }}</h6>
        <span class="expense-date">{{ formatDate(expense.createdAt) }}</span>
      </div>
      <div class="expense-amount-wrapper">
        <div class="expense-amount" :class="expense.type">
          <span v-if="expense.type === 'owed'">
            <div class="expense-amount-text">
              <h6>you lent</h6>
            </div>
            ₹{{ expense.amount.toFixed(2) }}
          </span>
          <span v-else-if="expense.type === 'owe'">
            <div class="expense-amount-text">
              <h6>you borrowed</h6>
            </div>
            ₹{{ Math.abs(expense.amount).toFixed(2) }}
          </span>
          <span v-else-if="expense.type === 'no-balance'"
            ><i>no balance</i></span
          >
          <span v-else><i>not involved</i></span>
        </div>
      </div>
    </div>
    <div v-if="groupExpenses && groupExpenses.length > 0">
      <div
        v-for="groupExpense in groupExpenses"
        :key="groupExpense.groupId"
        class="expense-item"
        @click="goToGroup(groupExpense.groupId)"
      >
        <div class="expense-icon">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="expense-info">
          <h6 class="mb-1">{{ groupExpense.groupTitle }}</h6>
          <span class="expense-date">Shared Group</span>
        </div>
        <div class="expense-amount-wrapper">
          <div class="expense-amount" :class="groupExpense.type">
            <span v-if="groupExpense.type === 'owed'">
              <div class="expense-amount-text">
                <h6>you lent</h6>
              </div>
              ₹{{ groupExpense.amount.toFixed(2) }}
            </span>
            <span v-else-if="groupExpense.type === 'owe'">
              <div class="expense-amount-text">
                <h6>you borrowed</h6>
              </div>
              ₹{{ Math.abs(groupExpense.amount).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <ExpenseDetail
      v-if="showExpenseModal"
      :expense="selectedExpense"
      @close="closeExpenseModal"
    />
  </div>
  <!-- Footer Actions -->
  <div class="panel-footer">
    <button
      class="btn btn-settle"
      @click="showSettleUpModal"
      title="Settle your balances"
    >
      <i class="fa-solid fa-handshake"></i> Settle Up
    </button>
    <PersonalSettlement
      v-if="isShowSettleUpModal"
      :friendId="id"
      @close="closeSettleUpModal"
    />
    <button class="btn btn-add-expense" @click="goToAddExpense">
      <i class="fa-solid fa-plus"></i> Add Expense
    </button>
  </div>
</template>

<script src="./ExpenseTab.js" />
<style src="./ExpenseTab.css" scoped />
