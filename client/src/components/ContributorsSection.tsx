import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { SiGithub } from 'react-icons/si';
import {
  GitCommit,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Flame,
  Code2,
  GitPullRequest,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
  GitFork,
  BookOpen,
} from 'lucide-react';

interface ContributorWeek {
  label: string;
  commits: number;
  additions: number;
  deletions: number;
}

interface ContributorPayload {
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

interface ContributorsResponse {
  contributors: ContributorPayload[];
  aggregateWeekly: { label: string; commits: number }[];
  repoUrl: string;
  updatedAt: string;
  cached?: boolean;
}

const FALLBACK_CONTRIBUTORS: ContributorPayload[] = [
  {
    rank: 1,
    username: 'Sreejesh06',
    role: 'Lead Architect & Full-Stack',
    avatarUrl: 'https://github.com/Sreejesh06.png',
    githubUrl: 'https://github.com/Sreejesh06',
    commits: 30,
    additions: 145899,
    deletions: 26814,
    weeklyData: [
      { label: 'Sep 14', commits: 16, additions: 18200, deletions: 2400 },
      { label: 'Sep 21', commits: 2, additions: 1200, deletions: 180 },
      { label: 'Sep 28', commits: 0, additions: 0, deletions: 0 },
      { label: 'Oct 5', commits: 0, additions: 0, deletions: 0 },
      { label: 'Oct 12', commits: 12, additions: 126499, deletions: 24234 },
    ],
  },
  {
    rank: 2,
    username: 'TheSabari07',
    role: 'Core Contributor & Deep Analysis',
    avatarUrl: 'https://github.com/TheSabari07.png',
    githubUrl: 'https://github.com/TheSabari07',
    commits: 21,
    additions: 17957,
    deletions: 4556,
    weeklyData: [
      { label: 'Sep 14', commits: 0, additions: 0, deletions: 0 },
      { label: 'Sep 21', commits: 0, additions: 0, deletions: 0 },
      { label: 'Sep 28', commits: 2, additions: 162, deletions: 38 },
      { label: 'Oct 7', commits: 19, additions: 17795, deletions: 4518 },
      { label: 'Oct 5', commits: 0, additions: 0, deletions: 0 },
    ],
  },
];

const FALLBACK_AGGREGATE = [
  { label: 'Sep 14', commits: 16 },
  { label: 'Sep 21', commits: 2 },
  { label: 'Sep 28', commits: 2 },
  { label: 'Oct 5', commits: 19 },
  { label: 'Oct 12', commits: 12 },
];

export const ContributorsSection: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  // Dynamically pull contributors data from /api/contributors
  const { data, isLoading, isFetching, refetch } = useQuery<ContributorsResponse>({
    queryKey: ['contributors-telemetry'],
    queryFn: async () => {
      try {
        const res = await api.get('/contributors');
        return res.data;
      } catch (err) {
        console.warn('Using baseline telemetry fallback', err);
        return {
          contributors: FALLBACK_CONTRIBUTORS,
          aggregateWeekly: FALLBACK_AGGREGATE,
          repoUrl: 'https://github.com/Sreejesh06/OffClass',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  const contributors = data?.contributors && data.contributors.length > 0 ? data.contributors : FALLBACK_CONTRIBUTORS;
  const aggregateWeekly = data?.aggregateWeekly && data.aggregateWeekly.length > 0 ? data.aggregateWeekly : FALLBACK_AGGREGATE;
  const repoUrl = data?.repoUrl || 'https://github.com/Sreejesh06/OffClass';

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${repoUrl}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto w-full relative">
      {/* Eyebrow & Headline */}
      <div className="flex flex-col items-center text-center mb-12">
        <span className="inline-flex items-center gap-2 mb-4 px-5 py-2 bg-crypto-cyan text-black font-mono text-sm md:text-base font-bold rounded-full border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transform -rotate-1">
          <Code2 className="w-4 h-4" /> #OpenSource #Contributors
        </span>

        <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight max-w-3xl leading-[1.15]">
          Built by Builders. Powered by Code.
        </h2>

        <p className="mt-4 text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
          Dynamic GitHub contribution telemetry. Every line of code, patch, and architecture decision tracked automatically on our open-source repo.
        </p>

        {/* Start Contributing CTA Button */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-crypto-yellow text-black font-heading font-extrabold text-lg rounded-full border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <GitPullRequest className="w-5 h-5 text-black" />
            Start Contributing
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-4 bg-card text-foreground font-bold text-base rounded-full border-2 border-border hover:border-black transition-colors shadow-sm"
          >
            <SiGithub className="w-5 h-5" />
            View Repository
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Main Contributors Dashboard Container (GitHub Analytics Style) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full rounded-3xl border-4 border-black bg-[#0d1117] text-gray-200 p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#30363d]">
          <div>
            <div className="flex items-center gap-3">
              <SiGithub className="text-3xl text-white" />
              <h3 className="text-2xl font-heading font-bold text-white tracking-tight">Contributors</h3>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1f6feb]/20 border border-[#1f6feb]/40 text-[#58a6ff] text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-mono mt-1">
              Contributions per week to main, excluding merge commits • Auto-updated via GitHub API
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-xs font-mono font-medium text-gray-300">
              Period: <strong className="text-white">Last 3 months ▾</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-xs font-mono font-medium text-gray-300">
              Contributions: <strong className="text-white">Commits ▾</strong>
            </span>
            <button
              onClick={() => refetch()}
              title="Refresh telemetry"
              className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#58a6ff]' : ''}`} />
            </button>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-colors shadow-sm ml-auto md:ml-0"
            >
              Repository <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Aggregate Timeline: Commits Over Time */}
        <div className="mt-8 p-6 rounded-2xl bg-[#161b22] border border-[#30363d]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-[#58a6ff]" />
                <h4 className="text-base font-bold text-white">Commits over time</h4>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Weekly activity from repository history
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
              <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Aggregate Bar Graph */}
          <div className="relative pt-6 pb-2">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
              <div className="border-b border-[#30363d]/50 w-full flex justify-end pr-1 text-[10px] text-gray-500 font-mono">15</div>
              <div className="border-b border-[#30363d]/50 w-full flex justify-end pr-1 text-[10px] text-gray-500 font-mono">10</div>
              <div className="border-b border-[#30363d]/50 w-full flex justify-end pr-1 text-[10px] text-gray-500 font-mono">5</div>
              <div className="border-b border-[#30363d] w-full flex justify-end pr-1 text-[10px] text-gray-500 font-mono">0</div>
            </div>

            {/* Bars container */}
            <div className="relative h-44 flex items-end justify-around gap-2 px-6 z-10">
              {aggregateWeekly.map((item, idx) => {
                const maxCommits = Math.max(...aggregateWeekly.map(x => x.commits), 20);
                const heightPercent = Math.min(100, Math.max(8, (item.commits / maxCommits) * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setActiveTooltip(`agg-${idx}`)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    {/* Tooltip on hover */}
                    {activeTooltip === `agg-${idx}` && (
                      <div className="absolute -top-9 bg-black border border-[#30363d] px-2.5 py-1 rounded-md text-[11px] font-mono text-white whitespace-nowrap shadow-xl z-30">
                        {item.commits} commits on {item.label}
                      </div>
                    )}

                    {/* Commit count number on top of bar */}
                    <span className="text-[11px] font-mono font-bold text-gray-300 mb-1 group-hover:text-white">
                      {item.commits}
                    </span>

                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.08, ease: 'easeOut' }}
                      className="w-full max-w-[80px] bg-[#1f6feb] group-hover:bg-[#388bfd] rounded-t-sm transition-colors relative"
                    />

                    {/* X-axis label */}
                    <span className="text-[11px] font-mono text-gray-400 mt-2 truncate">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mini Timeline Scrubber Slider */}
            <div className="mt-6 pt-3 border-t border-[#30363d]/60 flex items-center justify-between text-[11px] font-mono text-gray-400 px-4">
              <span>Aug 2026</span>
              <span className="text-gray-300">Sep 2026</span>
              <span className="text-[#58a6ff] font-bold">Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Dynamic Contributor Cards Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contributors.map((c) => (
            <motion.div
              key={c.username}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/70 transition-all shadow-md flex flex-col justify-between"
            >
              {/* Contributor Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={c.avatarUrl}
                        alt={c.username}
                        className="w-14 h-14 rounded-full border-2 border-[#30363d] object-cover bg-[#0d1117]"
                        onError={(e) => {
                          // Fallback to github avatar if url fails
                          (e.target as HTMLImageElement).src = `https://github.com/${c.username}.png`;
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#1f6feb] text-white text-[10px] font-mono font-bold shadow-sm">
                        #{c.rank}
                      </span>
                    </div>

                    <div>
                      <a
                        href={c.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-bold text-white hover:text-[#58a6ff] transition-colors flex items-center gap-1.5"
                      >
                        {c.username}
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                      <p className="text-xs text-gray-400 font-medium">{c.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="px-2 py-0.5 rounded-full bg-[#21262d] border border-[#30363d] text-xs font-mono font-bold text-white">
                      #{c.rank}
                    </span>
                    <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                    <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Commit Summary Line with Lines Added / Removed */}
                <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-sm pt-3 border-t border-[#30363d]/60">
                  <span className="text-white font-bold flex items-center gap-1">
                    <GitCommit className="w-3.5 h-3.5 text-[#58a6ff]" /> {c.commits} commits
                  </span>
                  <span className="text-[#3fb950] font-semibold bg-[#238636]/10 px-2 py-0.5 rounded border border-[#238636]/30">
                    +{c.additions.toLocaleString()}
                  </span>
                  <span className="text-[#f85149] font-semibold bg-[#da3633]/10 px-2 py-0.5 rounded border border-[#da3633]/30">
                    -{c.deletions.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Individual Weekly Bar Histogram */}
              <div className="mt-6 pt-4 border-t border-[#30363d]/40">
                <div className="relative h-28 flex items-end justify-around gap-2 px-2">
                  {/* Gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    <div className="border-b border-[#30363d]/40 w-full" />
                    <div className="border-b border-[#30363d]/40 w-full" />
                    <div className="border-b border-[#30363d]" w-full />
                  </div>

                  {c.weeklyData.map((w, wIdx) => {
                    const maxWeekly = Math.max(...c.weeklyData.map(x => x.commits), 15);
                    const hPercent = w.commits > 0 ? Math.max(12, (w.commits / maxWeekly) * 100) : 0;
                    return (
                      <div
                        key={wIdx}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                      >
                        <span className="text-[10px] font-mono text-gray-400 mb-1 group-hover:text-white font-semibold">
                          {w.commits}
                        </span>

                        <div className="w-full max-w-[42px] h-full flex items-end">
                          {w.commits > 0 ? (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${hPercent}%` }}
                              transition={{ duration: 0.6, delay: wIdx * 0.08 }}
                              className="w-full bg-[#1f6feb] group-hover:bg-[#388bfd] rounded-t-sm"
                            />
                          ) : (
                            <div className="w-full h-[2px] bg-[#30363d]" />
                          )}
                        </div>

                        <span className="text-[10px] font-mono text-gray-400 mt-2 truncate">
                          {w.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer Badge */}
              <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1 text-gray-300">
                  <Flame className="w-3.5 h-3.5 text-crypto-yellow" />
                  {(c.additions + c.deletions).toLocaleString()} total lines changed
                </span>
                <a
                  href={c.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#58a6ff] hover:underline flex items-center gap-1 font-semibold"
                >
                  View Profile →
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Notice banner below cards */}
        <div className="mt-8 p-4 rounded-xl bg-[#161b22]/70 border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-crypto-yellow shrink-0" />
            <span>
              <strong>Automated Telemetry:</strong> When your PR is merged into <code>main</code>, GitHub automatically registers your commits and lines of code here.
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-crypto-yellow hover:underline font-bold shrink-0 flex items-center gap-1"
          >
            How it works →
          </button>
        </div>
      </motion.div>

      {/* "Start Contributing" Interactive Onboarding Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card text-card-foreground border-4 border-black rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-[10px_10px_0_0_rgba(0,0,0,1)] relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full border-2 border-black bg-muted hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-black" />
              </button>

              {/* Modal Eyebrow & Title */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-crypto-yellow text-black font-mono text-xs font-bold rounded-full border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  #OpenSource
                </span>
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  Dynamic Contributor Sync
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground mb-3">
                How to Become a Contributor
              </h3>

              <p className="text-muted-foreground font-medium text-sm mb-6 leading-relaxed">
                OffClass / Cryptid is built by students for students. When you contribute code, your GitHub stats, commits, and lines of contribution are automatically pulled and featured on the live landing page!
              </p>

              {/* 4 Steps Timeline */}
              <div className="space-y-4 mb-6">
                {/* Step 1 */}
                <div className="flex gap-4 p-3.5 rounded-2xl border-2 border-border bg-muted/40 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-crypto-purple" /> Fork the Repository
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fork <code>OffClass</code> to your GitHub account and clone it to your local machine.
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-mono">
                      <code className="truncate">{`git clone ${repoUrl}.git`}</code>
                      <button
                        onClick={handleCopyClone}
                        className="text-gray-300 hover:text-white shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {copiedClone ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{copiedClone ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 p-3.5 rounded-2xl border-2 border-border bg-muted/40 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-crypto-cyan" /> Pick a Task or Feature
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pick an open issue (CTF tools, house dashboards, security hardening, bug bounties) or propose an enhancement.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 p-3.5 rounded-2xl border-2 border-border bg-muted/40 items-start">
                  <div className="w-8 h-8 rounded-full bg-black text-white font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <GitPullRequest className="w-4 h-4 text-green-600" /> Submit a Pull Request
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Create a branch, write clean code with clear commits, and open a PR targeting the <code>main</code> branch.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4 p-3.5 rounded-2xl border-2 border-border bg-emerald-500/10 border-emerald-500/30 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> Automatic Live Inclusion!
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Once your PR is reviewed and merged, GitHub's API telemetry updates immediately. Your avatar, username, total commits, and lines of contribution appear right here!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`${repoUrl}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-5 bg-black text-white font-bold rounded-xl text-center text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <SiGithub className="w-4 h-4" /> Browse Open Issues
                </a>
                <a
                  href={`${repoUrl}/pulls`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-5 bg-card text-foreground border-2 border-border font-bold rounded-xl text-center text-sm hover:border-black transition-colors flex items-center justify-center gap-2"
                >
                  <GitPullRequest className="w-4 h-4 text-crypto-purple" /> View Pull Requests
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
