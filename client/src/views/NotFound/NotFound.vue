<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- Icon/Illustration -->
      <div class="not-found-icon">
        <i class="fa-solid fa-route"></i>
      </div>

      <!-- 404 Text -->
      <div class="error-code">404</div>

      <!-- Main Message -->
      <h1 class="error-title">Page Not Found</h1>

      <!-- Description -->
      <p class="error-description">
        Oops! It looks like you've taken a wrong turn. The page you're looking
        for doesn't exist or has been moved.
      </p>

      <!-- Home Button -->
      <button class="btn-home" @click="goHome">
        <i class="fa-solid fa-home"></i>
        Back to Home
      </button>

      <!-- Additional Info -->
      <p class="error-info">
        If you think this is a mistake, please
        <router-link to="/" class="contact-link">contact support</router-link>.
      </p>
    </div>

    <!-- Decorative Background Elements -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "NotFound",
  computed: {
    ...mapGetters("auth", ["getUser"]),
  },
  methods: {
    goHome() {
      if (this.getUser) {
        // User is authenticated, go to home
        this.$router.push({ name: "Home" });
      } else {
        // User not authenticated, redirect to login
        this.$router.push({ name: "Register" });
      }
    },
  },
};
</script>

<style src="./NotFound.css" scoped />
