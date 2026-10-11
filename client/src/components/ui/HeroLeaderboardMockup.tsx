import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Star,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { api } from '../../lib/api';

type HouseTab = 'overall' | 'RED' | 'BLUE' | 'GREEN' | 'PURPLE';

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  name: string;
  house: 'RED' | 'BLUE' | 'GREEN' | 'PURPLE';
  points: number;
  avatar: string | null;
}

const HOUSE_CONFIG = {
  RED: {
    label: 'Red House (Lion)',
    specialty: 'The Offensive Force • Adversary Simulation',
    color: '#ef4444',
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    barColor: 'bg-red-500',
  },
  BLUE: {
    label: 'Blue House (Wolf)',
    specialty: 'The Defensive Shield • Resilient Systems & SOC',
    color: '#3b82f6',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    barColor: 'bg-blue-500',
  },
  GREEN: {
    label: 'Green House (Phoenix)',
    specialty: 'The Innovation Engine • DevSecOps, AppSec & Research',
    color: '#10b981',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    barColor: 'bg-emerald-500',
  },
  PURPLE: {
    label: 'Purple House (Panther)',
    specialty: 'The Strategic Mind • OSINT, GRC & Strategy',
    color: '#a855f7',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    barColor: 'bg-purple-500',
  },
};

const getAvatarUrl = (id: string, name: string, avatar: string | null) => {
  if (avatar && avatar.startsWith('data:image')) return avatar;
  const seed = avatar || name || id;
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;
};

