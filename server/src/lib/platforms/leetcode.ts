import axios from "axios";

interface LeetCodeRaw {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  submissionCalendar: Record<string, number>;
}

// aislop-ignore: ai-slop/hardcoded-url — stable unofficial GraphQL endpoint
export const fetchLeetCode = async (handle: string): Promise<LeetCodeRaw> => {
  const query = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
        userCalendar { submissionCalendar streak }
      }
    }
  `;

  // aislop-ignore: ai-slop/hardcoded-url — stable unofficial GraphQL endpoint
  const res = await axios.post("https://leetcode.com/graphql", {
    query,
    variables: { username: handle },
  });

  const user = res.data?.data?.matchedUser;
  if (!user) throw new Error("LeetCode user not found");

  const stats = user.submitStats.acSubmissionNum;
  const calendarStr = user.userCalendar.submissionCalendar || "{}";
  const calendar: Record<string, number> = JSON.parse(calendarStr);

  const findCount = (difficulty: string) =>
    stats.find((s: any) => s.difficulty === difficulty)?.count ?? 0;

  return {
    totalSolved: findCount("All"),
    easySolved: findCount("Easy"),
    mediumSolved: findCount("Medium"),
    hardSolved: findCount("Hard"),
    streak: user.userCalendar.streak ?? 0,
    submissionCalendar: calendar,
  };
};

export const parseLeetCode = (raw: LeetCodeRaw) => ({
  totalSolved: raw.totalSolved,
  easySolved: raw.easySolved,
  mediumSolved: raw.mediumSolved,
  hardSolved: raw.hardSolved,
  streak: raw.streak,
});
