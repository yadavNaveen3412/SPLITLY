
export default {
  name: "RegisterPage",
  data() {
    return {
      isRegisterMode: false,
      name: "",
      email: "",
      password: "",
    };
  },
  computed: {
    error() {
      return this.$store.getters["auth/getError"];
    },
    loading() {
      return this.$store.getters["auth/isLoading"];
    },
    errorMessage() {
      if (!this.error) return "";
      // GraphQL errors come wrapped
      return this.error?.message || this.error?.graphQLErrors?.[0]?.message || "Something went wrong";
    },
  },
  methods: {
    async handleSubmit() {
      try {
        let success;
        if (this.isRegisterMode) {
          success = await this.$store.dispatch("auth/register", {
            name: this.name,
            email: this.email,
            password: this.password,
          });
        } else {
          success = await this.$store.dispatch("auth/loginWithEmail", {
            email: this.email,
            password: this.password,
          });
        }
        if (success) {
          this.$router.push("/home");
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    },

    async handleGoogleLogin(response) {
      try {
        if (response?.credential) {
          const data = await this.$store.dispatch("auth/login", {
            idToken: response.credential,
          });
          if (data) {
            this.$router.push("/home");
          }
        }
      } catch (err) {
        console.error("Google login error:", err);
      }
    },

    toggleMode() {
      this.isRegisterMode = !this.isRegisterMode;
      this.$store.commit("auth/SET_ERROR", null);
    },
  },
};
