import {
  loginRateLimiter,
  registerRateLimiter,
  expenseRateLimiter,
  mutationRateLimiter,
  queryRateLimiter,
} from "./rateLimiter.js";

export const rateLimitingMiddleware = (req, res, next) => {
  const operationName = req.body?.operationName;
  const query = req.body?.query;

  // Skip Introspection
  if (operationName === "IntrospectionQuery") {
    return next();
  }

  // Login
  if (
    operationName === "LoginWithGoogle" ||
    operationName === "LoginWithEmail"
  ) {
    return loginRateLimiter(req, res, next);
  }

  //Register
  if (operationName === "Register") {
    return registerRateLimiter(req, res, next);
  }

  // Expense related
  if (
    operationName === "CreateExpense" ||
    operationName === "UpdateExpense" ||
    operationName === "DeleteExpense" ||
    operationName === "SettleGroup"
  ) {
    return expenseRateLimiter(req, res, next);
  }

  // Other mutations

  const isMutation = /^\s*mutation\b/i.test(query);
  if (isMutation) {
    return mutationRateLimiter(req, res, next);
  }

  // Queries (default)
  return queryRateLimiter(req, res, next);
};
