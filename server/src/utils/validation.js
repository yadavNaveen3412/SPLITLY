import xss from "xss";
import { z } from "zod";
import { AppError } from "./AppError.js";

// UUID
const UUIDSchema = z
  .string({ required_error: "ID is required" })
  .pipe(z.uuid());

// Name
const NameSchema = z
  .string({
    required_error: "Name is required",
    invalid_type_error: "Name cannot be null",
  })
  .transform((val) => xss(val.trim()))
  .pipe(
    z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters"),
  );

// Group Title
const GroupTitleSchema = z
  .string({
    required_error: "Group title is required",
    invalid_type_error: "Group title cannot be null",
  })
  .transform((val) => xss(val.trim()))
  .pipe(
    z
      .string()
      .min(3, "Group title must be at least 3 characters")
      .max(50, "Group title must be at most 50 characters"),
  );

// Expense Title
const ExpenseTitleSchema = z
  .string({
    required_error: "Expense title is required",
    invalid_type_error: "Expense title cannot be null",
  })
  .transform((val) => xss(val.trim()))
  .pipe(
    z
      .string()
      .min(3, "Expense title must be at least 3 characters")
      .max(50, "Expense title must be at most 50 characters"),
  );

// Chat Message
const ChatMessageSchema = z
  .string({
    required_error: "Chat message is required",
    invalid_type_error: "Chat message cannot be null",
  })
  .transform((val) => xss(val.trim()))
  .pipe(
    z
      .string()
      .min(1, "Message cannot be empty")
      .max(1000, "Message must not exceed 1000 characters"),
  );

// Email
const EmailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Invalid email format" }));

// Password
const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be at most 100 characters");

// Amount
const AmountSchema = z.coerce
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Amount must be greater than 0")
  .max(1000000, "Amount must be less than 1,000,000")
  .refine((val) => Number.isInteger(val * 100), {
    message: "Amount can have at most 2 decimal places",
  });

// Contact
const ContactSchema = z
  .string({
    required_error: "Contact is required",
    invalid_type_error: "Contact cannot be null",
  })
  .transform((val) => val.replace(/\s+/g, ""))
  .pipe(
    z
      .string()
      .refine(
        (val) => /^(?:\+91|91)?[6-9]\d{9}$/.test(val),
        "Invalid mobile number",
      ),
  )
  .transform((val) => `+91${val.slice(-10)}`);

// Profile Pic
const ProfilePicSchema = z
  .string()
  .regex(/^(users\/[a-zA-Z0-9-]+\/avatar|groups\/[a-zA-Z0-9-]+\/image)$/);

// Profile Pic Version
const VersionSchema = z.coerce
  .number()
  .int()
  .nonnegative()
  .transform((val) => String(val));

const FilenameSchema = z.enum(["avatar", "image"]);
const groupTypeSchema = z.enum(["GROUP", "PERSONAL", "NON_GROUP"]);
const splitMethodSchema = z.enum(["equal", "unequal", "percentage", "shares"]);

const validate = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new AppError(400, "VALIDATION_ERROR", result.error.issues[0].message);
  return result.data;
};

export const sanitizeString = (value) => {
  if (typeof value !== "string") return "";
  return xss(value.trim());
};

export const validateUUID = (id) => validate(UUIDSchema, id);

export const validateName = (name) => validate(NameSchema, name);

export const validateGroupTitle = (title) => validate(GroupTitleSchema, title);

export const validateExpenseTitle = (title) =>
  validate(ExpenseTitleSchema, title);

export const validateChatMessage = (message) =>
  validate(ChatMessageSchema, message);

export const validateEmail = (email) => validate(EmailSchema, email);

export const validatePassword = (password) =>
  validate(PasswordSchema, password);

export const validateAmount = (amount) => validate(AmountSchema, amount);

export const validateContact = (contact) => validate(ContactSchema, contact);

export const validateFilename = (filename) =>
  validate(FilenameSchema, filename);

export const validateProfilePic = (profilePic) =>
  validate(ProfilePicSchema, profilePic);

export const validateProfilePicVersion = (version) =>
  validate(VersionSchema, version);

export const validateGroupType = (type) => validate(groupTypeSchema, type);

export const validateSplitMethod = (method) =>
  validate(splitMethodSchema, method);
