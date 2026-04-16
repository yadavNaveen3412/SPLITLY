<template>
  <div class="main" :class="{ 'modal-open': isModalOpen || isShowMembersOpen }">
    <div class="container my-4">
      <div class="whole-section mt-4 pt-3 border-top">
        <!-- Group Header Card -->
        <div class="group-header-card">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <!-- Back Button -->
              <button
                class="btn btn-link text-muted p-0 mb-2"
                @click="goBack"
                title="Groups"
              >
                <i class="fa-solid fa-arrow-left"></i>
              </button>

              <h2 class="">{{ group?.title }}</h2>
              <p class="text-muted" v-if="group?.description">
                {{ group.description }}
              </p>
            </div>
            <!-- Action Buttons -->
            <div class="d-flex gap-2 align-items-center">
              <button
                class="btn btn-action"
                @click="isModalOpen = true"
                title="Add Member"
              >
                <i class="fa-solid fa-user-plus"></i>
              </button>
              <button
                class="btn btn-action"
                title="View Members"
                @click="isShowMembersOpen = true"
              >
                <i class="fa-solid fa-users"></i>
                <span class="member-count">{{ group?.members.length }}</span>
              </button>
              <button
                class="btn btn-action"
                @click="editGroup"
                title="Edit Group"
              >
                <i class="fa-solid fa-edit"></i>
              </button>
            </div>
          </div>
          <!-- Balances Section -->
          <div
            class="d-flex justify-content-between align-items-center mt-3 mb-3"
          >
            <div class="balances-section">
              <div
                v-for="item in topThreeBalances"
                :key="item.person + '-' + item.type"
                class="mb-1"
              >
                <span
                  v-if="item.type === 'owe'"
                  class="text-danger fw-semibold"
                >
                  You owe ₹{{ item.amount.toFixed(2) }} to
                  {{ getUserNamesById(item.person) }}
                </span>

                <span v-else class="text-success fw-semibold">
                  {{ getUserNamesById(item.person) }} owes you ₹{{
                    item.amount.toFixed(2)
                  }}
                </span>
              </div>

              <div
                v-if="remainingBalanceCount > 0"
                class="text-muted small mt-1"
                @click="showSettleUpModal"
                style="cursor: pointer"
              >
                + {{ remainingBalanceCount }} more…
              </div>

              <div v-if="isAllSettled" class="text-muted">
                🎉You are all settled up in this group.
              </div>
            </div>

            <!-- Settle up -->
            <div>
              <button
                @click="showSettleUpModal"
                class="settle-up-btn fw-semibold"
                :disabled="!userBalances || userBalances.length === 0"
                title="Settle your balances"
              >
                Settle up
              </button>

              <GroupSettlement
                v-if="isShowSettleUpModal"
                :group="group"
                :userBalances="userBalances"
                @close="closeSettleUpModal"
                @settlement="onSettlementSuccess"
              />
            </div>
          </div>

          <!-- Expenses Section -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Expenses</h5>
            <button
              class="btn rounded-pill add-expense-button"
              @click="goToAddExpense"
            >
              <i class="fa-solid fa-plus"></i> Add Expense
            </button>
          </div>
          <!-- group activity List -->
          <div
            v-if="currentActivities.length > 0 || pastActivities.length > 0"
            class="expenses-list"
          >
            <div
              v-for="activity in visibleCurrentActivities"
              :key="'current-' + activity.id"
              class="mb-3"
            >
              <div
                v-if="activity.type === 'EXPENSE'"
                class="expense-card"
                @click="openExpenseModal(activity.id)"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-2">
                      <div class="expense-icon me-3">
                        <i :class="activity.category.icon"></i>
                      </div>
                      <div>
                        <h6 class="mb-1 expense-title">{{ activity.title }}</h6>
                        <small class="text-muted">
                          {{ getPaidBySummary(activity) }}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="expense-amount">
                      ₹{{ activity.totalAmount.toFixed(2) }}
                    </div>
                    <div
                      class="expense-share mt-1"
                      :class="getShareClass(activity)"
                    >
                      {{ getYourShareText(activity) }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else-if="activity.type === 'SETTLEMENT'"
                class="settlement-card"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ getUserNamesById(activity.payer_id) }}</strong>
                    paid
                    <strong
                      >{{ getUserNamesById(activity.receiver_id) }}
                    </strong>
                    <strong> ₹{{ activity.amount.toFixed(2) }}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="currentActivities.length > visibleCurrentActivities.length"
              class="text-center mt-3"
            >
              <button
                class="btn btn-outline-secondary rounded-pill"
                @click="page++"
              >
                Load more
              </button>
            </div>
            <ExpenseDetail
              v-if="showExpenseModal"
              :expense="selectedExpense"
              @close="closeExpenseModal"
              @deleted="refreshGroup"
            />

            <div
              v-if="showSettledSeparator"
              class="text-center text-muted my-4"
            >
              <p class="fw-semibold mb-1">Expenses before this are settled</p>
              <span
                class="text-primary"
                style="cursor: pointer"
                @click="showPast = !showPast"
              >
                {{ showPast ? "Hide past activity" : "View past activity" }}
              </span>
            </div>

            <!-- PAST ACTIVITIES -->
            <div v-if="showPast">
              <div
                v-for="activity in visiblePastActivities"
                :key="'past-' + activity.id"
                class="mb-3"
              >
                <div
                  v-if="activity.type === 'EXPENSE'"
                  class="expense-card opacity-75"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2">
                        <div class="expense-icon me-3">
                          <i :class="activity.category.icon"></i>
                        </div>
                        <div>
                          <h6 class="mb-1 expense-title">
                            {{ activity.title }}
                          </h6>
                          <small class="text-muted">
                            {{ getPaidBySummary(activity) }}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div class="text-end">
                      <div class="expense-amount">
                        ₹{{ activity.totalAmount.toFixed(2) }}
                      </div>
                      <div
                        class="expense-share mt-1"
                        :class="getShareClass(activity)"
                      >
                        {{ getYourShareText(activity) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="activity.type === 'SETTLEMENT'"
                  class="settlement-card opacity-75"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{{ getUserNamesById(activity.payer_id) }}</strong>
                      paid
                      <strong
                        >{{ getUserNamesById(activity.receiver_id) }}
                      </strong>
                      <strong> ₹{{ activity.amount.toFixed(2) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="pastActivities.length > visiblePastActivities.length"
                class="text-center mt-3"
              >
                <button
                  class="btn btn-outline-secondary rounded-pill"
                  @click="pastPage++"
                >
                  Load more
                </button>
              </div>
            </div>
          </div>

          <!-- if no expenses -->
          <div v-else class="text-center text-muted py-4">
            <i class="fa-solid fa-receipt fa-2x mb-2"></i>
            <div>All settled up</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show Members Modal -->
    <div
      v-if="isShowMembersOpen"
      class="custom-modal-backdrop"
      @click.self="isShowMembersOpen = false"
    >
      <div class="custom-modal">
        <div class="modal-header">
          <h5 class="modal-title">Members</h5>
          <button
            type="button"
            class="btn-close"
            @click="isShowMembersOpen = false"
          ></button>
        </div>
        <div class="modal-body">
          <ul class="list">
            <li v-for="member in group?.members" :key="member.id">
              {{ member.user.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Add Member Modal -->
    <div
      v-if="isModalOpen"
      class="custom-modal-backdrop"
      @click.self="toggleModal"
    >
      <div class="custom-modal large">
        <div class="modal-header">
          <h5 class="modal-title">Add Members</h5>
          <button type="button" class="btn-close" @click="toggleModal"></button>
        </div>
        <div class="modal-body">
          <!-- Search/Add by Email -->
          <div class="mb-3">
            <label class="form-label fw-bold">Add by Email</label>
            <div class="input-group">
              <input
                v-model="emailInput"
                type="email"
                class="form-control"
                placeholder="Enter email address"
                maxlength="254"
                @input="checkUserExists"
              />
              <button
                v-if="emailInput"
                class="btn"
                :class="userExists ? 'btn-success' : 'btn-primary'"
                type="button"
                @click="addByEmail"
                :disabled="!isValidEmail(emailInput)"
              >
                <i
                  class="fa-solid"
                  :class="userExists ? 'fa-user-plus' : 'fa-envelope'"
                ></i>
                {{ userExists ? "Add" : "Send Invite" }}
              </button>
            </div>
            <small
              v-if="emailInput && !isValidEmail(emailInput)"
              class="text-danger"
            >
              Please enter a valid email
            </small>
            <small v-else-if="userExists === true" class="text-success">
              <i class="fa-solid fa-check"></i> User found
            </small>
            <small v-else-if="userExists === false" class="text-warning">
              <i class="fa-solid fa-info-circle"></i> User not found. Will send
              invite.
            </small>
          </div>
          <!-- Suggested Friends -->
          <div v-if="suggestedFriends?.length > 0">
            <label class="form-label fw-bold">Suggested </label>
            <div class="suggested-friends-list">
              <div
                v-for="friend in suggestedFriends"
                :key="friend.id"
                class="friend-item card mb-6"
                :class="{ selected: isSelected(friend.email) }"
              >
                <div class="card-body p-2">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="friend.email"
                      v-model="selectedFriends"
                      :id="'friend-' + friend.id"
                    />
                    <label
                      class="form-check-label d-flex align-items-center"
                      :for="'friend-' + friend.id"
                    >
                      <div>
                        <div class="fw-bold">{{ friend.name }}</div>
                        <small class="text-muted">{{ friend.email }}</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Selected Members Preview -->
          <div v-if="selectedFriends.length > 0">
            <label class="form-label fw-bold">
              Selected ({{ selectedFriends.length }})
            </label>
            <div class="d-flex flex-wrap gap-2">
              <span
                v-for="email in selectedFriends"
                :key="email"
                class="badge fs-6"
              >
                <span style="font-weight: 400"> {{ email }}</span>
                <button
                  class="removeSelectedEmail-btn"
                  @click="removeSelectedEmail(email)"
                >
                  <i class="fa-solid fa-times ms-1 text-white"></i>
                </button>
              </span>
            </div>
          </div>
          <!-- Result Message -->
          <div
            v-if="addMemberResult"
            class="alert"
            :class="addMemberResultClass"
          >
            {{ addMemberResult }}
          </div>
        </div>
        <div class="footer">
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="toggleModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleAddMembers"
              :disabled="selectedFriends.length === 0 || addingMembers"
            >
              {{
                addingMembers
                  ? "Adding..."
                  : `Add ${selectedFriends.length} Member(s)`
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Group.js"></script>
<style src="./Group.css" scoped />
