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
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const SignupPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});
export type SignupPayload = z.infer<typeof SignupPayloadSchema>;

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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