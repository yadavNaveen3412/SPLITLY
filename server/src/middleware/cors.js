import cors from "cors";

const allowedOrigins = [
  `http://localhost:${process.env.FRONTEND_PORT}`,
  `http://localhost:${process.env.PORT}`,
];

export const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow server-side requests
  return allowedOrigins.includes(origin);
};

// HTTP CORS Middleware
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

// WebSocket client origin check
export const verifyWebSocketOrigin = (info, done) => {
  const origin = info.origin;

  if (isAllowedOrigin(origin)) {
    return done(true);
  } else {
    return done(false, 403, "Forbidden");
  }
};
