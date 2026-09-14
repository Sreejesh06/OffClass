import axios from "axios";

interface LeetCodeRaw {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak?: number;
  submissionCalendar: Record<string, number>;
}

export const fetchLeetCode = async (handle: string): Promise<LeetCodeRaw> => {
  const [solvedRes, calendarRes] = await Promise.all([
    axios.get(`https://alfa-leetcode-api.onrender.com/${handle}/solved`, {
      validateStatus: (s) => s < 500
    }),
    axios.get(`https://alfa-leetcode-api.onrender.com/${handle}/calendar`, {
      validateStatus: (s) => s < 500
    })
  ]);

  if (!solvedRes.data || solvedRes.data.errors || solvedRes.status === 404) {
    throw new Error("LeetCode user not found");
  }

  const data = solvedRes.data;
  
  let calendarData: Record<string, number> = {};
  if (calendarRes.data && calendarRes.data.submissionCalendar) {
    try {
      const parsedStr = typeof calendarRes.data.submissionCalendar === "string" 
        ? JSON.parse(calendarRes.data.submissionCalendar)
        : calendarRes.data.submissionCalendar;
      calendarData = parsedStr;
    } catch (e) {
      // Ignore parse error
    }
  }

  return {
    totalSolved: data.solvedProblem ?? 0,
    easySolved: data.easySolved ?? 0,
    mediumSolved: data.mediumSolved ?? 0,
    hardSolved: data.hardSolved ?? 0,
    streak: 0,
    submissionCalendar: calendarData,
  };
};

export const parseLeetCode = (raw: LeetCodeRaw) => {
  const calendar: Record<string, number> = {};
  
  for (const [timestampStr, count] of Object.entries(raw.submissionCalendar || {})) {
    const ts = parseInt(timestampStr, 10);
    if (!isNaN(ts)) {
      const d = new Date(ts * 1000);
      const dateStr = d.toISOString().split("T")[0]!;
      calendar[dateStr] = (calendar[dateStr] || 0) + count;
    }
  }

  return {
    totalSolved: raw.totalSolved,
    easySolved: raw.easySolved,
    mediumSolved: raw.mediumSolved,
    hardSolved: raw.hardSolved,
    streak: raw.streak,
    calendar,
  };
};
