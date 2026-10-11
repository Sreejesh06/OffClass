import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { SiGithub } from 'react-icons/si';
import {
  GitCommit,
  ExternalLink,
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
  Plus,
  Minus,
  Trophy,
} from 'lucide-react';

interface ContributorPayload {
  rank: number;
  username: string;
  role: string;
  avatarUrl: string;
  githubUrl: string;
  commits: number;
  additions: number;
  deletions: number;
}

interface ContributorsResponse {
  contributors: ContributorPayload[];
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
  },
];

export const ContributorsSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  // Dynamically pull contributors telemetry from /api/contributors
  const { data, isFetching, refetch } = useQuery<ContributorsResponse>({
    queryKey: ['contributors-telemetry'],
    queryFn: async () => {
      try {
        const res = await api.get('/contributors');
        return res.data;
      } catch (err) {
        console.warn('Using baseline telemetry fallback', err);
        return {
          contributors: FALLBACK_CONTRIBUTORS,
          repoUrl: 'https://github.com/Sreejesh06/OffClass',
          updatedAt: new Date().toISOString(),
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const contributors = data?.contributors && data.contributors.length > 0 ? data.contributors : FALLBACK_CONTRIBUTORS;
  const repoUrl = data?.repoUrl || 'https://github.com/Sreejesh06/OffClass';

  // Calculate project aggregate metrics
  const totalCommits = contributors.reduce((acc, c) => acc + c.commits, 0);
  const totalAdditions = contributors.reduce((acc, c) => acc + c.additions, 0);
  const totalDeletions = contributors.reduce((acc, c) => acc + c.deletions, 0);

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${repoUrl}.git`);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <section id="contributors" className="py-24 px-6 max-w-7xl mx-auto w-full relative scroll-mt-24">
      {/* Eyebrow & Headline */}
      <div className="flex flex-col items-center text-center mb-12">
        <span className="inline-flex items-center gap-2 mb-4 px-5 py-2 bg-crypto-cyan text-black font-mono text-sm md:text-base font-bold rounded-full border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transform -rotate-1">
          <Code2 className="w-4 h-4" /> #OpenSource #Contributors
        </span>

        <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight max-w-3xl leading-[1.15]">
          Built by Builders. Powered by Code.
        </h2>

        <p className="mt-4 text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
          Real-time contribution telemetry directly from GitHub. Recognizing the developers who engineered the department's platform.
        </p>

        {/* Start Contributing CTA Row */}
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

      {/* Main Contributors Dashboard Container */}
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
              <h3 className="text-2xl font-heading font-bold text-white tracking-tight">Repository Contributors</h3>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1f6feb]/20 border border-[#1f6feb]/40 text-[#58a6ff] text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-mono mt-1">
              Pull requests merged into main • Automatically synced via GitHub API
            </p>
          </div>

          {/* Quick Aggregate Stats Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-300 flex items-center gap-2">
              <GitCommit className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span><strong className="text-white">{totalCommits}</strong> Total Commits</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-xs font-mono text-gray-300 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-crypto-yellow" />
              <span><strong className="text-white">{(totalAdditions + totalDeletions).toLocaleString()}</strong> Lines Changed</span>
            </div>

            <button
              onClick={() => refetch()}
              title="Refresh telemetry"
              className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#58a6ff]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Contributor Cards Grid — Focused Cleanly on Contributions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contributors.map((c) => {
            const totalLines = c.additions + c.deletions;
            const rankBadgeColor =
              c.rank === 1
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-300/20 text-slate-200 border-slate-300/40';

            return (
              <motion.div
                key={c.username}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 md:p-8 rounded-2xl bg-[#161b22] border-2 border-[#30363d] hover:border-[#58a6ff]/70 transition-all shadow-lg flex flex-col justify-between relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#1f6feb]/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  {/* Contributor Profile Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar with Rank Badge */}
                      <div className="relative">
                        <img
                          src={c.avatarUrl}
                          alt={c.username}
                          className="w-16 h-16 rounded-2xl border-2 border-[#30363d] object-cover bg-[#0d1117] shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://github.com/${c.username}.png`;
                          }}
                        />
                        <span
                          className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-mono font-bold border shadow-sm flex items-center gap-0.5 ${rankBadgeColor}`}
                        >
                          <Trophy className="w-3 h-3" /> #{c.rank}
                        </span>
                      </div>

                      {/* Names & Role */}
                      <div>
                        <a
                          href={c.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-heading font-extrabold text-white hover:text-[#58a6ff] transition-colors flex items-center gap-2"
                        >
                          {c.username}
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{c.role}</p>
                      </div>
                    </div>

                    <a
                      href={c.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs font-mono font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <SiGithub className="w-3.5 h-3.5" /> Profile
                    </a>
                  </div>

                  {/* High-Impact Contribution Stats Grid */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {/* Commits */}
                    <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex flex-col">
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <GitCommit className="w-3 h-3 text-[#58a6ff]" /> Commits
                      </span>
                      <span className="text-2xl font-mono font-bold text-white tracking-tight">
                        {c.commits}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 mt-0.5">verified commits</span>
                    </div>

                    {/* Additions */}
                    <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#238636]/40 flex flex-col">
                      <span className="text-[11px] font-mono text-[#3fb950] uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Plus className="w-3 h-3 text-[#3fb950]" /> Added
                      </span>
                      <span className="text-2xl font-mono font-bold text-[#3fb950] tracking-tight">
                        +{c.additions.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-500/70 mt-0.5">lines of code</span>
                    </div>

                    {/* Deletions */}
                    <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#da3633]/40 flex flex-col">
                      <span className="text-[11px] font-mono text-[#f85149] uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Minus className="w-3 h-3 text-[#f85149]" /> Removed
                      </span>
                      <span className="text-2xl font-mono font-bold text-[#f85149] tracking-tight">
                        -{c.deletions.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-rose-500/70 mt-0.5">lines refined</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Total Code Volume & Impact */}
                <div className="mt-6 pt-4 border-t border-[#30363d] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Flame className="w-4 h-4 text-crypto-yellow" />
                    <span>
                      <strong className="text-white">{totalLines.toLocaleString()}</strong> total lines contributed
                    </span>
                  </div>

                  <a
                    href={`${repoUrl}/commits?author=${c.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    View Commits →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Real-time notice banner below cards */}
        <div className="mt-8 p-4 rounded-xl bg-[#161b22]/70 border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-crypto-yellow shrink-0" />
            <span>
              <strong>Real-Time GitHub Telemetry:</strong> When your PR merges into <code>main</code>, GitHub automatically registers your commits and lines of contribution here.
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-crypto-yellow hover:underline font-bold shrink-0 flex items-center gap-1 cursor-pointer"
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
