import { Router, type Request, type Response } from "express";

const router = Router();

export interface ContributorWeek {
  label: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface ContributorPayload {
  rank: number;
  username: string;
  role: string;
  avatarUrl: string;
  githubUrl: string;
  commits: number;
  additions: number;
  deletions: number;
  weeklyData: ContributorWeek[];
}

export interface ContributorsResponse {
  contributors: ContributorPayload[];
  aggregateWeekly: { label: string; commits: number }[];
  repoUrl: string;
  updatedAt: string;
  cached: boolean;
}

// Fallback baseline in case GitHub API is unreachable or computing stats (HTTP 202)
const FALLBACK_CONTRIBUTORS: ContributorPayload[] = [
  {
    rank: 1,
    username: "Sreejesh06",
    role: "Lead Architect & Full-Stack",
    avatarUrl: "https://github.com/Sreejesh06.png",
    githubUrl: "https://github.com/Sreejesh06",
    commits: 30,
    additions: 145899,
    deletions: 26814,
    weeklyData: [
      { label: "Sep 14", commits: 16, additions: 18200, deletions: 2400 },
      { label: "Sep 21", commits: 2, additions: 1200, deletions: 180 },
      { label: "Sep 28", commits: 0, additions: 0, deletions: 0 },
      { label: "Oct 5", commits: 0, additions: 0, deletions: 0 },
      { label: "Oct 12", commits: 12, additions: 126499, deletions: 24234 },
    ],
  },
  {
    rank: 2,
    username: "TheSabari07",
    role: "Core Contributor & Deep Analysis",
    avatarUrl: "https://github.com/TheSabari07.png",
    githubUrl: "https://github.com/TheSabari07",
    commits: 21,
    additions: 17957,
    deletions: 4556,
    weeklyData: [
      { label: "Sep 14", commits: 0, additions: 0, deletions: 0 },
      { label: "Sep 21", commits: 0, additions: 0, deletions: 0 },
      { label: "Sep 28", commits: 2, additions: 162, deletions: 38 },
      { label: "Oct 7", commits: 19, additions: 17795, deletions: 4518 },
      { label: "Oct 5", commits: 0, additions: 0, deletions: 0 },
    ],
  },
];

const FALLBACK_AGGREGATE = [
  { label: "Sep 14", commits: 16 },
  { label: "Sep 21", commits: 2 },
  { label: "Sep 28", commits: 2 },
  { label: "Oct 5", commits: 19 },
  { label: "Oct 12", commits: 12 },
];

let cache: ContributorsResponse | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

async function fetchGitHubStats(): Promise<ContributorsResponse | null> {
  const repo = process.env.GITHUB_REPO || "Sreejesh06/OffClass";
  const url = `https://api.github.com/repos/${repo}/stats/contributors`;

  const headers: Record<string, string> = {
    "User-Agent": "Cryptid-App",
    "Accept": "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  // GitHub returns 202 while computing stats in background
  if (response.status === 202) {
    return cache;
  }

  if (!response.ok) {
    console.warn(`GitHub contributors API returned status ${response.status}`);
    return cache;
  }

  const rawData: any = await response.json();
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return cache;
  }

  // Sort contributors descending by total commit count
  const sorted = [...rawData].sort((a, b) => (b.total || 0) - (a.total || 0));

  const contributors: ContributorPayload[] = sorted.map((item, index) => {
    const weeks: any[] = Array.isArray(item.weeks) ? item.weeks : [];
    const additions = weeks.reduce((sum, w) => sum + (w.a || 0), 0);
    const deletions = weeks.reduce((sum, w) => sum + (w.d || 0), 0);

    // Take the most recent 5 active weekly records
    const recentWeeks: ContributorWeek[] = weeks.slice(-5).map((w) => {
      const date = new Date((w.w || 0) * 1000);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        label,
        commits: w.c || 0,
        additions: w.a || 0,
        deletions: w.d || 0,
      };
    });

    const username = item.author?.login || `Contributor ${index + 1}`;
    const role =
      index === 0
        ? "Lead Architect & Full-Stack"
        : index === 1
        ? "Core Contributor & Deep Analysis"
        : "Open Source Contributor";

    return {
      rank: index + 1,
      username,
      role,
      avatarUrl: item.author?.avatar_url || `https://github.com/${username}.png`,
      githubUrl: item.author?.html_url || `https://github.com/${username}`,
      commits: item.total || 0,
      additions,
      deletions,
      weeklyData: recentWeeks,
    };
  });

  // Calculate aggregate weekly totals
  const aggregateMap = new Map<string, number>();
  for (const c of contributors) {
    for (const w of c.weeklyData) {
      aggregateMap.set(w.label, (aggregateMap.get(w.label) || 0) + w.commits);
    }
  }

  const aggregateWeekly = Array.from(aggregateMap.entries()).map(([label, commits]) => ({
    label,
    commits,
  }));

  return {
    contributors,
    aggregateWeekly: aggregateWeekly.length > 0 ? aggregateWeekly : FALLBACK_AGGREGATE,
    repoUrl: `https://github.com/${repo}`,
    updatedAt: new Date().toISOString(),
    cached: false,
  };
}

/**
 * GET /api/contributors
 * Public endpoint to fetch real-time repository contributor telemetry.
 */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();

    // Serve from cache if fresh
    if (cache && now - lastCacheTime < CACHE_TTL_MS) {
      res.json({ ...cache, cached: true });
      return;
    }

    const fetched = await fetchGitHubStats();
    if (fetched && fetched.contributors.length > 0) {
      cache = fetched;
      lastCacheTime = now;
      res.json(fetched);
      return;
    }

    // Fallback if GitHub API is rate-limited or cold
    if (cache) {
      res.json({ ...cache, cached: true });
      return;
    }

    res.json({
      contributors: FALLBACK_CONTRIBUTORS,
      aggregateWeekly: FALLBACK_AGGREGATE,
      repoUrl: `https://github.com/${process.env.GITHUB_REPO || "Sreejesh06/OffClass"}`,
      updatedAt: new Date().toISOString(),
      cached: true,
    });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    res.json({
      contributors: FALLBACK_CONTRIBUTORS,
      aggregateWeekly: FALLBACK_AGGREGATE,
      repoUrl: `https://github.com/${process.env.GITHUB_REPO || "Sreejesh06/OffClass"}`,
      updatedAt: new Date().toISOString(),
      cached: true,
    });
  }
});

export default router;
