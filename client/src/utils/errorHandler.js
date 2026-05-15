import router from "@/router/routes";
import store from "@/store";
import { useToast } from "vue-toastification";
import { normalizeApolloError } from "./normalizeApolloError";

const toast = useToast();

export async function handleApolloError(err) {
  const normalizedError = normalizeApolloError(err);

  if (normalizedError.type === "NETWORK") {
    toast.error(normalizedError.message);
    // router.push("/home");
    return;
  }

  const { code, message } = normalizedError;

  switch (code) {
    case "VALIDATION_ERROR":
      // handled locally in forms
      break;

    case "UNAUTHENTICATED":
      toast.error("Session expired");

      await store.dispatch("auth/logout");

      router.push("/login");
      break;

    case "FORBIDDEN":
      toast.error(message);
      break;

    case "NOT_FOUND":
      toast.error(message);
      break;

    case "CONFLICT":
      toast.error(message);
      break;

    case "INTERNAL_SERVER_ERROR":
    default:
      toast.error("Something went wrong");
      break;
  }
}

// Errors

// 400 VALIDATION_ERROR
// 401 UNAUTHENTICATED
// 401 INVALID_CREDENTIALS
// 403 FORBIDDEN
// 404 NOT_FOUND
// 409 CONFLICT
// 409 ACCOUNT_PROVIDER_MISMATCH
// 500 INTERNAL_SERVER_ERROR
// 503 AUTH_PROVIDER_UNAVAILABLE
