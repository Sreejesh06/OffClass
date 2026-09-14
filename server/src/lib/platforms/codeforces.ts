import axios from "axios";

interface CodeforcesRaw {
  rating: number;
  maxRating: number;
  rank: string;
  handle: string;
  submissions: Array<{ problem: { contestId: number; index: string; name: string }; verdict: string; creationTimeSeconds?: number }>;
}

// aislop-ignore: ai-slop/hardcoded-url — stable public API
export const fetchCodeforces = async (handle: string): Promise<CodeforcesRaw> => {
  const [infoRes, statusRes] = await Promise.all([
    axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
    axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=500`),
  ]);

  if (infoRes.data.status !== "OK") throw new Error("Codeforces user.info failed");
  if (statusRes.data.status !== "OK") throw new Error("Codeforces user.status failed");

  const info = infoRes.data.result[0];
  return {
    rating: info.rating ?? 0,
    maxRating: info.maxRating ?? 0,
    rank: info.rank ?? "unrated",
    handle: info.handle,
    submissions: statusRes.data.result.map((s: any) => ({
      problem: { contestId: s.problem.contestId, index: s.problem.index, name: s.problem.name },
      verdict: s.verdict,
      creationTimeSeconds: s.creationTimeSeconds,
    })),
  };
};

export const parseCodeforces = (raw: CodeforcesRaw) => {
  const solved = new Set<string>();
  const calendar: Record<string, number> = {};

  for (const s of raw.submissions) {
    if (s.creationTimeSeconds) {
      const d = new Date(s.creationTimeSeconds * 1000);
      const dateStr = d.toISOString().split("T")[0]!;
      calendar[dateStr] = (calendar[dateStr] || 0) + 1;
    }
    
    if (s.verdict === "OK") {
      solved.add(`${s.problem.contestId}-${s.problem.index}`);
    }
  }

  return {
    rating: raw.rating,
    maxRating: raw.maxRating,
    rank: raw.rank,
    solvedCount: solved.size,
    calendar,
  };
};
