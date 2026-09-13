import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, CheckCircle, Warning, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import { api } from '../lib/api';

type SyncState = 'NOT_LINKED' | 'SYNCING' | 'STALE' | 'FAILED' | 'UP_TO_DATE';

interface PlatformLink {
  id: string;
  name: string;
  state: SyncState;
  lastSync?: string;
  errorDetail?: string;
  requiresPublicProfile?: boolean;
}

const fetchSyncStatus = async (): Promise<PlatformLink[]> => {
  const [linksRes, syncsRes] = await Promise.all([
    api.get('/integrations/links'),
    api.get('/integrations/sync/status')
  ]);
  const links = linksRes.data.links || [];
  const syncs = syncsRes.data.syncs || [];

  const basePlatforms = [
    { id: 'GITHUB', name: 'GitHub' },
    { id: 'CODEFORCES', name: 'Codeforces' },
    { id: 'HTB', name: 'HackTheBox', requiresPublicProfile: true },
    { id: 'THM', name: 'TryHackMe' },
    { id: 'LEETCODE', name: 'LeetCode' },
    { id: 'GFG', name: 'GeeksforGeeks' },
  ];

  return basePlatforms.map(p => {
    const link = links.find((l: any) => l.provider === p.id);
    const sync = syncs.find((s: any) => s.provider === p.id);

    if (!link) return { ...p, state: 'NOT_LINKED' };
    
    if (sync?.status === 'PENDING' || sync?.status === 'SYNCING') {
      return { ...p, state: 'SYNCING' };
    }
    
    if (sync?.status === 'FAILED') {
      return { ...p, state: 'FAILED', errorDetail: sync.lastError || 'Sync failed.' };
    }

    if (sync?.status === 'COMPLETED') {
       return { ...p, state: 'UP_TO_DATE', lastSync: new Date(sync.lastSyncedAt).toLocaleString() };
    }

    // Default if linked but no sync record yet
    return { ...p, state: 'STALE', lastSync: 'Never' };
  });
};

export function AccountLinker() {
  const queryClient = useQueryClient();
  const [linkingPlatform, setLinkingPlatform] = useState<string | null>(null);

  const { data: platforms, isLoading, refetch } = useQuery({
    queryKey: ['platform-links'],
    queryFn: fetchSyncStatus,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, 
  });

  const linkMutation = useMutation({
    mutationFn: async (platformId: string) => {
      // In a real app we might prompt for handle. For now, prompt here.
      const handle = prompt(`Enter your ${platformId} handle:`);
      if (!handle) throw new Error('Handle is required');

      await api.post('/integrations/link', { provider: platformId, externalHandle: handle });
      await api.post(`/integrations/sync/${platformId}`);
    },
    onSuccess: () => {
      refetch();
      setLinkingPlatform(null);
    },
    onError: () => {
      alert("Failed to link account");
      setLinkingPlatform(null);
    }
  });

  const handleLink = (platformId: string) => {
    setLinkingPlatform(platformId);
    linkMutation.mutate(platformId);
  };

  const renderStatus = (platform: PlatformLink) => {
    switch (platform.state) {
      case 'UP_TO_DATE':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            <CheckCircle size={16} color="var(--accent-house)" weight="fill" />
            <span>Synced {platform.lastSync}</span>
          </div>
        );
      case 'STALE':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            <Clock size={16} />
            <span>Last updated {platform.lastSync}</span>
          </div>
        );
      case 'FAILED':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontSize: '0.75rem' }}>
            <Warning size={16} weight="fill" />
            <span>{platform.errorDetail || 'Sync failed.'}</span>
          </div>
        );
      case 'SYNCING':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-house)', fontSize: '0.75rem' }}>
            <ArrowsClockwise size={16} className="spin-animation" />
            <span>Syncing right now...</span>
          </div>
        );
      case 'NOT_LINKED':
      default:
        return (
          <button 
            onClick={() => handleLink(platform.id)}
            disabled={linkingPlatform === platform.id}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              cursor: linkingPlatform === platform.id ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Link size={14} />
            {linkingPlatform === platform.id ? 'Linking...' : 'Link Account'}
          </button>
        );
    }
  };

  return (
    <div className="dossier-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-animation { animation: spin 1s linear infinite; }
      `}</style>
      
      <div className="dossier-header">
        <h2 style={{ margin: 0 }}>LINKED ACCOUNTS</h2>
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading sync status...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {platforms?.map(platform => (
            <div key={platform.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem 1rem', 
                  border: platform.state === 'FAILED' ? '1px solid color-mix(in srgb, #e11d48 50%, var(--border-subtle))' : '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-base)'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{platform.name}</span>
                {renderStatus(platform)}
              </div>
              
              {/* Inline HTB Instruction */}
              {platform.id === 'HTB' && platform.state === 'NOT_LINKED' && linkingPlatform === 'HTB' && (
                <div style={{ fontSize: '0.75rem', color: '#e11d48', padding: '0.5rem', backgroundColor: 'color-mix(in srgb, #e11d48 10%, transparent)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Important:</strong> Set your HTB profile to Public in Account Settings, or your stats won't sync.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
