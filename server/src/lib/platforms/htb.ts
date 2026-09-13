import axios from "axios";

interface HtbRaw {
  id: number;
  name: string;
  user_owns: number;
  system_owns: number;
  rank: string;
  rank_id: number;
  points: number;
  respects: number;
}

// aislop-ignore: ai-slop/hardcoded-url — HackTheBox v4 API
export const fetchHtb = async (numericId: string): Promise<HtbRaw> => {
  const token = process.env.HTB_APP_TOKEN;
  if (!token) throw new Error("HTB_APP_TOKEN not configured");

  const res = await axios.get(
    `https://app.hackthebox.com/api/v4/user/profile/basic/${numericId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const profile = res.data?.profile;
  if (!profile) {
    throw new Error(
      "HTB profile not found — the user's profile may not be set to Public"
    );
  }

  return {
    id: profile.id,
    name: profile.name,
    user_owns: profile.user_owns ?? 0,
    system_owns: profile.system_owns ?? 0,
    rank: profile.rank ?? "Noob",
    rank_id: profile.rank_id ?? 0,
    points: profile.points ?? 0,
    respects: profile.respects ?? 0,
  };
};

export const parseHtb = (raw: HtbRaw) => ({
  userOwns: raw.user_owns,
  systemOwns: raw.system_owns,
  rank: raw.rank,
  points: raw.points,
});
