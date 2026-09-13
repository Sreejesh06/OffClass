import { z } from "zod";

// Match the DB houses
export const HouseEnum = z.enum(["RED", "BLUE", "GREEN", "PURPLE"]);
export type House = z.infer<typeof HouseEnum>;

// Base user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  house: HouseEnum,
  points: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Payload to update a user's profile
export const UpdateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  githubHandle: z.string().optional(),
  codeforcesHandle: z.string().optional(),
  htbHandle: z.string().optional(),
});

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;