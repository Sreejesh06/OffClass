import { z } from "zod";
import { HouseEnum } from "./user.js";

export const OpportunityTypeEnum = z.enum([
  "BUG_BOUNTY",
  "HACKATHON",
  "CTF",
  "INTERNSHIP",
  "WORKSHOP",
  "CERT_DISCOUNT",
  "OTHER",
]);
export type OpportunityType = z.infer<typeof OpportunityTypeEnum>;

export const CreateOpportunitySchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  externalUrl: z.string().url("Must be a valid URL"),
  type: OpportunityTypeEnum,
  targetHouses: z.array(HouseEnum).min(1, "Pick at least one house"),
  deadline: z.string().datetime().optional().nullable(),
});
export type CreateOpportunityPayload = z.infer<typeof CreateOpportunitySchema>;

export const UpdateOpportunitySchema = CreateOpportunitySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateOpportunityPayload = z.infer<typeof UpdateOpportunitySchema>;

export const ToggleBookmarkSchema = z.object({
  lookingForTeammate: z.boolean().optional(),
});
export type ToggleBookmarkPayload = z.infer<typeof ToggleBookmarkSchema>;
