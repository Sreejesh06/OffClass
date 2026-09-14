import axios from "axios";

interface GitHubRaw {
  public_repos: number;
  followers: number;
  public_gists: number;
  contributions: { date: string; count: number }[];
}

export const fetchGithub = async (handle: string): Promise<GitHubRaw> => {
  const [profileRes, contribRes] = await Promise.all([
    axios.get(`https://api.github.com/users/${handle}`, {
      headers: { "User-Agent": "Cryptid-App" },
      validateStatus: (status) => status < 500, // Handle 404 gracefully
    }),
    axios.get(`https://github.com/users/${handle}/contributions`, {
      validateStatus: (status) => status < 500,
    })
  ]);

  if (profileRes.status === 404) {
    throw new Error("GitHub user not found");
  }

  const contributions: { date: string; count: number }[] = [];
  if (contribRes.data) {
    const regex = /data-date=\"(\d{4}-\d{2}-\d{2})\" id=\"([^\"]+)\"[\s\S]*?<tool-tip [^>]*for=\"\2\"[^>]*>([^<]+)<\/tool-tip>/g;
    let match;
    while ((match = regex.exec(contribRes.data)) !== null) {
      const date = match[1];
      const text = match[3];
      let count = 0;
      if (!text.startsWith('No ')) {
        count = parseInt(text.split(' ')[0]!, 10);
      }
      if (count > 0 && date) {
        contributions.push({ date, count });
      }
    }
  }

  return {
    public_repos: profileRes.data?.public_repos ?? 0,
    followers: profileRes.data?.followers ?? 0,
    public_gists: profileRes.data?.public_gists ?? 0,
    contributions,
  };
};

export const parseGithub = (raw: GitHubRaw) => {
  const score = (raw.public_repos * 10) + (raw.followers * 5) + (raw.public_gists * 2);
  
  const calendar: Record<string, number> = {};
  for (const day of raw.contributions) {
    if (day.count > 0) {
      calendar[day.date] = day.count;
    }
  }

  return {
    public_repos: raw.public_repos,
    followers: raw.followers,
    public_gists: raw.public_gists,
    score: score,
    calendar,
  };
};
