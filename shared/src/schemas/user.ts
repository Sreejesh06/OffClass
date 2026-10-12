import { z } from "zod";

// Match the DB houses
export const HouseEnum = z.enum(["RED", "BLUE", "GREEN", "PURPLE"]);
export type House = z.infer<typeof HouseEnum>;

// Match the DB roles
export const RoleEnum = z.enum(["STUDENT", "TEACHER", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

// Base user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  house: HouseEnum,
  role: RoleEnum,
  points: z.number().int().min(0).default(0),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  workDomain: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const SignupPayloadSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: PasswordSchema,
  name: z.string().min(1, "Name is required"),
});
export type SignupPayload = z.infer<typeof SignupPayloadSchema>;

export const LoginPayloadSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => Boolean(data.username || data.email), {
  message: "Username or email is required",
  path: ["username"],
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

// Payload to update a user's profile
export const UpdateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  githubHandle: z.string().optional(),
  codeforcesHandle: z.string().optional(),
  htbHandle: z.string().optional(),
});

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;