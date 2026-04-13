<template>
  <div class="register">
    <form @submit.prevent="handleSubmit">
      <h3 class="heading">{{ isRegisterMode ? 'Create Account' : 'Welcome Back' }}</h3>

      <div v-if="error" class="error-message">{{ errorMessage }}</div>

      <div v-if="isRegisterMode" class="form-group">
        <input
          id="register-name"
          v-model="name"
          type="text"
          class="form-input"
          placeholder="Full Name"
          required
        />
      </div>

      <div class="form-group">
        <input
          id="register-email"
          v-model="email"
          type="email"
          class="form-input"
          placeholder="Email"
          required
        />
      </div>

      <div class="form-group">
        <input
          id="register-password"
          v-model="password"
          type="password"
          class="form-input"
          placeholder="Password"
          minlength="6"
          required
        />
      </div>

      <button id="submit-btn" type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Please wait...' : (isRegisterMode ? 'Register' : 'Login') }}
      </button>

      <p class="toggle-text">
        {{ isRegisterMode ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="toggleMode">{{ isRegisterMode ? 'Login' : 'Register' }}</a>
      </p>

      <div class="divider">
        <span>or</span>
      </div>

      <div class="google-login-wrapper">
        <GoogleLogin :callback="handleGoogleLogin" />
      </div>
    </form>
  </div>
</template>
<script src="./Register.js" />
<style src="./Register.css" scoped />
