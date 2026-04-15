export const csrfMiddleware = (req, res, next) => {
  if (req.method === "POST") {
    const header = req.headers["apollo-require-preflight"];

    if (!header) {
      return res
        .status(403)
        .json({ error: "CSRF protection: missing required header" });
    }

    next();
  } else {
    next();
  }
};
