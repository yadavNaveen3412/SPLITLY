import jwt from "jsonwebtoken";

export const findUser = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
};
