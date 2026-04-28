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
      <div
        class="d-flex justify-content-between fw-bold alert py-1"
        v-if="overallSettlementItem"
      >
        <span :class="overallSettlementItem.class">
          {{ overallSettlementItem.text }}
        </span>

        <button
          class="btn btn-sm btn-primary rounded-pill"
          @click="
            openConfirmationModal({
              overall: true,
              transactions: friendTransaction,
              net: net,
              friendName: friendName,
            })
          "
        >
          Settle
        </button>
      </div>
      <ul
        class="list-group mb-3"
        v-if="friendTransaction && friendTransaction.length > 0"
      >
        <li
          class="list-group-item d-flex justify-content-between align-items-center fw-semibold"
          v-for="item in friendTransaction"
          :key="item.groupId + '-' + item.person"
        >
          <span>
            <!-- GROUP TYPE -->
            <div v-if="item.groupType === 'GROUP'">
              <!-- You OWE -->
              <span v-if="item.type === 'owe'" class="text-danger-custom">
                You owe {{ friendName }} ₹{{ item.amount.toFixed(2) }} in
                <strong>{{ item.groupTitle }}</strong>
              </span>

              <!-- You are OWED -->
              <span v-else class="text-success-custom">
                {{ friendName }} owe you ₹{{ item.amount.toFixed(2) }} in
                <strong>{{ item.groupTitle }}</strong>
              </span>
            </div>

            <!--NON GROUP TYPE -->
            <div v-else-if="item.groupType === 'NON_GROUP'">
              <!-- You OWE -->
              <span v-if="item.type === 'owe'" class="text-danger-custom">
                You owe ₹{{ item.amount.toFixed(2) }} to {{ friendName }} in
                non-group expenses
              </span>

              <!-- You are OWED -->
              <span v-else class="text-success-custom">
                {{ friendName }} owes you ₹{{ item.amount.toFixed(2) }}
                in non-group expenses
              </span>
            </div>

            <!--PERSONAL TYPE -->
            <div v-else>
              <!-- You OWE -->
              <span v-if="item.type === 'owe'" class="text-danger-custom">
                You owe ₹{{ item.amount.toFixed(2) }} to
                {{ friendName }} personally
              </span>

              <!-- You are OWED -->
              <span v-else class="text-success-custom">
                {{ friendName }} owes you ₹{{ item.amount.toFixed(2) }}
                personally
              </span>
            </div>
          </span>

          <button
            class="btn btn-sm btn-primary rounded-pill"
            @click="openConfirmationModal(item)"
          >
            Settle
          </button>
        </li>
      </ul>
      <p v-else class="text-success-custom fw-bold">
        You are all settled up here 🎉
      </p>

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

<script src="./PersonalSettlement.js" />
<style src="./PersonalSettlement.css" scoped />
