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
import { sanitizeString } from "../../src/middleware/sanitizeUserInput.js";

const BCRYPT_ROUNDS = 10;

function issueJwtCookie(res, userId) {
  const appToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
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
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      return user;
    },

    async checkUserExists(_, { email }, { prisma }) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      return !!user;
    },

    findUser: requireAuth(async (_, { input }, { prisma, user }) => {
      let { email, contact, shareCode } = input;

      contact = sanitizeString(contact);
      shareCode = sanitizeString(shareCode);

      const provided = [email, contact, shareCode].filter(Boolean);

      if (provided.length < 1 || provided.length > 1) {
        throw new Error("Only one identifier can be provided at a time");
      }

      if (shareCode) {
        const isValid = verifyShareCode(shareCode);
        if (!isValid) throw new Error("Invalid share code");
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
      let { name, email, password } = input;
      name = sanitizeString(name);

      if (!name || name.length < 3 || name.length > 50) {
        throw new Error("Name must be between 3 and 50 characters.");
      }

      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing) {
        throw new Error("A user with this email already exists.");
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
      const { email, password } = input;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error("Invalid email or password.");
      }

      if (!user.passwordHash) {
        throw new Error(
          "This account uses Google Sign-In. Please log in with Google.",
        );
      }

      const valid = await bcrypt.compare(password, user.passwordHash);

      if (!valid) {
        throw new Error("Invalid email or password.");
      }

      issueJwtCookie(res, user.id);
      return { user };
    },

    async loginWithGoogle(_, { idToken }, { prisma, res }) {
      const payload = await verifyGoogleIdToken(idToken);
      const { sub, email, name } = payload;

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
      name = sanitizeString(name);
      console.log(`Name: ${name.length}`);

      if (name !== undefined && (name.length < 3 || name.length > 50)) {
        throw new Error("Name must be between 3 and 50 characters.");
      }

      if (name !== undefined) {
        if (name === null) {
          throw new Error("Name cannot be null");
        }
        data.name = name;
      }

      if (contact !== undefined) {
        if (contact === null) {
          throw new Error("Contact cannot be null");
        }
        data.contact = contact;
      }

      if (profilePic !== undefined) {
        data.profilePic = profilePic;
      }

      if (profilePicVersion !== undefined) {
        data.profilePicVersion = profilePicVersion;
      }

      if (Object.keys(data).length === 0) {
        throw new Error("No fields provided to update");
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data,
      });

      return updatedUser;
    }),
  },
};
