<template>
  <div class="main">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-content p-4">
        <div class="d-flex justify-content-end">
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>
        <!-- Top Row: Icon, Title, and Amount   -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex align-items-center min-w-0">
            <i
              :class="expense.category.icon"
              class="fs-2 me-3"
              style="color: #225750"
            ></i>
            <div class="min-w-0">
              <h4 class="mb-0 text-truncate-custom">{{ expense.title }}</h4>
              <small
                class="text-muted-custom d-block mb-2 description-text"
                :class="{ 'description-expanded': isDescriptionExpanded }"
                v-if="expense.description"
                @click="toggleDescription"
              >
                {{ displayedDescription }}
                <span v-if="shouldTruncate" class="text-primary fw-bold ms-1">
                  {{ isDescriptionExpanded ? "Show less" : "Show more" }}
                </span>
              </small>
            </div>
          </div>
          <h4
            class="mb-0 align-items-center text-success-custom flex-shrink-0 ms-3"
          >
            ₹{{ expense.totalAmount }}
          </h4>
        </div>
        <p class="mb-1 text-muted-custom">
          Added by <strong>{{ expense.createdByUser.name }}</strong> on
          {{ formatDate(expense.createdAt) }}
        </p>
        <p class="text-muted-custom mb-0" v-if="expense.updatedByUser">
          Updated by {{ expense.updatedByUser.name }} on
          {{ formatDate(expense.updatedAt) }}
        </p>

        <!-- People Section  -->
        <div class="people-diagram mt-4">
          <div class="total-amount text-success-custom fw-bold">
            ₹{{ expense.totalAmount }}
          </div>
          <div class="connections">
            <div
              v-for="person in sortedPeople"
              :key="person.id"
              class="connection-item"
            >
              <div class="line"></div>
              <div class="person-dot"></div>
              <div class="person-info" v-if="person.id === user.id">
                <strong>You</strong>
                Paid ₹{{ person.paid }} and owe
                {{ person.shared }}
              </div>
              <div class="person-info" v-else>
                <strong>{{ person.name }}</strong>
                Paid ₹{{ person.paid }} and owes
                {{ person.shared }}
              </div>
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="mt-4 d-flex justify-content-end gap-2">
          <button class="btn edit-expense-button btn-sm" @click="editExpense">
            Edit
          </button>
          <button class="btn btn-outline-danger btn-sm" @click="deleteExpense">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./ExpenseDetail.js" />
<style src="./ExpenseDetail.css" scoped />
