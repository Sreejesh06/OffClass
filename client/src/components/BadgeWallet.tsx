import { SealCheck } from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface UserBadge {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
  };
  awardedAt: string;
}

export function BadgeWallet() {
  const { user } = useAuth();
  
  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await api.get(`/badges/user/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id
  });

  const userBadges: UserBadge[] = badges || [];

  return (
    <div className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="dossier-header" style={{ padding: '1.5rem 1.5rem 1rem', margin: 0, borderBottom: '1px solid var(--border-strong)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>SERVICE BADGES</h2>
        <span className="mono" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLoading ? '...' : userBadges.length} UNLOCKED
        </span>
      </div>

      <div style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {isLoading ? (
          <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading badges...</div>
        ) : userBadges.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-secondary)' }}>No badges earned yet.</div>
        ) : (
          userBadges.map(({ id, badge, awardedAt }) => (
            <div 
              key={id}
              style={{
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                textAlign: 'center'
              }}
            >
              {/* Badge Icon / Visual */}
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'color-mix(in srgb, var(--accent-house) 10%, transparent)',
                border: '2px solid var(--accent-house)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px color-mix(in srgb, var(--accent-house) 20%, transparent)'
              }}>
                <SealCheck size={40} weight="fill" color="var(--accent-house)" />
              </div>
              
              {/* Info */}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>{badge.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{badge.description}</span>
                  <span className="mono" style={{ opacity: 0.7 }}>{new Date(awardedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
