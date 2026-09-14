import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GithubLogo, Code, Trophy, Certificate, Sword, Shield as ShieldIcon,
  Star, CalendarBlank, PencilSimple, Check, X, Copy,
  ArrowSquareOut, WarningCircle, Wrench, CaretDown, CaretUp as CaretUpIcon,
  ArrowsLeftRight, HourglassMedium, Trash,
  Envelope, MapPin, Briefcase, Medal, User as UserIcon
} from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { IntegrationsModal } from '../components/IntegrationsModal';
import { BadgeWallet } from '../components/BadgeWallet';
import { TransactionHistory } from '../components/TransactionHistory';
import { HouseTransferModal } from '../components/HouseTransferModal';
import { AchievementModal } from '../components/AchievementModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  name: string;
  house: 'RED' | 'BLUE' | 'GREEN' | 'PURPLE';
  points: number;
  bio: string | null;
  memberSince: string;
  rankOverall: number;
  rankInHouse: number | null;
  profileLinks: { provider: string; externalHandle: string; verified: boolean }[];
  syncs: { provider: string; parsedStats: Record<string, any>; lastSyncedAt: string; status: string }[];
  certificates: { id: string; name: string; createdAt: string; mimeType: string }[];
  recentTransactions: { delta: number; reason: string; createdAt: string }[];
  badges: { id: string; name: string; description: string; imageUrl: string | null }[];
  achievements: { id: string; title: string; category: string; position: string; date: string; prize: string | null }[];
  heatmap: { date: string; points: number; summary?: string; details?: Record<string, number> }[];
  activePlatforms: string[];
}

// ─── House Config ─────────────────────────────────────────────────────────────

const HOUSE_CONFIG = {
  RED:    { label: 'Red House',    color: '#e11d48', bg: 'rgba(225,29,72,0.10)',    desc: 'Penetration Testing & Offensive Security' },
  BLUE:   { label: 'Blue House',   color: '#2563eb', bg: 'rgba(37,99,235,0.10)',    desc: 'Defensive Security & Incident Response' },
  GREEN:  { label: 'Green House',  color: '#10b981', bg: 'rgba(16,185,129,0.10)',   desc: 'Secure Development & DevSecOps' },
  PURPLE: { label: 'Purple House', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',   desc: 'Cryptography & Research' },
};

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  GITHUB:     <GithubLogo size={16} weight="fill" />,
  CODEFORCES: <Code size={16} weight="fill" />,
  LEETCODE:   <Code size={16} weight="fill" />,
  GFG:        <Code size={16} weight="fill" />,
  HTB:        <Sword size={16} weight="fill" />,
  THM:        <ShieldIcon size={16} weight="fill" />,
};

