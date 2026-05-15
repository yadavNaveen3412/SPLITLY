import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../src/loaders/prisma.js";
import {
  generateShareCode,
  verifyShareCode,
} from "../../src/utils/shareCode.js";
import "dotenv/config";
import { verifyGoogleIdToken } from "../../src/utils/googleAuth.js";
import { requireAuth } from "../../src/middleware/guards.js";
import {
  sanitizeString,
  validateContact,
  validateEmail,
  validateName,
  validatePassword,
  validateProfilePic,
  validateProfilePicVersion,
  validateUUID,
} from "../../src/utils/validation.js";
import { AppError } from "../../src/utils/AppError.js";

const BCRYPT_ROUNDS = 10;

function issueJwtCookie(res, userId) {
  userId = validateUUID(userId);
  const appToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", appToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export const userResolvers = {
  User: {
    hasPassword: (parent) => !!parent.passwordHash,
  },

  Query: {
    getUser(_, __, { user }) {
      return user || null;
    },

    async getUserById(_, { userId }, __) {
      userId = validateUUID(userId);
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      return user;
    },

    findUser: requireAuth(async (_, { input }, { prisma, user }) => {
      let { email, contact, shareCode } = input;
      if (input.email) email = validateEmail(email);
      if (input.contact) contact = validateContact(contact);
      if (input.shareCode) shareCode = sanitizeString(shareCode);

      const provided = [email, contact, shareCode].filter(Boolean);

      if (provided.length < 1 || provided.length > 1) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Only one identifier can be provided at a time",
        );
      }

      if (shareCode) {
        const isValid = verifyShareCode(shareCode);
        if (!isValid)
          throw new AppError(400, "VALIDATION_ERROR", "Invalid share code");
      }

      let where = {};

      if (email) {
        where.email = email;
      } else if (contact) {
        where.contact = contact;
      } else if (shareCode) {
        where.shareCode = shareCode;
      }

      return await prisma.user.findFirst({ where });
    }),
  },

  Mutation: {
    async register(_, { input }, { prisma, res }) {
      const name = validateName(input.name);
      const email = validateEmail(input.email);
      const password = validatePassword(input.password);

      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing) {
        throw new AppError(
          409,
          "CONFLICT",
          "A user with this email already exists.",
        );
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const shareCode = generateShareCode();

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          shareCode,
        },
      });

      issueJwtCookie(res, user.id);
      return { user };
    },

    async loginWithEmail(_, { input }, { prisma, res }) {
      const email = validateEmail(input.email);
      const password = validatePassword(input.password);

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new AppError(
          401,
          "INVALID_CREDENTIALS",
          "Invalid email or password.",
        );
      }

      if (!user.passwordHash) {
        throw new AppError(
          409,
          "ACCOUNT_PROVIDER_MISMATCH",
          "This account uses Google Sign-In.",
        );
      }

      const valid = await bcrypt.compare(password, user.passwordHash);

      if (!valid) {
        throw new AppError(
          401,
          "INVALID_CREDENTIALS",
          "Invalid email or password.",
        );
      }

      issueJwtCookie(res, user.id);
      return { user };
    },

    async loginWithGoogle(_, { idToken }, { prisma, res }) {
      const payload = await verifyGoogleIdToken(idToken);
      const email = validateEmail(payload.email);
      const name = validateName(payload.name);
      const sub = payload.sub;

      // 1. Check if user already exists by googleSub
      let user = await prisma.user.findUnique({
        where: { googleSub: sub },
      });

      if (!user) {
        // 2. Check if a user exists with the same email (registered via email+password)
        const existingByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingByEmail) {
          // Link Google account to existing email user
          user = await prisma.user.update({
            where: { id: existingByEmail.id },
            data: { googleSub: sub },
          });
        } else {
          // 3. Brand new user via Google
          const shareCode = generateShareCode();
          user = await prisma.user.create({
            data: {
              googleSub: sub,
              email,
              name,
              shareCode,
            },
          });
        }
      }

      issueJwtCookie(res, user.id);
      return { user };
    },

    async logout(_, __, { res }) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return true;
    },

    updateUserDetails: requireAuth(async (_, { input }, { prisma, user }) => {
      const data = {};
      let { name, contact, profilePic, profilePicVersion } = input;
      if (name) {
        name = validateName(name);
        data.name = name;
      }
      if (contact) {
        contact = validateContact(contact);
        data.contact = contact;
      }
      if (profilePic) {
        profilePic = validateProfilePic(profilePic);
        data.profilePic = profilePic;
      }
      if (profilePicVersion !== undefined) {
        profilePicVersion = validateProfilePicVersion(profilePicVersion);
        data.profilePicVersion = profilePicVersion;
      }

      if (Object.keys(data).length === 0) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "No fields provided to update",
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data,
      });

      return updatedUser;
    }),
  },
};
