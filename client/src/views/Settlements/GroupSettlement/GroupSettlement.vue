<template>
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
      <h5 class="card-title pb-3 fw-semibold">
        Which balance do you want to settle?
      </h5>

      <ul
        class="list-group mb-3"
        v-if="userBalances && userBalances.length > 0"
      >
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
          v-for="item in userBalances"
          :key="item"
        >
          <span>
            <span
              v-if="item.type === 'owe'"
              class="text-danger-custom fw-semibold"
            >
              You owe ₹{{ item.amount.toFixed(2) }} to
              {{ getUserName(item.person) }}
            </span>
            <span v-else class="text-success-custom fw-semibold">
              {{ getUserName(item.person) }} owes you ₹{{
                item.amount.toFixed(2)
              }}
            </span>
          </span>

          <button
            class="btn btn-sm btn-primary rounded-pill"
            @click="openConfirmationModal(item)"
          >
            Settle
          </button>
        </li>
      </ul>
      <p v-else class="text-success-custom fw-bold">You are all settled up</p>
      <ConfirmSettlement
        v-if="showConfirmModal"
        @close="closeConfirmationModal"
        :selectedUser="selectedUserItem"
        :group="group"
        @settlement="handleSettlement"
      />
    </div>
  </div>
</template>

<script src="./GroupSettlement.js" />
<style src="./GroupSettlement.css" scoped />
