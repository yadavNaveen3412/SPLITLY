<template>
  <div class="container">
    <!-- Top Row: Welcome Card and Balance Cards -->
    <div class="row mb-4 g-4">
      <!-- Welcome Card (Left) -->
      <div class="col-lg-5">
        <div class="card welcome-card h-100 shadow-sm">
          <div class="card-body text-center py-5">
            <div v-if="loading">
              <p>Loading user data...</p>
            </div>
            <h2 v-else class="mb-2">
              <div v-if="user">Welcome, {{ user.name }} 👋</div>
            </h2>
            <p class="text-muted-custom">
              Here's a quick look at your balances
            </p>
          </div>
        </div>
      </div>

      <!-- Balance Cards (Middle/Right) -->
      <div class="col-lg-7">
        <div class="row g-3 h-100">
          <!-- You are owed Card -->
          <div class="col-md-6">
            <div class="card balance-card-owed h-100 shadow-sm">
              <div class="card-body py-4">
                <h5 class="balance-title-owed mb-3">You are owed</h5>
                <h3 class="balance-amount-owed fw-bold">
                  ₹ {{ balances.owedToYou }}
                </h3>
              </div>
            </div>
          </div>

          <!-- You owe Card -->
          <div class="col-md-6">
            <div class="card balance-card-owe h-100 shadow-sm">
              <div class="card-body py-4">
                <h5 class="balance-title-owe mb-3">You owe</h5>
                <h3 class="balance-amount-owe fw-bold">
                  ₹ {{ balances.youOwe }}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Feature Cards -->
    <div class="row g-4">
      <!-- Groups Card -->
      <div class="col-lg-4 col-md-6">
        <div class="card h-100 shadow-sm hover-card" @click="goToGroups">
          <div class="card-body text-center py-5">
            <img :src="GroupImage" alt="Groups" class="mb-3" />
            <h5 class="card-title">Groups</h5>
            <p class="card-text">View & manage all your group expenses.</p>
          </div>
        </div>
      </div>

      <!-- Friend Expenses Card -->
      <div class="col-lg-4 col-md-6">
        <div class="card h-100 shadow-sm hover-card" @click="goToFriend">
          <div class="card-body text-center py-5">
            <img :src="FriendImage" alt="Friends" class="mb-3" />
            <h5 class="card-title">Friends</h5>
            <p class="card-text">Track expenses between friends.</p>
          </div>
        </div>
      </div>

      <!-- General Expenses Card -->
      <div class="col-lg-4 col-md-6">
        <div class="card h-100 shadow-sm hover-card" @click="goToGeneral">
          <div class="card-body text-center py-5">
            <img :src="ExpenseImage" alt="General" class="mb-3" />
            <h5 class="card-title">General Expenses</h5>
            <p class="card-text">See overall owed and owing balance.</p>
          </div>
        </div>
      </div>
    </div>

    <router-view></router-view>
  </div>
</template>

<script src="./Home.js" />
<style src="./Home.css" scoped />
