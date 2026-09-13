import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GithubLogo, Code, Trophy, Certificate, Sword, Shield as ShieldIcon,
  Star, CalendarBlank, PencilSimple, Check, X, Copy,
  ArrowSquareOut, WarningCircle, Wrench, CaretDown, CaretUp as CaretUpIcon
} from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { AccountLinker } from '../components/AccountLinker';
import { CertificateUpload } from '../components/CertificateUpload';
import { BadgeWallet } from '../components/BadgeWallet';
import { TransactionHistory } from '../components/TransactionHistory';

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
  heatmap: { date: string; points: number }[];
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
  GITHUB:     h => `https://github.com/${h}`,
  CODEFORCES: h => `https://codeforces.com/profile/${h}`,
  LEETCODE:   h => `https://leetcode.com/${h}`,
  GFG:        h => `https://auth.geeksforgeeks.org/user/${h}`,
  HTB:        h => `https://app.hackthebox.com/users/${h}`,
  THM:        h => `https://tryhackme.com/p/${h}`,
};

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap({ heatmap, houseColor }: { heatmap: { date: string; points: number }[], houseColor: string }) {
  const cells = useMemo(() => {
    const map: Record<string, number> = {};
    heatmap.forEach(({ date, points }) => { map[date] = points; });
    const today = new Date();
    const result: { date: Date; points: number; dateStr: string }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]!;
      result.push({ date: d, points: map[dateStr] ?? 0, dateStr });
    }
    return result;
  }, [heatmap]);

  const maxPts = Math.max(...cells.map(c => c.points), 1);
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0]?.date.getMonth() ?? 0;
    if (m !== lastMonth) { monthLabels.push({ label: months[m]!, weekIndex: wi }); lastMonth = m; }
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 0, marginBottom: '4px', position: 'relative', height: '16px', minWidth: `${weeks.length * 14}px` }}>
        {monthLabels.map(({ label, weekIndex }) => (
          <div key={label} style={{ position: 'absolute', left: `${weekIndex * 14}px`, fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '2px' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {week.map((cell, di) => {
              const intensity = cell.points === 0 ? 0.2 : Math.max(0.25, cell.points / maxPts);
              return (
                <div
                  key={di}
                  title={`${cell.dateStr}: ${cell.points} pts`}
                  style={{
                    width: '11px', height: '11px',
                    borderRadius: '2px',
                    backgroundColor: cell.points === 0 ? 'var(--border-subtle)' : houseColor,
                    opacity: intensity,
                    cursor: 'default',
                    transition: 'opacity 0.1s',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Less</span>
        {[0.25, 0.45, 0.65, 0.85, 1].map(op => (
          <div key={op} style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: houseColor, opacity: op }} />
        ))}
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>More</span>
      </div>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px',
      background: color,
      borderRadius: '4px',
      fontFamily: 'var(--font-h2)',
      fontSize: '0.65rem',
      fontWeight: 800,
      letterSpacing: '0.12em',
      color: '#000',
      textTransform: 'uppercase',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfilePortfolio() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const targetId = userId || authUser?.id;
  const isOwner = authUser?.id === targetId;

  const [bioEditing, setBioEditing] = useState(false);
  const [bioText, setBioText] = useState('');
  const [copied, setCopied] = useState(false);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['profile', targetId],
    queryFn: async () => {
      const res = await api.get(`/users/${targetId}/profile`);
      return res.data;
    },
    enabled: !!targetId,
  });

  useEffect(() => {
    if (profile?.bio) setBioText(profile.bio);
  }, [profile?.bio]);

  useEffect(() => {
    if (bioEditing) bioRef.current?.focus();
  }, [bioEditing]);

  const bioMutation = useMutation({
    mutationFn: async (bio: string) => { await api.patch('/users/me/bio', { bio }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
      setBioEditing(false);
    },
  });

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${targetId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  if (!targetId) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Please <a href="/login" style={{ color: 'var(--accent-house)' }}>log in</a> to view your profile.</div>;
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {[200, 80, 300, 200].map((h, i) => (
          <div key={i} style={{ height: h, background: 'var(--bg-surface)', borderRadius: '6px', opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <WarningCircle size={48} />
        <p>Profile not found.</p>
      </div>
    );
  }

  const hConf = HOUSE_CONFIG[profile.house];
  const hColor = hConf.color;

  // Top activity categories from recent transactions
  const activityFreq: Record<string, number> = {};
  profile.recentTransactions.forEach(tx => { activityFreq[tx.reason] = (activityFreq[tx.reason] || 0) + 1; });
  const topActivities = Object.entries(activityFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const ghSync = profile.syncs.find(s => s.provider === 'GITHUB');
  const cfSync = profile.syncs.find(s => s.provider === 'CODEFORCES');
  const htbSync = profile.syncs.find(s => s.provider === 'HTB');
  const hasPlatformStats = ghSync || cfSync || htbSync;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* ────── TOP IDENTITY CARD ──────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: `1px solid var(--border-subtle)`,
        borderTop: `3px solid ${hColor}`,
        borderRadius: '8px 8px 0 0',
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-h2)', fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {profile.name}
            </h1>
            <span style={{ padding: '2px 10px', background: hConf.bg, border: `1px solid ${hColor}`, borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: hColor, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {hConf.label}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
            {hConf.desc}
          </div>
          {/* Bio */}
          {bioEditing ? (
            <div>
              <textarea
                ref={bioRef}
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                maxLength={400}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-base)', border: `1px solid ${hColor}`, borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '10px', resize: 'vertical', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{bioText.length}/400</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setBioEditing(false); setBioText(profile.bio || ''); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: 'none', border: '1px solid var(--border-strong)', borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}>
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={() => bioMutation.mutate(bioText)} disabled={bioMutation.isPending} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: hColor, border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    <Check size={12} /> {bioMutation.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <p style={{ margin: 0, color: profile.bio ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', lineHeight: 1.65, flex: 1, fontStyle: profile.bio ? 'normal' : 'italic' }}>
                {profile.bio || (isOwner ? 'No bio yet. Add a summary to show on your public profile.' : 'No bio provided.')}
              </p>
              {isOwner && (
                <button onClick={() => setBioEditing(true)} title="Edit bio" style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', borderRadius: '4px', display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = hColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <PencilSimple size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Share + metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: copied ? hColor : 'var(--bg-base)', border: `1px solid ${copied ? hColor : 'var(--border-strong)'}`, borderRadius: '4px', color: copied ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CalendarBlank size={10} />
            Since {new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ────── STATS STRIP ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: `1px solid var(--border-subtle)`, borderTop: 'none', background: 'var(--bg-base)' }}>
        {[
          { icon: <Trophy size={16} weight="fill" />, label: 'Points', value: profile.points.toLocaleString() },
          { icon: <Star size={16} weight="fill" />, label: 'Overall Rank', value: `#${profile.rankOverall}` },
          { icon: <ShieldIcon size={16} weight="fill" />, label: 'House Rank', value: profile.rankInHouse ? `#${profile.rankInHouse}` : '—' },
          { icon: <Certificate size={16} weight="fill" />, label: 'Certs', value: profile.certificates.length },
          { icon: <Star size={16} weight="fill" />, label: 'Badges', value: profile.badges.length },
        ].map((s, i, arr) => (
          <div key={i} style={{ padding: '12px 8px', borderRight: i < arr.length - 1 ? `1px solid var(--border-subtle)` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: hColor }}>{s.icon}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700 }}>{s.value}</span>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', textAlign: 'center' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ────── 2-COLUMN BODY ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid var(--border-subtle)`, borderTop: 'none' }}>

        {/* LEFT */}
        <div style={{ borderRight: `1px solid var(--border-subtle)`, display: 'flex', flexDirection: 'column' }}>

          {/* Linked Accounts */}
          <section style={{ padding: '1.25rem', borderBottom: `1px solid var(--border-subtle)` }}>
            <SectionLabel color={hColor}>Linked Accounts</SectionLabel>
            {profile.profileLinks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>No accounts linked yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {profile.profileLinks.map(link => (
                  <a key={link.provider} href={PROVIDER_URLS[link.provider]?.(link.externalHandle) || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '4px', textDecoration: 'none', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = hColor)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: hColor }}>
                      {PROVIDER_ICONS[link.provider]}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{link.provider}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {link.externalHandle}
                      <ArrowSquareOut size={11} />
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Activity Focus */}
          <section style={{ padding: '1.25rem', borderBottom: hasPlatformStats ? `1px solid var(--border-subtle)` : 'none', flex: 1 }}>
            <SectionLabel color={hColor}>Activity Focus</SectionLabel>
            {topActivities.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>No activity recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topActivities.map(([reason, count]) => (
                  <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', background: hColor, borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reason}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', padding: '1px 6px', background: 'var(--bg-base)', borderRadius: '99px', flexShrink: 0 }}>×{count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Platform Stats */}
          {hasPlatformStats && (
            <section style={{ padding: '1.25rem' }}>
              <SectionLabel color={hColor}>Platform Stats</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {ghSync && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><GithubLogo size={13} /> GitHub Commits</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{(ghSync.parsedStats as any).totalCommits ?? '—'}</span>
                  </div>
                )}
                {cfSync && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: htbSync ? '1px solid var(--border-subtle)' : 'none', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Code size={13} /> CF Rating</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: hColor, fontWeight: 600 }}>{(cfSync.parsedStats as any).rating ?? '—'}</span>
                  </div>
                )}
                {htbSync && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><Sword size={13} /> HTB Rank</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: hColor, fontWeight: 600 }}>{(htbSync.parsedStats as any).rank ?? '—'}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Badges */}
          <section style={{ padding: '1.25rem', borderBottom: `1px solid var(--border-subtle)` }}>
            <SectionLabel color={hColor}>Achievements & Badges</SectionLabel>
            {profile.badges.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>No badges earned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.badges.map(badge => (
                  <div key={badge.id} title={badge.description} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'var(--bg-base)', border: `1px solid ${hColor}`, borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600, color: hColor, cursor: 'default', transition: 'background 0.15s' }}>
                    <Star size={10} weight="fill" style={{ color: '#f59e0b' }} />
                    {badge.name}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Certificates */}
          <section style={{ padding: '1.25rem', borderBottom: `1px solid var(--border-subtle)` }}>
            <SectionLabel color={hColor}>Verified Certificates</SectionLabel>
            {profile.certificates.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>No approved certificates yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {profile.certificates.map(cert => (
                  <div key={cert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Certificate size={13} weight="fill" style={{ color: hColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{cert.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {new Date(cert.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Points */}
          <section style={{ padding: '1.25rem', flex: 1 }}>
            <SectionLabel color={hColor}>Recent Points</SectionLabel>
            {profile.recentTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>No transactions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {profile.recentTransactions.slice(0, 6).map((tx, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tx.reason}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0, color: tx.delta >= 0 ? '#10b981' : '#e11d48' }}>
                      {tx.delta >= 0 ? '+' : ''}{tx.delta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ────── ACTIVITY HEATMAP ──────────────────────────────────────── */}
      <div style={{ border: `1px solid var(--border-subtle)`, borderTop: 'none', borderRadius: '0 0 8px 8px', background: 'var(--bg-surface)', padding: '1.25rem' }}>
        <SectionLabel color={hColor}>Activity Heatmap — Last 365 Days</SectionLabel>
        <ActivityHeatmap heatmap={profile.heatmap} houseColor={hColor} />
      </div>

      {/* ────── PORTFOLIO LINKS BAR ───────────────────────────────────── */}
      {profile.profileLinks.length > 0 && (
        <div style={{ marginTop: '8px', background: 'var(--bg-base)', border: `1px solid var(--border-subtle)`, borderLeft: `3px solid ${hColor}`, borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-h2)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: hColor, flexShrink: 0 }}>Portfolio Links</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {profile.profileLinks.map(link => (
              <a key={link.provider} href={PROVIDER_URLS[link.provider]?.(link.externalHandle) || '#'} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: 'var(--bg-surface)', border: `1px solid var(--border-strong)`, borderRadius: '4px', textDecoration: 'none', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = hColor; e.currentTarget.style.borderColor = hColor; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              >
                <span style={{ color: hColor }}>{PROVIDER_ICONS[link.provider]}</span>
                {link.provider}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ────── OWNER-ONLY TOOLS ──────────────────────────────────────── */}
      {isOwner && <OwnerTools houseColor={hColor} />}

    </div>
  );
}

// ─── Owner Tools Panel ────────────────────────────────────────────────────────

function OwnerTools({ houseColor }: { houseColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '16px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          border: `1px solid var(--border-subtle)`,
          borderLeft: `3px solid ${houseColor}`,
          borderRadius: open ? '6px 6px 0 0' : '6px',
          color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s',
          fontSize: '0.78rem', fontWeight: 600,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = houseColor)}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        aria-expanded={open}
        aria-controls="profile-tools-panel"
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={14} />
          Profile Management Tools
        </span>
        {open ? <CaretUpIcon size={14} /> : <CaretDown size={14} />}
      </button>

      {open && (
        <div
          id="profile-tools-panel"
          style={{
            background: 'var(--bg-surface)',
            border: `1px solid var(--border-subtle)`,
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          <AccountLinker />
          <CertificateUpload />
          <BadgeWallet />
          <TransactionHistory />
        </div>
      )}
    </div>
  );
}
