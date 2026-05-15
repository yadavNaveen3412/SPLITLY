export class AppError extends Error {
  constructor(statusCode = 500, code = "INTERNAL_SERVER_ERROR", message) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

/*
All Errors with code and statusCode:
400 VALIDATION_ERROR
401 UNAUTHENTICATED
401 INVALID_CREDENTIALS
403 FORBIDDEN
404 NOT_FOUND
409 CONFLICT
409 ACCOUNT_PROVIDER_MISMATCH
500 INTERNAL_SERVER_ERROR
503 AUTH_PROVIDER_UNAVAILABLE
*/
