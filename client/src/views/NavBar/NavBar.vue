<template>
  <!-- Bootstrap icons CSS -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
  />
  <nav class="navbar navbar-expand-lg shadow-lg fixed-top">
    <div class="container-fluid px-4">
      <router-link class="navbar-brand fw-bold" to="/">
        <span class="brand-icon"><i class="bi bi-wallet2"></i></span>
        <span class="brand-name px-2">SplitLy</span>
      </router-link>
      <!-- <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      > -->
      <!-- <span class="navbar-toggler-icon"></span>
      </button> -->
      <!-- <div class="collapse navbar-collapse" id="navbarNav"> -->
      <ul class="navbar-nav ms-auto">
        <!-- Not logged in -->
        <template v-if="!userLoggedIn">
          <li class="nav-item">
            <router-link class="nav-link" to="/register">
              <span class="btn btn-primary login-btn">Login</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link px-3" to="/register">
              <span class="btn btn-primary signup">Sign Up</span>
            </router-link>
          </li>
        </template>
        <!-- Logged in -->
        <template v-else>
          <li class="nav-item">
            <button
              class="nav-link btn btn-primary-custom px-3 logout-btn"
              @click="Logout"
            >
              Log Out
            </button>
          </li>
        </template>
      </ul>
    </div>
    <!-- </div> -->
  </nav>
</template>

<script src="./NavBar.js" />
<style src="./NavBar.css" scoped />