const PROVIDER_URLS: Record<string, (h: string) => string> = {
  GITHUB:     (h: string) => `https://github.com/${h}`,
  CODEFORCES: (h: string) => `https://codeforces.com/profile/${h}`,
  LEETCODE:   (h: string) => `https://leetcode.com/${h}`,
  GFG:        (h: string) => `https://auth.geeksforgeeks.org/user/${h}`,
  HTB:        (h: string) => `https://app.hackthebox.com/users/${h}`,
  THM:        (h: string) => `https://tryhackme.com/p/${h}`,
};

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap({ heatmap = [], houseColor, activePlatforms = [] }: { heatmap?: { date: string; points: number; summary?: string; details?: Record<string, number> }[], houseColor: string, activePlatforms?: string[] }) {
  const [filter, setFilter] = useState<string>('All');
  const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string } | null>(null);

  const availablePlatforms = useMemo(() => {
    return ['All', ...[...(activePlatforms || [])].sort()];
  }, [activePlatforms]);

  const cells = useMemo(() => {
    const map: Record<string, { points: number; summary?: string; details?: Record<string, number> }> = {};
    if (heatmap && Array.isArray(heatmap)) {
      heatmap.forEach(({ date, points, summary, details }) => { map[date] = { points, summary, details }; });
    }
    const today = new Date();
    const result: { date: Date | null; points: number; dateStr: string; summary?: string; details?: Record<string, number> }[] = [];
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    for (let i = 0; i < startDate.getDay(); i++) {
      result.push({ date: null, points: 0, dateStr: '' });
    }

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]!;
      const data = map[dateStr];
      let points = data?.points ?? 0;
      let summary = data?.summary;
      
      if (filter !== 'All' && data?.details) {
        points = data.details[filter] ?? 0;
      }
      
      result.push({ date: d, points, dateStr, summary, details: data?.details });
    }
    return result;
  }, [heatmap, filter]);

  const maxPts = Math.max(...cells.map(c => c.points), 1);
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const validDay = week.find(d => d.date);
    if (!validDay) return;
    const m = validDay.date!.getMonth();
    if (m !== lastMonth) { monthLabels.push({ label: months[m]!, weekIndex: wi }); lastMonth = m; }
  });

  return (
    <div className="w-full bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Activity Matrix</h3>
          <p className="text-sm text-gray-500 font-sans mt-1">Platform engagement over the last year</p>
        </div>
        
        {availablePlatforms.length > 1 && (
          <div className="flex gap-2 text-xs font-mono">
            {availablePlatforms.map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                style={{
                  background: filter === p ? houseColor : 'white',
                  color: filter === p ? 'white' : '#6b7280',
                  borderColor: filter === p ? houseColor : '#e5e7eb'
                }}
                className="px-3 py-1 rounded-md border transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        {tooltip && (
          <div style={{ left: tooltip.x, top: tooltip.y - 8 }} className="fixed -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-mono whitespace-pre-line pointer-events-none z-50 text-center shadow-lg">
            {tooltip.content}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        )}

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-0 mb-1 relative h-4" style={{ minWidth: `${weeks.length * 15}px` }}>
            {monthLabels.map(({ label, weekIndex }) => (
              <div key={`${label}-${weekIndex}`} style={{ left: `${weekIndex * 15}px` }} className="absolute text-[10px] text-gray-400 font-mono">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-1" style={{ minWidth: `${weeks.length * 15}px` }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) => {
                  if (!cell.date) {
                    return <div key={di} className="w-3 h-3 rounded-sm bg-transparent" />;
                  }
                  const intensity = cell.points === 0 ? 0 : Math.max(0.3, cell.points / maxPts);
                  const dateFormatted = new Date(cell.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  let tooltipContent = cell.points > 0 ? `${cell.points} contributions on ${dateFormatted}` : `No activity on ${dateFormatted}`;
                  if (filter === 'All' && cell.details && Object.keys(cell.details).length > 0) {
                    const detailsText = Object.entries(cell.details)
                      .filter(([_, count]) => count > 0)
                      .map(([provider, count]) => `${count} ${provider}`)
                      .join(' • ');
                    if (detailsText) {
                      tooltipContent = `${tooltipContent}\n(${detailsText})`;
                    }
                  }
                  return (
                    <div key={di}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ x: rect.left + rect.width / 2, y: rect.top, content: tooltipContent });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={`w-3 h-3 rounded-sm transition-opacity hover:ring-2 ring-gray-300 ${cell.points === 0 ? 'bg-gray-100/50' : ''}`}
                      style={cell.points > 0 ? { backgroundColor: houseColor, opacity: intensity } : {}}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end text-[10px] text-gray-400 font-mono">
        <span>Less</span>
        {[0, 0.3, 0.55, 0.8, 1].map((op, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${op === 0 ? 'bg-gray-100/50' : ''}`} style={op > 0 ? { backgroundColor: houseColor, opacity: op } : {}} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function ProfilePortfolio() {
  const { userId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [activityTab, setActivityTab] = useState<'ACHIEVEMENTS' | 'ACTIVITY'>('ACHIEVEMENTS');
  const [bioEditing, setBioEditing] = useState(false);
  const [bioText, setBioText] = useState('');
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', userId || user?.id],
    queryFn: async () => {
      const targetId = userId || user?.id;
      if (!targetId) throw new Error("No user ID");
      const res = await api.get(`/users/${targetId}/profile`);
      return res.data;
    },
    enabled: !!(userId || user?.id)
  });

  const { data: transferStatus } = useQuery({
    queryKey: ['house-transfer', userId || 'me'],
    queryFn: async () => {
      const res = await api.get('/users/me/house-transfer');
      return res.data;
    },
    enabled: (!userId || userId === user?.id) && !!user
  });

  // Mutations
  const bioMutation = useMutation({
    mutationFn: async (newBio: string) => {
      await api.patch('/users/me/bio', { bio: newBio });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setBioEditing(false);
    }
  });

  const handleShare = () => {
    if (!profile) return;
    const url = `${window.location.origin}/profile/${profile.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (bioEditing && bioRef.current) {
      bioRef.current.focus();
      bioRef.current.setSelectionRange(bioRef.current.value.length, bioRef.current.value.length);
    }
  }, [bioEditing]);

  if (isLoading) return <div className="p-8 text-center text-gray-500 font-mono">Loading dossier...</div>;
  if (error || !data) return <div className="p-8 text-center text-rose-500 font-mono">Profile not found.</div>;

  const profile: ProfileData = data;
  const isOwner = !userId || userId === user?.id;
  const hConf = HOUSE_CONFIG[profile.house] || HOUSE_CONFIG.RED;
  const hColor = hConf.color;

  return (
    <main className="w-full pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 font-sans">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Avatar & Contact (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Profile Avatar Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 opacity-20" style={{ background: `linear-gradient(135deg, ${hColor} 0%, transparent 100%)` }}></div>
              
              <div className="absolute top-6 right-6">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>

              <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white shadow-sm bg-white overflow-hidden mb-5 mt-4 flex items-center justify-center">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=e5e7eb&textColor=000000`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 font-display mb-1">{profile.name}</h1>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: hConf.bg, color: hColor, border: `1px solid ${hColor}40` }}>
                  {hConf.label}
                </span>
                {isOwner && (
                  transferStatus?.hasPending ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                      <HourglassMedium size={10} weight="bold" /> Pending
                    </span>
                  ) : (
                    <button onClick={() => setShowTransferModal(true)} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 flex items-center gap-1 transition-colors">
                      <ArrowsLeftRight size={10} /> Transfer
                    </button>
                  )
                )}
              </div>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Points</p>
                  <p className="text-2xl font-black font-heading" style={{ color: hColor }}>{profile.points.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Global Rank</p>
                  <p className="text-2xl font-black text-gray-900 font-heading">#{profile.rankOverall}</p>
                </div>
              </div>
            </div>

            {/* Contact & Details */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Identity & Focus</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <CalendarBlank size={18} />
                  </div>
                  <span className="font-medium text-sm">Joined {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: hConf.bg, color: hColor }}>
                    <ShieldIcon size={18} />
                  </div>
                  <span className="font-medium text-sm">{hConf.desc}</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Bio, Experience, Stats (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Bio Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 relative group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 font-display">About Me</h3>
                {isOwner && !bioEditing && (
                  <button onClick={() => { setBioText(profile.bio || ''); setBioEditing(true); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <PencilSimple size={18} />
                  </button>
                )}
              </div>
              
              {bioEditing ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    ref={bioRef}
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    maxLength={400}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-mono">{bioText.length}/400</span>
                    <div className="flex gap-2">
                      <button onClick={() => setBioEditing(false)} className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                      <button onClick={() => bioMutation.mutate(bioText)} disabled={bioMutation.isPending} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-70" style={{ backgroundColor: hColor }}>
                        {bioMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={`text-lg leading-relaxed ${profile.bio ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                  {profile.bio || (isOwner ? 'No bio yet. Click the pencil icon to add a summary for your public profile.' : 'No bio provided.')}
                </p>
              )}
            </div>

            {/* Experience / Activity Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Point History / Public Activity */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 flex flex-col h-full max-h-[450px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <Medal size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-display">Activity & Achievements</h3>
                  </div>
                  {isOwner && activityTab === 'ACHIEVEMENTS' && (
                    <button 
                      onClick={() => setShowAchievementModal(true)}
                      className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>

                <div className="flex bg-gray-100/50 p-1 rounded-xl mb-4 flex-shrink-0">
                  <button onClick={() => setActivityTab('ACHIEVEMENTS')} className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors ${activityTab === 'ACHIEVEMENTS' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Achievements</button>
                  <button onClick={() => setActivityTab('ACTIVITY')} className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors ${activityTab === 'ACTIVITY' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Activity Log</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
                  {activityTab === 'ACHIEVEMENTS' ? (
                    profile.achievements && profile.achievements.length > 0 ? (
                      profile.achievements.map((ach) => (
                        <div key={ach.id} className="flex flex-col p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-900">{ach.title}</span>
                            <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{ach.category}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span className="font-medium text-orange-600">{ach.position} {ach.prize && `• ${ach.prize}`}</span>
                            <span className="font-mono text-gray-500">{new Date(ach.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-gray-400 text-sm">No official achievements found.</div>
                    )
                  ) : (
                    <TransactionHistory transactions={profile.recentTransactions} filterType="ACTIVITY" />
                  )}
                </div>
              </div>

              {/* Linked Accounts */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 flex flex-col h-full max-h-[450px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Briefcase size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 font-display">Integrations</h3>
                  </div>
                  {isOwner && (
                    <button 
                      onClick={() => setShowIntegrationsModal(true)}
                      className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Manage
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                  <div className="flex flex-col gap-3">
                    {profile.profileLinks.length === 0 ? (
                      <div className="text-gray-400 text-sm text-center py-4">No public integrations.</div>
                    ) : (
                      profile.profileLinks.map(link => (
                        <a key={link.provider} href={PROVIDER_URLS[link.provider]?.(link.externalHandle) || '#'} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="flex items-center gap-2 font-medium" style={{ color: hColor }}>
                            {PROVIDER_ICONS[link.provider]}
                            <span className="text-gray-900 text-sm">{link.provider}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                            {link.externalHandle} <ArrowSquareOut size={12} />
                          </span>
                        </a>
                      ))
                    )}
                  </div>

                  {profile.certificates.length > 0 && (
                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 font-display">Uploaded Certificates</h4>
                      {profile.certificates.map(cert => (
                        <div key={cert.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <Certificate size={16} weight="fill" className="text-amber-500 flex-shrink-0" />
                            <span className="text-sm truncate max-w-[200px]">{cert.name}</span>
                          </span>
                          <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                            {new Date(cert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
            </div>

            {/* Badges Full Width */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
               <h3 className="text-lg font-bold text-gray-900 mb-6 font-display">Certifications & Badges</h3>
               {isOwner ? (
                 <BadgeWallet />
               ) : (
                 <div className="flex flex-wrap gap-6">
                   {profile.badges.length === 0 ? (
                     <div className="w-full text-center text-gray-400 py-4 text-sm">No badges earned yet.</div>
                   ) : (
                     profile.badges.map(b => (
                       <div key={b.id} className="flex flex-col items-center gap-2 text-center w-24">
                         <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-200">
                           <Trophy size={28} weight="fill" className="text-amber-500" />
                         </div>
                         <div className="font-semibold text-[11px] leading-tight text-gray-800">{b.name}</div>
                       </div>
                     ))
                   )}
                 </div>
               )}
            </div>

          </div>
          
          {/* BOTTOM ROW: Heatmap */}
          <div className="lg:col-span-12">
            <ActivityHeatmap heatmap={profile.heatmap} houseColor={hColor} activePlatforms={profile.activePlatforms} />
          </div>

        </div>
      </div>

      {showTransferModal && (
        <HouseTransferModal 
          currentHouse={profile.house}
          onClose={() => setShowTransferModal(false)} 
          onSuccess={() => { setShowTransferModal(false); queryClient.invalidateQueries({ queryKey: ['house-transfer', 'me'] }); }} 
        />
      )}

      {showIntegrationsModal && (
        <IntegrationsModal onClose={() => setShowIntegrationsModal(false)} />
      )}

      {showAchievementModal && (
        <AchievementModal onClose={() => setShowAchievementModal(false)} onSuccess={() => { setShowAchievementModal(false); }} />
      )}
    </main>
  );
}
