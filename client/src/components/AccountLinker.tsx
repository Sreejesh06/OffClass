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
  const [linkingPlatform, setLinkingPlatform] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: platforms, isLoading, refetch } = useQuery({
    queryKey: ['platform-links'],
    queryFn: fetchSyncStatus,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, 
  });

  const linkMutation = useMutation({
    mutationFn: async (platformId: string) => {
      const handle = prompt(`Enter your ${platformId} handle:`);
      if (!handle) throw new Error('Handle is required');

      await api.post('/integrations/link', { provider: platformId, externalHandle: handle });
      await api.post(`/integrations/sync/${platformId}`);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setLinkingPlatform(null);
    },
    onError: () => {
      alert("Failed to link account");
      setLinkingPlatform(null);
    }
  });

  const syncMutation = useMutation({
    mutationFn: async (platformId: string) => {
      await api.post(`/integrations/sync/${platformId}`);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      alert("Failed to sync account");
    }
  });

  const handleLink = (platformId: string) => {
    setLinkingPlatform(platformId);
    linkMutation.mutate(platformId);
  };

  const handleSync = (platformId: string) => {
    syncMutation.mutate(platformId);
  };

  const renderStatus = (platform: PlatformLink) => {
    switch (platform.state) {
      case 'UP_TO_DATE':
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <CheckCircle size={16} className="text-emerald-500" weight="fill" />
              <span>Synced {platform.lastSync}</span>
            </div>
            <button 
              onClick={() => handleSync(platform.id)}
              disabled={syncMutation.isPending}
              className="text-xs px-3 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Sync
            </button>
          </div>
        );
      case 'STALE':
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Clock size={16} />
              <span>Last updated {platform.lastSync}</span>
            </div>
            <button 
              onClick={() => handleSync(platform.id)}
              disabled={syncMutation.isPending}
              className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
            >
              Sync Now
            </button>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-rose-500 text-xs">
              <Warning size={16} weight="fill" />
              <span className="max-w-[120px] truncate" title={platform.errorDetail}>{platform.errorDetail || 'Sync failed.'}</span>
            </div>
            <button 
              onClick={() => handleSync(platform.id)}
              disabled={syncMutation.isPending}
              className="text-xs px-3 py-1 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
            >
              Retry
            </button>
          </div>
        );
      case 'SYNCING':
        return (
          <div className="flex items-center gap-1.5 text-blue-500 text-xs">
            <ArrowsClockwise size={16} className="animate-spin" />
            <span>Syncing right now...</span>
          </div>
        );
      case 'NOT_LINKED':
      default:
        return (
          <button 
            onClick={() => handleLink(platform.id)}
            disabled={linkingPlatform === platform.id}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Link size={14} />
            {linkingPlatform === platform.id ? 'Linking...' : 'Link Account'}
          </button>
        );
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="py-8 text-center text-gray-400">Loading sync status...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {platforms?.map(platform => (
            <div key={platform.id} className="flex flex-col gap-2">
              <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 rounded-xl border ${platform.state === 'FAILED' ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                <span className="font-semibold text-gray-900">{platform.name}</span>
                {renderStatus(platform)}
              </div>
              
              {/* Inline HTB Instruction */}
              {platform.id === 'HTB' && platform.state === 'NOT_LINKED' && linkingPlatform === 'HTB' && (
                <div className="text-xs text-rose-600 p-3 bg-rose-50 rounded-xl border border-rose-100">
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
