<template>
  <nav class="app-navbar shadow-sm">
    <div class="navbar-inner">
      <!-- Spacer so profile is pushed to the right -->
      <div class="navbar-spacer"></div>

      <!-- Right side: profile avatar + dropdown -->
      <div class="profile-menu" ref="menuRef">
        <button
          class="avatar-btn"
          @click="toggleMenu"
          aria-label="Account menu"
        >
          <img
            v-if="userProfileUrl"
            :src="userProfileUrl"
            class="avatar-img"
            alt="profile"
          />
          <span v-else class="avatar-initials">{{ initials }}</span>
          <span class="avatar-name">{{ userName }}</span>
          <i class="bi bi-chevron-down chevron" :class="{ open: menuOpen }"></i>
        </button>

        <transition name="dropdown">
          <div v-if="menuOpen" class="dropdown-panel">
            <!-- User info header -->
            <div class="dropdown-header">
              <div class="dh-avatar">
                <img v-if="userProfileUrl" :src="userProfileUrl" alt="" />
                <span v-else>{{ initials }}</span>
              </div>
              <div class="dh-info">
                <p class="dh-name">{{ userName }}</p>
                <p class="dh-email">{{ userEmail }}</p>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <router-link
              class="dropdown-item"
              to="/my-profile"
              @click="closeMenu"
            >
              <i class="bi bi-person-circle"></i>
              <span>My Profile</span>
            </router-link>

            <router-link
              class="dropdown-item"
              to="/my-profile"
              @click="closeMenu"
            >
              <i class="bi bi-share"></i>
              <span>Share Account</span>
            </router-link>

            <div class="dropdown-divider"></div>

            <button class="dropdown-item logout-item" @click="handleLogout">
              <i class="bi bi-box-arrow-right"></i>
              <span>Log Out</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </nav>
</template>

<script src="./NavBar.js" />
<style src="./NavBar.css" scoped />