export function HeroLeaderboardMockup() {
  const [activeTab, setActiveTab] = useState<HouseTab>('overall');

  // 1. Fetch Real-time Leaderboard for the active tab
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['hero-leaderboard', activeTab],
    queryFn: async () => {
      const endpoint =
        activeTab === 'overall'
          ? '/leaderboard/overall'
          : `/leaderboard/house/${activeTab}`;
      const res = await api.get(endpoint);
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // 2. Fetch Real-time House Cup Standings (Hall of Fame)
  const { data: hallOfFameData } = useQuery({
    queryKey: ['hero-hall-of-fame'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/hall-of-fame');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // Process Live House Cup Stats
  const houseStandings = useMemo(() => {
    const list = hallOfFameData?.houseStandings || [
      { name: 'Green', points: 123541 },
      { name: 'Purple', points: 122458 },
      { name: 'Blue', points: 102028 },
      { name: 'Red', points: 69421 },
    ];
    const total = list.reduce((sum: number, h: any) => sum + (h.points || 0), 0) || 1;
    const sorted = [...list].sort((a: any, b: any) => b.points - a.points);
    return {
      list,
      sorted,
      total,
      leader: sorted[0] || { name: 'Green', points: 0 },
    };
  }, [hallOfFameData]);

  // Process Entries
  const entries: LeaderboardEntry[] = useMemo(() => {
    return leaderboardData?.leaderboard || [];
  }, [leaderboardData]);

  const top3 = entries.slice(0, 3);
  const runnersUp = entries.slice(3, 6);

  return (
    <div className="w-full rounded-3xl border border-black/15 dark:border-white/10 bg-card text-card-foreground shadow-[0_24px_50px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)] relative z-10 overflow-hidden text-left font-sans select-none backdrop-blur-md">
      {/* ─────────────────────────────────────────────────────────────
          1. BROWSER CHROME BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="h-12 border-b border-border bg-muted/40 flex items-center px-4 justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400 border border-red-500/30" />
          <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/30" />
          <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/30" />

          {/* Interactive URL Pill */}
          <div className="ml-3 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 border border-border text-xs font-mono text-muted-foreground shadow-xs">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>cryptid.sece.ac.in/leaderboard</span>
          </div>
        </div>

        {/* Live Redis & DB Telemetry */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live DB &bull; Real-time
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HOUSE CUP REAL-TIME WAR BAR (Aggregated from Real Points)
         ───────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center text-xs font-heading font-black border border-white/10 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-crypto-yellow" />
            </span>
            <span className="font-heading font-extrabold text-sm text-foreground tracking-tight">
              House Cup Battle
            </span>
            <span className="text-xs font-mono font-bold text-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {houseStandings.leader.name} House leading ({(houseStandings.leader.points / 1000).toFixed(1)}k pts)
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {(houseStandings.total / 1000).toFixed(1)}k Total Verified Points
          </span>
        </div>

        {/* Stacked 4-House Territory Bar (Real Percentages) */}
        <div className="flex h-3 w-full rounded-full overflow-hidden border border-border bg-muted/50 shadow-inner">
          {['Red', 'Blue', 'Green', 'Purple'].map((hName) => {
            const hData = houseStandings.list.find(
              (x: any) => x.name.toLowerCase() === hName.toLowerCase()
            );
            const pts = hData?.points || 0;
            const pct = Math.max(5, (pts / houseStandings.total) * 100);
            const colorClass =
              hName === 'Red'
                ? 'bg-red-500'
                : hName === 'Blue'
                ? 'bg-blue-500'
                : hName === 'Green'
                ? 'bg-emerald-500'
                : 'bg-purple-500';

            return (
              <div
                key={hName}
                style={{ width: `${pct}%` }}
                className={`${colorClass} h-full transition-all duration-500`}
                title={`${hName}: ${pts.toLocaleString()} pts (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Real-time Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-mono font-bold pt-2">
          {['Red', 'Blue', 'Green', 'Purple'].map((hName) => {
            const hData = houseStandings.list.find(
              (x: any) => x.name.toLowerCase() === hName.toLowerCase()
            );
            const pts = hData?.points || 0;
            const textClass =
              hName === 'Red'
                ? 'text-red-500'
                : hName === 'Blue'
                ? 'text-blue-500'
                : hName === 'Green'
                ? 'text-emerald-500'
                : 'text-purple-500';

            return (
              <div key={hName} className={textClass}>
                {hName}: {(pts / 1000).toFixed(1)}k pts
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. REAL-TIME HOUSE FILTER TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between flex-wrap gap-3 border-b border-border bg-card">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-foreground">
            {activeTab === 'overall' ? 'Department Overall Leaderboard' : HOUSE_CONFIG[activeTab].label}
          </h3>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            {activeTab === 'overall'
              ? 'Real-time ranking of verified cadets across all four houses'
              : HOUSE_CONFIG[activeTab].specialty}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border">
          {(
            [
              { id: 'overall', label: 'Overall' },
              { id: 'RED', label: 'Red' },
              { id: 'BLUE', label: 'Blue' },
              { id: 'GREEN', label: 'Green' },
              { id: 'PURPLE', label: 'Purple' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 border border-black/10 dark:border-white/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. PODIUM TOP 3 CARDS (Real Students from Database)
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 bg-muted/20 min-h-[380px]">
        {isLeaderboardLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6 py-12">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl border-2 border-border bg-card/60 animate-pulse flex flex-col items-center justify-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-muted mb-4" />
                <div className="h-4 w-28 bg-muted rounded mb-2" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : top3.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
            {/* Rank #2 (Silver) */}
            {top3[1] && (
              <Link
                to={`/profile/${top3[1].id}`}
                className="group block order-2 md:order-1"
              >
                <motion.div
                  key={`rank-2-${top3[1].id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-card p-5 flex flex-col items-center text-center shadow-[0_12px_30px_-8px_rgba(0,0,0,0.35)] relative hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground font-mono text-xs font-black border border-border">
                    #2
                  </div>
                  <div className="w-16 h-16 rounded-full border border-black/20 dark:border-white/15 overflow-hidden bg-muted mb-3 shadow-md mt-1 group-hover:scale-105 transition-transform">
                    <img
                      src={getAvatarUrl(top3[1].id, top3[1].name, top3[1].avatar)}
                      alt={top3[1].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-heading font-black text-base text-foreground truncate w-full group-hover:text-crypto-purple transition-colors">
                    {top3[1].name}
                  </h4>
                  <span
                    className={`inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      HOUSE_CONFIG[top3[1].house]?.border || 'border-border'
                    } ${HOUSE_CONFIG[top3[1].house]?.bg || 'bg-muted'} ${
                      HOUSE_CONFIG[top3[1].house]?.text || 'text-foreground'
                    }`}
                  >
                    {top3[1].house} House
                  </span>
                  <div className="mt-4 flex items-center gap-1.5 font-heading font-black text-xl text-foreground">
                    <Star className="w-4 h-4 text-crypto-yellow fill-crypto-yellow" />
                    <span>{top3[1].points.toLocaleString()}</span>
                    <span className="text-xs font-mono font-bold text-muted-foreground">pts</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-bold">
                    {top3[1].previousRank > top3[1].rank ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{top3[1].previousRank - top3[1].rank} rank jump</span>
                      </>
                    ) : top3[1].previousRank < top3[1].rank ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-500">
                          -{top3[1].rank - top3[1].previousRank} rank
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-muted-foreground">Holding rank</span>
                      </>
                    )}
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Rank #1 (Gold Champion - Elevated) */}
            {top3[0] && (
              <Link
                to={`/profile/${top3[0].id}`}
                className="group block order-1 md:order-2"
              >
                <motion.div
                  key={`rank-1-${top3[0].id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-b from-crypto-yellow/15 via-card to-card p-6 flex flex-col items-center text-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.45)] relative md:-translate-y-3 border-t-3 border-t-crypto-yellow hover:-translate-y-4 transition-transform cursor-pointer"
                >
                  <div className="absolute -top-3.5 px-3 py-1 rounded-full bg-crypto-yellow text-black font-heading font-black text-xs border border-black/20 shadow-sm flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-black fill-black" />
                    <span>RANK #1</span>
                  </div>
                  <div className="w-20 h-20 rounded-full border-2 border-black/20 dark:border-white/20 overflow-hidden bg-muted mb-3 shadow-lg mt-2 ring-4 ring-crypto-yellow/20 group-hover:scale-105 transition-transform">
                    <img
                      src={getAvatarUrl(top3[0].id, top3[0].name, top3[0].avatar)}
                      alt={top3[0].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-heading font-black text-lg text-foreground truncate w-full group-hover:text-crypto-purple transition-colors">
                    {top3[0].name}
                  </h4>
                  <span
                    className={`inline-block mt-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                      HOUSE_CONFIG[top3[0].house]?.border || 'border-border'
                    } ${HOUSE_CONFIG[top3[0].house]?.bg || 'bg-muted'} ${
                      HOUSE_CONFIG[top3[0].house]?.text || 'text-foreground'
                    }`}
                  >
                    {top3[0].house} House
                  </span>
                  <div className="mt-4 flex items-center gap-1.5 font-heading font-black text-2xl text-foreground">
                    <Star className="w-5 h-5 text-crypto-yellow fill-crypto-yellow" />
                    <span>{top3[0].points.toLocaleString()}</span>
                    <span className="text-xs font-mono font-bold text-muted-foreground">pts</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>
                      Lead by +{Math.max(0, top3[0].points - (top3[1]?.points || 0)).toLocaleString()} pts
                    </span>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Rank #3 (Bronze) */}
            {top3[2] && (
              <Link
                to={`/profile/${top3[2].id}`}
                className="group block order-3"
              >
                <motion.div
                  key={`rank-3-${top3[2].id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-card p-5 flex flex-col items-center text-center shadow-[0_12px_30px_-8px_rgba(0,0,0,0.35)] relative hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-xs font-black border border-amber-300/40">
                    #3
                  </div>
                  <div className="w-16 h-16 rounded-full border border-black/20 dark:border-white/15 overflow-hidden bg-muted mb-3 shadow-md mt-1 group-hover:scale-105 transition-transform">
                    <img
                      src={getAvatarUrl(top3[2].id, top3[2].name, top3[2].avatar)}
                      alt={top3[2].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-heading font-black text-base text-foreground truncate w-full group-hover:text-crypto-purple transition-colors">
                    {top3[2].name}
                  </h4>
                  <span
                    className={`inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      HOUSE_CONFIG[top3[2].house]?.border || 'border-border'
                    } ${HOUSE_CONFIG[top3[2].house]?.bg || 'bg-muted'} ${
                      HOUSE_CONFIG[top3[2].house]?.text || 'text-foreground'
                    }`}
                  >
                    {top3[2].house} House
                  </span>
                  <div className="mt-4 flex items-center gap-1.5 font-heading font-black text-xl text-foreground">
                    <Star className="w-4 h-4 text-crypto-yellow fill-crypto-yellow" />
                    <span>{top3[2].points.toLocaleString()}</span>
                    <span className="text-xs font-mono font-bold text-muted-foreground">pts</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-zinc-500 font-bold">
                    <Minus className="w-3.5 h-3.5" />
                    <span>Holding position</span>
                  </div>
                </motion.div>
              </Link>
            )}
          </div>
        ) : (
          <div className="py-12 text-center font-mono text-muted-foreground text-sm">
            No cadets placed yet in this house.
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. REAL RUNNERS-UP TABLE ROWS (#4, #5, #6)
           ───────────────────────────────────────────────────────────── */}
        {runnersUp.length > 0 && (
          <div className="space-y-2">
            {runnersUp.map((cadet) => (
              <Link
                key={cadet.id}
                to={`/profile/${cadet.id}`}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-card shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-transform cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-muted/80 border border-border flex items-center justify-center font-mono font-black text-xs text-foreground">
                    #{cadet.rank}
                  </span>
                  <div className="w-9 h-9 rounded-full border border-black/15 dark:border-white/10 overflow-hidden bg-muted shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={getAvatarUrl(cadet.id, cadet.name, cadet.avatar)}
                      alt={cadet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-foreground group-hover:text-crypto-purple transition-colors">
                        {cadet.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          HOUSE_CONFIG[cadet.house]?.border || 'border-border'
                        } ${HOUSE_CONFIG[cadet.house]?.bg || 'bg-muted'} ${
                          HOUSE_CONFIG[cadet.house]?.text || 'text-foreground'
                        }`}
                      >
                        {cadet.house}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {HOUSE_CONFIG[cadet.house]?.specialty || 'Cybersecurity Cadet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-heading font-black text-sm text-foreground">
                      <Star className="w-3.5 h-3.5 text-crypto-yellow fill-crypto-yellow" />
                      <span>{cadet.points.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground">pts</p>
                  </div>

                  <div className="w-6 text-center font-mono text-xs font-bold">
                    {cadet.previousRank > cadet.rank ? (
                      <span className="text-emerald-500 flex items-center justify-center gap-0.5" title="Rank improved">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </span>
                    ) : cadet.previousRank < cadet.rank ? (
                      <span className="text-red-500 flex items-center justify-center gap-0.5" title="Rank dropped">
                        <TrendingDown className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground" title="Rank unchanged">
                        <Minus className="w-3.5 h-3.5 mx-auto" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Link to Full Leaderboard */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">
            Showing top live standings &bull; Resets every term
          </span>
          <Link
            to="/leaderboard"
            className="font-bold text-foreground hover:text-crypto-purple flex items-center gap-1 transition-colors"
          >
            <span>Explore Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
