import { useMemo, useState, useCallback } from "react";
import { type SlotItemMapArray, utils } from "swapy";
import { SwapyItem, SwapyLayout, SwapySlot } from "./ui/swapy-draggable-card";
import {
  Trophy,
  Shield,
  Terminal,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Lock,
  Gift,
  Zap,
  Radio,
  Fingerprint,
  Sparkles,
  Award,
  ChevronRight,
  GitCommit,
  Check,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 1: CTF Real-Time Skill Matrix (Gamification & Dopamine)
   ───────────────────────────────────────────────────────────────────────────── */
export function CTFScoreCard() {
  return (
    <div className="bg-emerald-600 text-white rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black group cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative overflow-hidden select-none">
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm border border-emerald-400/40 text-xs font-mono font-bold text-emerald-100">
          <Trophy className="w-3.5 h-3.5 text-yellow-300" />
          <span>Global Rank #4</span>
        </div>
        <span className="px-2.5 py-0.5 bg-yellow-300 text-black font-extrabold text-[11px] rounded-full border border-black uppercase tracking-wider font-mono">
          Top 1%
        </span>
      </div>

      {/* Main Metric */}
      <div className="relative z-10 my-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl 2xl:text-5xl font-black font-heading text-white tracking-tight">4,875</h2>
          <span className="text-emerald-200 text-xs font-mono font-bold">+320 this sprint</span>
        </div>
        <p className="text-emerald-100/90 text-xs font-mono mt-0.5">Proof-of-Skill Points</p>
      </div>

      {/* Skill Breakdown Mini Bars */}
      <div className="relative z-10 space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex justify-between text-[11px] font-mono text-emerald-100">
          <span>Web & Pwn</span>
          <span className="font-bold text-yellow-300">88% (94 Solves)</span>
        </div>
        <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-300 to-emerald-300 h-full rounded-full w-[88%]" />
        </div>
        <div className="flex justify-between items-center text-[10px] text-emerald-200/80 font-mono pt-0.5">
          <span>Target: Diamond Tier</span>
          <span>125 pts left</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 2: Live House Cup Battle (Tribal Identity & Social Competition)
   ───────────────────────────────────────────────────────────────────────────── */
export function HouseMembersCard() {
  return (
    <div className="bg-crypto-purple text-white rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-200">
          <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
          <span>House Cup War</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE
        </span>
      </div>

      {/* Center Highlight */}
      <div className="my-1">
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-4xl font-black font-heading text-white">574</h2>
          <span className="text-xs text-purple-200 font-mono">active cadets</span>
        </div>
        <p className="text-xs font-mono text-yellow-300 font-semibold mt-0.5">
          🔴 Red House leading (+1.2k pts)
        </p>
      </div>

      {/* Mini 4-House Territory Progress Bar */}
      <div className="space-y-1.5 bg-black/25 p-2.5 rounded-xl border border-white/10">
        <div className="flex justify-between text-[10px] font-mono text-purple-200">
          <span className="text-red-300 font-bold">RED 38%</span>
          <span className="text-blue-300 font-bold">BLU 29%</span>
          <span className="text-green-300 font-bold">GRN 19%</span>
          <span className="text-purple-300 font-bold">PUR 14%</span>
        </div>
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-black/40 border border-white/10">
          <div className="bg-red-500 h-full w-[38%]" />
          <div className="bg-blue-500 h-full w-[29%]" />
          <div className="bg-emerald-500 h-full w-[19%]" />
          <div className="bg-purple-400 h-full w-[14%]" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 3: Interactive Mini Hacker Terminal (Authentic Cyber Vibe)
   ───────────────────────────────────────────────────────────────────────────── */
export function TerminalSnippetCard() {
  return (
    <div className="bg-zinc-950 text-zinc-100 rounded-2xl h-full p-4 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative overflow-hidden font-mono text-xs select-none">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-[11px] text-zinc-400 font-semibold">cryptid-cli ~ v2.4</span>
        </div>
        <Terminal className="w-3.5 h-3.5 text-zinc-500" />
      </div>

      {/* Simulated Code Execution */}
      <div className="space-y-1 py-1 text-[11px] leading-tight">
        <div className="text-zinc-400">
          <span className="text-emerald-400 font-bold">$</span> pwn target --box kernel-03
        </div>
        <div className="text-zinc-400 text-[10px]">
          [+] Payload delivered: <span className="text-yellow-300">0x7ffd...c90</span>
        </div>
        <div className="text-zinc-400 text-[10px]">
          [+] Flag: <span className="text-cyan-300">CTF&#123;s3c3_k3rn3l_r00t&#125;</span>
        </div>
        <div className="text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>+250 PTS -&gt; HOUSE RED</span>
        </div>
      </div>

      {/* Terminal Footer with Pulsing Prompt */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sub-second Verification
        </span>
        <span className="text-zinc-400 font-bold">bash _</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 4: Multi-Platform Sync & Pwned Machines (Proof of Work)
   ───────────────────────────────────────────────────────────────────────────── */
export function TeamCard() {
  return (
    <div className="bg-sky-50 dark:bg-zinc-900 rounded-2xl p-5 h-full flex flex-col justify-between relative overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="bg-crypto-cyan text-black font-bold px-3 py-1 rounded-lg font-mono text-xs border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-black" />
          <span>Red Team Operations</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 font-semibold">Active Sync</span>
      </div>

      {/* Main Stats with Trend */}
      <div className="my-1">
        <p className="text-xs font-bold text-foreground/80 font-mono">Machines Pwned & Exploited</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-4xl font-black text-foreground font-heading">54</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            +40% MoM
          </span>
        </div>
      </div>

      {/* Integrated Sync Pills */}
      <div className="grid grid-cols-3 gap-2 bg-white/70 dark:bg-black/40 p-2 rounded-xl border border-border">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground font-mono">GitHub</p>
          <p className="text-xs font-bold font-mono text-foreground">142 cmt</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-[10px] text-muted-foreground font-mono">HTB Rank</p>
          <p className="text-xs font-bold font-mono text-emerald-500">Pro #12</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground font-mono">Codeforces</p>
          <p className="text-xs font-bold font-mono text-cyan-500">1,430</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 5: Polygon Soulbound Token Verification (Immutable Notary)
   ───────────────────────────────────────────────────────────────────────────── */
export function LogoCard() {
  return (
    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono text-purple-200">
          <Fingerprint className="w-3.5 h-3.5 text-yellow-300" />
          <span>SBT Credential Notary</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/30 border border-white/20 text-purple-200">
          Amoy Testnet
        </span>
      </div>

      {/* Center Shield & Hash */}
      <div className="flex items-center gap-3 my-1">
        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-yellow-300 shrink-0 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-extrabold font-heading text-white">Immutable Proof</h3>
          <p className="text-[11px] font-mono text-purple-200 truncate max-w-[150px]">
            SHA-256: 0x7a89...c4b2
          </p>
        </div>
      </div>

      {/* Trust Badge Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10">
        <span className="flex items-center gap-1 text-emerald-300 font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
          Zero-PII On-Chain
        </span>
        <span className="text-purple-200">Instant Audit &rarr;</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 6: House Specialization Matrix (Curated Pathways)
   ───────────────────────────────────────────────────────────────────────────── */
export function FontCard() {
  return (
    <div className="bg-card text-card-foreground rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground font-heading">Specialization</h2>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-crypto-yellow/30 text-black border border-crypto-yellow">
          4 Houses
        </span>
      </div>

      {/* House 2x2 Grid with Real Specialization Labels */}
      <div className="grid grid-cols-2 gap-2 my-1">
        <div className="p-2 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold font-heading leading-tight">Red</p>
            <p className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">Offense / Pwn</p>
          </div>
        </div>
        <div className="p-2 rounded-xl border border-blue-500/40 bg-blue-500/10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold font-heading leading-tight">Blue</p>
            <p className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">Defense &amp; Hunt</p>
          </div>
        </div>
        <div className="p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold font-heading leading-tight">Green</p>
            <p className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">Malware &amp; RE</p>
          </div>
        </div>
        <div className="p-2 rounded-xl border border-purple-500/40 bg-purple-500/10 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold font-heading leading-tight">Purple</p>
            <p className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">Cloud &amp; Crypto</p>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-mono text-muted-foreground text-center">
        Points dynamically rebalance each term
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 7: Perks & Rewards Marketplace (Extrinsic Motivation & Real Value)
   ───────────────────────────────────────────────────────────────────────────── */
export function AgencyCard() {
  return (
    <div className="bg-crypto-yellow text-black rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-black">
          <Gift className="w-3.5 h-3.5 text-black" />
          <span>Perks Marketplace</span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded-full">
          Faculty Approved
        </span>
      </div>

      {/* Rewards Showcase List */}
      <div className="space-y-1.5 my-1">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/90 border border-black text-xs font-mono">
          <span className="font-bold flex items-center gap-1.5 truncate">
            <span>🎓</span> On-Duty (OD) Pass
          </span>
          <span className="font-extrabold text-crypto-purple shrink-0">500 pts</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/90 border border-black text-xs font-mono">
          <span className="font-bold flex items-center gap-1.5 truncate">
            <span>🚩</span> DEF CON CTF Slot
          </span>
          <span className="font-extrabold text-emerald-700 shrink-0">1,200 pts</span>
        </div>
      </div>

      {/* Micro Status Footnote */}
      <div className="flex items-center justify-between text-[10px] font-mono text-black/80 font-bold border-t border-black/10 pt-1">
        <span>Transparent Ledger</span>
        <span>Zero Arbitrary Points &rarr;</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 8: Zero-Trace Grievance Whistleblower (Psychological Safety)
   ───────────────────────────────────────────────────────────────────────────── */
export function UserTrustCard() {
  return (
    <div className="bg-zinc-900 text-white rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
          <Lock className="w-3.5 h-3.5 text-crypto-cyan" />
          <span>Zero-Trace Grievance</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          No IP Logged
        </span>
      </div>

      {/* Center Whistleblower Graphic */}
      <div className="my-1 space-y-1">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-mono text-zinc-400">Secure Tracking Token</p>
          <span className="text-xs font-mono text-crypto-cyan font-bold">#GRV-9428-X</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-tight">
          &ldquo;Disputed unfair point grading in CTF round 2.&rdquo;
        </div>
      </div>

      {/* Safety Guarantee */}
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
        <span className="text-emerald-400 font-bold">Protected Whistleblower</span>
        <span>Dean Review &rarr;</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD 9: Student Security ID Credential (Tactile Ownership & Status)
   ───────────────────────────────────────────────────────────────────────────── */
export function CardBalanceCard() {
  return (
    <div className="bg-card text-card-foreground rounded-2xl h-full p-5 flex flex-col justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-2 border-black cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wide">
          Student Security ID
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Status
        </span>
      </div>

      {/* Metric */}
      <div className="my-1">
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-3xl font-black text-crypto-purple font-heading">4,457</h2>
          <span className="text-sm font-bold font-mono text-muted-foreground">pts balance</span>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
          Roll: 7338217XXX &bull; CSE (Cybersecurity)
        </p>
      </div>

      {/* Quick Action Badges */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 py-1.5 px-2 bg-black text-white text-center rounded-lg font-mono text-[11px] font-bold border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          Redeem Perks
        </div>
        <div className="flex-1 py-1.5 px-2 bg-muted text-foreground text-center rounded-lg font-mono text-[11px] font-bold border border-border">
          Log CTF Win
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SLOT & LAYOUT CONFIGURATION
   ───────────────────────────────────────────────────────────────────────────── */
type Item = {
  id: string;
  title: string;
  widgets: React.ReactNode;
  className?: string;
};

const initialItems: Item[] = [
  { id: "1", title: "1", widgets: <CTFScoreCard />, className: "lg:col-span-4 sm:col-span-7 col-span-12" },
  { id: "2", title: "2", widgets: <HouseMembersCard />, className: "lg:col-span-4 sm:col-span-5 col-span-12" },
  { id: "3", title: "3", widgets: <TerminalSnippetCard />, className: "lg:col-span-4 sm:col-span-6 col-span-12" },
  { id: "4", title: "4", widgets: <TeamCard />, className: "lg:col-span-5 sm:col-span-6 col-span-12" },
  { id: "5", title: "5", widgets: <LogoCard />, className: "lg:col-span-4 sm:col-span-6 col-span-12" },
  { id: "6", title: "6", widgets: <FontCard />, className: "lg:col-span-3 sm:col-span-6 col-span-12" },
  { id: "7", title: "7", widgets: <AgencyCard />, className: "lg:col-span-4 sm:col-span-5 col-span-12" },
  { id: "8", title: "8", widgets: <UserTrustCard />, className: "lg:col-span-4 sm:col-span-7 col-span-12" },
  { id: "9", title: "9", widgets: <CardBalanceCard />, className: "lg:col-span-4 sm:col-span-12 col-span-12" },
];

export function SwapyFeatures() {
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(initialItems, "id")
  );

  const slottedItems = useMemo(
    () => utils.toSlottedItems(initialItems, "id", slotItemMap),
    [slotItemMap]
  );

  const swapyConfig = useMemo(() => ({ swapMode: "hover" as const }), []);

  const handleSwap = useCallback((event: any) => {
    console.log("Swapped items:", event.newSlotItemMap.asArray);
  }, []);

  return (
    <section id="interactive-bento" className="py-24 bg-card text-card-foreground px-6 overflow-hidden relative">
      <div className="max-w-5xl mx-auto text-center mb-12 relative z-10">
        <div className="inline-block px-3 py-1 bg-crypto-yellow text-black rounded-full text-sm font-mono font-bold mb-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-2">
          #Platform Capabilities
        </div>
        <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-4 tracking-tight">
          Engineered for Cyber Cadets
        </h2>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto font-sans text-base md:text-lg">
          Live house wars, proof-of-work synchronization, and zero-trace complaints. Drag and rearrange any tile.
        </p>
      </div>

      <SwapyLayout
        id="swapy"
        className="w-full max-w-6xl mx-auto p-4 relative z-10"
        config={swapyConfig}
        onSwap={handleSwap}
      >
        <div className="grid w-full grid-cols-12 gap-4 md:gap-6 py-4">
          {slottedItems.map(({ slotId, itemId }) => {
            const item = initialItems.find((i) => i.id === itemId);

            return (
              <SwapySlot
                key={slotId}
                className={`swapyItem h-[260px] ${item?.className}`}
                id={slotId}
              >
                <SwapyItem
                  id={itemId}
                  className="relative w-full h-full"
                  key={itemId}
                >
                  {item?.widgets}
                </SwapyItem>
              </SwapySlot>
            );
          })}
        </div>
      </SwapyLayout>
    </section>
  );
}
