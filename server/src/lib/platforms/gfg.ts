import axios from "axios";

interface GfgRaw {
  totalProblemsSolved: number;
  currentStreak: number;
  maxStreak: number;
  codingScore: number;
  instituteRank: string;
  heatmap: Array<{ date: string; count: number }>;
}

// aislop-ignore: ai-slop/hardcoded-url — third-party hosted wrapper
export const fetchGfg = async (handle: string): Promise<GfgRaw> => {
  const [profileRes, heatmapRes] = await Promise.all([
    axios.get(`https://gfg-stats.tashif.codes/${handle}/profile`),
    axios.get(`https://gfg-stats.tashif.codes/${handle}/heatmap`),
  ]);

  const profile = profileRes.data?.data;
  if (!profile) throw new Error("GFG profile not found");

  return {
    totalProblemsSolved: profile.totalProblemsSolved ?? 0,
    currentStreak: profile.currentStreak ?? 0,
    maxStreak: profile.maxStreak ?? 0,
    codingScore: profile.codingScore ?? 0,
    instituteRank: profile.instituteRank ?? "N/A",
    heatmap: heatmapRes.data?.data ?? [],
  };
};

export const parseGfg = (raw: GfgRaw) => {
  const calendar: Record<string, number> = {};
  
  if (Array.isArray(raw.heatmap)) {
    for (const item of raw.heatmap) {
      if (item.date && item.count) {
        calendar[item.date] = item.count;
      }
    }
  }

  return {
    totalProblemsSolved: raw.totalProblemsSolved,
    currentStreak: raw.currentStreak,
    maxStreak: raw.maxStreak,
    codingScore: raw.codingScore,
    calendar,
  };
};
