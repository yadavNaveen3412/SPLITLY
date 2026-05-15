import { handleApolloError } from "@/utils/errorHandler";
import ErrorWrapper from "@/components/ui/ErrorWrapper/ErrorWrapper.vue";

export default {
  name: "RegisterPage",
  components: {
    ErrorWrapper,
  },
  data() {
    return {
      isRegisterMode: false,
      name: "",
      email: "",
      password: "",
      generalError: "",
    };
  },
  computed: {
    loading() {
      return this.$store.getters["auth/isLoading"];
    },
  },
  methods: {
    async handleSubmit() {
      try {
        this.generalError = "";
        let success;
        if (this.isRegisterMode) {
          if (this.name.length < 3 || this.name.length > 50) {
            this.generalError = "Name must be between 3 and 50 characters.";
            return;
          }
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
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.generalError = gqlError.message;
        }
      }
    },

    async handleGoogleLogin(response) {
      try {
        this.generalError = "";
        if (response?.credential) {
          const data = await this.$store.dispatch("auth/login", {
            idToken: response.credential,
          });
          if (data) {
            this.$router.push("/home");
          }
        }
      } catch (error) {
        handleApolloError(error);

        const gqlError = error.graphQLErrors?.[0];
        if (gqlError?.extensions?.code === "VALIDATION_ERROR") {
          this.generalError = gqlError.message;
        }
      }
    },

    toggleMode() {
      this.isRegisterMode = !this.isRegisterMode;
      this.generalError = "";
    },
  },
  watch: {
    name() {
      this.generalError = "";
    },
    email() {
      this.generalError = "";
    },
    password() {
      this.generalError = "";
    },
  },
};
