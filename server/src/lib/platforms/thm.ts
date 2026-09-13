import axios from "axios";

interface ThmRaw {
  username: string;
  rank: number;
  points: number;
  rooms: number;
  badges: number;
}

// aislop-ignore: ai-slop/hardcoded-url — public TryHackMe API
export const fetchThm = async (handle: string): Promise<ThmRaw> => {
  const res = await axios.get(`https://tryhackme.com/api/user/rank/${handle}`);
  const data = res.data;
  if (!data) throw new Error("THM user not found");

  return {
    username: handle,
    rank: data.userRank ?? 0,
    points: data.points ?? 0,
    rooms: data.rooms ?? 0,
    badges: data.badges ?? 0,
  };
};

export const parseThm = (raw: ThmRaw) => ({
  rank: raw.rank,
  points: raw.points,
  rooms: raw.rooms,
  badges: raw.badges,
});
