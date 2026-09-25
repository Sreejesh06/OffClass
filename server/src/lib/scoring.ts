import { prisma } from "./db.js";
import { AchievementCategory, House } from "@prisma/client";

// Framework defined category weights (must sum to 100)
export const CATEGORY_WEIGHTS: Record<AchievementCategory, number> = {
  [AchievementCategory.COMPETITION]: 0.25,
  [AchievementCategory.CYBER_RANGE]: 0.15,
  [AchievementCategory.SKILL_BADGES]: 0.15,
  [AchievementCategory.RESEARCH]: 0.10,
  [AchievementCategory.INNOVATION]: 0.10,
  [AchievementCategory.INDUSTRY_ENGAGEMENT]: 0.10,
  [AchievementCategory.LEADERSHIP_MENTORING]: 0.05,
  
  // Framework combines Learning and Certification into one 5% pillar
  [AchievementCategory.LEARNING_PARTICIPATION]: 0.05,
  [AchievementCategory.CERTIFICATION]: 0, 
  
  // Framework combines OSS and Knowledge Sharing into one 5% pillar
  [AchievementCategory.OPEN_SOURCE_COMMUNITY]: 0.05,
  [AchievementCategory.KNOWLEDGE_SHARING]: 0,
  
  // The rest do not directly apply to the weighted score (or are bonuses)
  [AchievementCategory.HACKATHON]: 0,
  [AchievementCategory.CTF]: 0,
  [AchievementCategory.PUBLICATION]: 0,
  [AchievementCategory.SOC_CSIRT]: 0, // Framework missed SOC in the master table! Defaulting to 0 unless re-mapped.
  [AchievementCategory.OTHER]: 0,
};

/**
 * Recalculate the entire house score breakdown based on raw earned points and discipline.
 * This runs async to avoid blocking the HTTP request.
 */
export async function recalculateHouseScores(termName: string = "Current") {
  const houses: House[] = ["RED", "BLUE", "GREEN", "PURPLE"];

  for (const house of houses) {
    // 1. Get all approved achievements for the house in this term
    const achievements = await prisma.achievement.findMany({
      where: {
        status: "APPROVED",
        user: { house },
        semester: termName === "Current" ? null : termName
      },
      select: { category: true, pointsAwarded: true }
    });

    // 2. Sum raw points by category
    const categoryTotals: Partial<Record<AchievementCategory, number>> = {};
    for (const a of achievements) {
      if (!a.pointsAwarded) continue;
      categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.pointsAwarded;
    }

    // Note: If we combined SOC into Cyber Range or Practice, we would map it here.
    // For now, we trust the strict mapping.

    // 3. Upsert HousePoints cache using a single batch transaction
    const upsertOps = Object.values(AchievementCategory).map(category => {
      const rawPoints = categoryTotals[category] || 0;
      const weight = CATEGORY_WEIGHTS[category] || 0;
      const weightedScore = rawPoints * weight;

      return prisma.housePoints.upsert({
        where: {
          house_termName_category: { house, termName, category }
        },
        update: {
          earnedPoints: rawPoints,
          weightedScore: weightedScore
        },
        create: {
          house,
          termName,
          category,
          earnedPoints: rawPoints,
          weightedScore: weightedScore
        }
      });
    });

    await prisma.$transaction(upsertOps);
  }
}
