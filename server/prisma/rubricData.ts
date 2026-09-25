import { AchievementCategory } from '@prisma/client';

export const rubricData = [
  // 2. COMPETITION
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_ATTEND', description: 'Student attends a CTF', points: 5 },
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_WIN', description: 'Student wins / achieves declared winning position', points: 5 },
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_NAT_ATTEND', description: 'National-level competition participation', points: 5 },
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_NAT_WIN', description: 'National-level achievement', points: 5, isBonus: true },
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_INT_ATTEND', description: 'International competition participation', points: 10 },
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_INT_WIN', description: 'International achievement', points: 10, isBonus: true },
  { category: AchievementCategory.COMPETITION, activityKey: 'COMP_HOUSE_WIN', description: 'House/team wins a CTF', points: 5, isBonus: true },

  // 3. SKILL BADGES
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_FOUNDATION', description: 'Foundation / Explorer badge', points: 2 },
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_PRACTITIONER', description: 'Practitioner badge', points: 4 },
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_SPECIALIST', description: 'Specialist badge', points: 6 },
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_EXPERT', description: 'Expert badge', points: 8 },
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_ELITE', description: 'Elite badge', points: 10 },
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_MULTI_DOMAIN', description: 'Multi-domain badge bonus', points: 5, isBonus: true },
  { category: AchievementCategory.SKILL_BADGES, activityKey: 'BADGE_CYBER_ELITE', description: 'Cyber Elite achievement bonus', points: 10, isBonus: true },

  // 4. CERTIFICATIONS
  { category: AchievementCategory.CERTIFICATION, activityKey: 'CERT_FOUNDATION', description: 'Foundation certification', points: 5 },
  { category: AchievementCategory.CERTIFICATION, activityKey: 'CERT_INDUSTRY', description: 'Industry certification', points: 10 },
  { category: AchievementCategory.CERTIFICATION, activityKey: 'CERT_ADVANCED', description: 'Advanced technical certification', points: 15 },
  { category: AchievementCategory.CERTIFICATION, activityKey: 'CERT_PROFESSIONAL', description: 'Difficult professional certification', points: 20 },
  { category: AchievementCategory.CERTIFICATION, activityKey: 'CERT_DISTINCTION', description: 'Certification with distinction / high score', points: 5, isBonus: true },

  // 5. CYBER RANGE / PRACTICE
  { category: AchievementCategory.CYBER_RANGE, activityKey: 'RANGE_CHALLENGE', description: 'Cyber Range challenge completed', points: 2 },
  { category: AchievementCategory.CYBER_RANGE, activityKey: 'RANGE_ADVANCED', description: 'Advanced scenario completed', points: 5 },
  { category: AchievementCategory.CYBER_RANGE, activityKey: 'RANGE_ATTACK_DEFENCE', description: 'Full attack/defence scenario completed', points: 5 },
  { category: AchievementCategory.CYBER_RANGE, activityKey: 'RANGE_MONTHLY_TOP', description: 'Top performer in monthly Cyber Range challenge', points: 5 },
  { category: AchievementCategory.CYBER_RANGE, activityKey: 'RANGE_WINNER', description: 'Cyber Range challenge winner', points: 10 },

  // 6. SOC / CSIRT
  { category: AchievementCategory.SOC_CSIRT, activityKey: 'SOC_TRAINING', description: 'SOC training completed', points: 2 },
  { category: AchievementCategory.SOC_CSIRT, activityKey: 'SOC_SHIFT', description: 'SOC shift completed', points: 3 },
  { category: AchievementCategory.SOC_CSIRT, activityKey: 'SOC_INVESTIGATION', description: 'Incident investigation completed', points: 5 },
  { category: AchievementCategory.SOC_CSIRT, activityKey: 'SOC_RULE', description: 'Detection rule created', points: 5 },
  { category: AchievementCategory.SOC_CSIRT, activityKey: 'SOC_THREAT_HUNT', description: 'Threat-hunting challenge completed', points: 5 },
  { category: AchievementCategory.SOC_CSIRT, activityKey: 'SOC_OUTSTANDING', description: 'Outstanding SOC performance', points: 5 },

  // 7. RESEARCH
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_IDEA', description: 'Research idea submitted', points: 2 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_PROJECT', description: 'Research project completed', points: 5 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_APPROVED', description: 'Faculty-approved research work', points: 5 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_SUBMITTED', description: 'Paper submitted', points: 5 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_ACCEPTED', description: 'Paper accepted', points: 10 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_PRESENTATION', description: 'Conference presentation', points: 10 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_PATENT_FILED', description: 'Patent filed', points: 10 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_PATENT_GRANTED', description: 'Patent granted', points: 20 },
  { category: AchievementCategory.RESEARCH, activityKey: 'RSCH_AWARD', description: 'Research award', points: 10 },

  // 8. INNOVATION
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_IDEA', description: 'Idea submitted', points: 2 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_PROTOTYPE', description: 'Prototype', points: 5 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_WORKING_PROTO', description: 'Working prototype demonstrated', points: 10 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_INDUSTRY_POC', description: 'Industry POC', points: 15 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_PILOT', description: 'Successful pilot', points: 20 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_PATENT_PRODUCT', description: 'Patent / product', points: 20 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_STARTUP', description: 'Startup / incubation', points: 20 },
  { category: AchievementCategory.INNOVATION, activityKey: 'INNOV_WINNER', description: 'Innovation competition winner', points: 10 },

  // 9. INDUSTRY ENGAGEMENT
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_SESSION', description: 'Industry expert session attended', points: 2 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_WORKSHOP', description: 'Industry workshop attended', points: 3 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_CHALLENGE_PART', description: 'Industry challenge participation', points: 5 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_CHALLENGE_WIN', description: 'Industry challenge achievement', points: 5 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_PROJECT', description: 'Industry project', points: 10 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_POC', description: 'Industry POC', points: 15 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_INTERNSHIP', description: 'Internship completed', points: 10 },
  { category: AchievementCategory.INDUSTRY_ENGAGEMENT, activityKey: 'IND_RECOGNITION', description: 'Industry recognition', points: 5 },

  // 10. OPEN SOURCE & COMMUNITY
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'OSS_GITHUB', description: 'Cybersecurity GitHub project', points: 3 },
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'OSS_CONTRIB', description: 'Meaningful open-source contribution', points: 5 },
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'OSS_PR', description: 'Major pull request accepted', points: 5 },
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'OSS_TOOL', description: 'Cybersecurity tool developed', points: 10 },
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'OSS_RELEASE', description: 'Open-source project released', points: 10 },
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'COMM_CONTRIB', description: 'Community contribution', points: 3 },
  { category: AchievementCategory.OPEN_SOURCE_COMMUNITY, activityKey: 'COMM_SESSION', description: 'Technical session conducted', points: 5 },

  // 11. KNOWLEDGE SHARING
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_PEER', description: 'Peer teaching session', points: 3 },
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_HOUSE_SESSION', description: 'House technical session', points: 3 },
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_DEPT_SESSION', description: 'Department technical session', points: 5 },
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_WORKSHOP', description: 'Workshop conducted', points: 5 },
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_CTF_CHALLENGE', description: 'CTF challenge created', points: 5 },
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_ARTICLE', description: 'Cybersecurity article / blog', points: 3 },
  { category: AchievementCategory.KNOWLEDGE_SHARING, activityKey: 'KNOW_VIDEO', description: 'Technical video / content', points: 3 },

  // 12. LEADERSHIP & MENTORING
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_HOUSE_RESP', description: 'House responsibility', points: 3 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_EVENT_COORD', description: 'Event coordination', points: 3 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_TEAM', description: 'Team leadership', points: 5 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_CAPTAIN', description: 'Competition captain', points: 5 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_EVENT_SUCCESS', description: 'Successful event coordination', points: 5 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_MENTOR_JUNIORS', description: 'Mentoring juniors', points: 3 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_OUTSTANDING', description: 'Outstanding leadership', points: 5 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_MENTOR_SINGLE', description: 'Mentors one junior', points: 2 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_MENTOR_BADGE', description: 'Helps junior complete a badge', points: 3 },
  { category: AchievementCategory.LEADERSHIP_MENTORING, activityKey: 'LEAD_COACH_CTF', description: 'Coaches a CTF team', points: 5 },

  // 13. LEARNING & PARTICIPATION
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_ACADEMIC', description: 'Academic distinction', points: 5 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_NPTEL', description: 'NPTEL / equivalent certification', points: 5 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_COURSE', description: 'Cyber-related external course', points: 3 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_MILESTONE', description: 'Prescribed learning milestone completed', points: 2 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_EVENT', description: 'Cyber event participation', points: 2 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_HOUSE_MEETING', description: 'House meeting attendance', points: 1 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_MANDATORY', description: 'Mandatory Cyber activity attendance', points: 2 },
  { category: AchievementCategory.LEARNING_PARTICIPATION, activityKey: 'LEARN_HOUSE_EVENT', description: 'Full participation in House event', points: 3 },

  // 15. HOUSE CONTRIBUTION & BONUS
  { category: AchievementCategory.OTHER, activityKey: 'BONUS_HOUSE_CTF', description: 'Successful House-organised CTF', points: 10, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'BONUS_HOUSE_WORKSHOP', description: 'House conducts technical workshop', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'BONUS_HOUSE_CHALLENGE', description: 'House creates a CTF challenge', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'BONUS_HOUSE_CAMPAIGN', description: 'House conducts cyber-awareness campaign', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'BONUS_HOUSE_MENTOR', description: 'House mentors another House/team', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'AWARD_SPIRIT', description: 'Cyber Spirit Award', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'AWARD_MOST_IMPROVED', description: 'Most Improved Student', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'AWARD_PROBLEM_SOLVER', description: 'Best Problem Solver', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'AWARD_TEAM_PLAYER', description: 'Best Team Player', points: 5, isBonus: true },
  { category: AchievementCategory.OTHER, activityKey: 'AWARD_LEADERSHIP', description: 'Leadership Moment', points: 5, isBonus: true },
];
