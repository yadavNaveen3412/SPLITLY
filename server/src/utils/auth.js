import jwt from "jsonwebtoken";
import prisma from "../loaders/prisma.js";

export const findUser = async (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Error verifying the user from jwt:", error);
    return null;
  }
};
