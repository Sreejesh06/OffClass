import { useAuth } from '../contexts/AuthContext';
import { GithubLogo, ShieldCheck } from '@phosphor-icons/react';

export function Profile() {
  const { user } = useAuth();

  // Mock checking if accounts are linked (for empty states demonstration)
  const hasLinkedAccounts = false;
  const hasBadges = true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Cryptid Agent Dossier</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Dossier ID Card */}
        <div className="dossier-card">
          <div className="dossier-header">
            <h2 style={{ margin: 0 }}>ID: // {user?.name.toUpperCase()}</h2>
            <div className="badge">{user?.house.toUpperCase()} HOUSE</div>
          </div>
          <div className="mono" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span> 
              <span style={{ color: 'var(--text-primary)' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rank:</span> 
              <span style={{ color: 'var(--text-primary)' }}>#12 Overall</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Points:</span> 
              <span style={{ color: 'var(--accent-house)', fontSize: '1.5rem', fontWeight: 700 }}>3,450</span>
            </div>
          </div>
        </div>
        
        {/* Linked Accounts */}
        <div className="dossier-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dossier-header">
            <h2 style={{ margin: 0 }}>LINKED ACCOUNTS</h2>
          </div>
          
          {hasLinkedAccounts ? (
            <div className="mono" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}><GithubLogo size={18} /> Github</span>
                <span style={{ color: 'var(--accent-house)', fontSize: '0.875rem' }}>[Synced]</span>
              </div>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem',
              border: '1px dashed var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              gap: '1rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Your dossier is incomplete. Connect platforms to sync stats automatically.</p>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem'
              }}>
                <GithubLogo size={18} /> Connect GitHub
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Badge Wallet */}
      <div className="dossier-card">
        <div className="dossier-header">
          <h2 style={{ margin: 0 }}>ACHIEVEMENTS & BADGES</h2>
        </div>
        
        {!hasBadges ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <p style={{ margin: 0 }}>No badges unlocked yet. Participate in CTFs or submit certs to earn them.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Earned Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              border: '1px solid var(--accent-house)', 
              borderRadius: 'var(--radius-sm)', 
              color: 'var(--accent-house)',
              backgroundColor: 'color-mix(in srgb, var(--accent-house) 5%, transparent)',
              boxShadow: '0 0 10px color-mix(in srgb, var(--accent-house) 20%, transparent)'
            }}>
              <ShieldCheck weight="fill" size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>First Blood</span>
            </div>
            
            {/* Locked Badge */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)', 
              color: 'var(--text-secondary)' 
            }}>
              <ShieldCheck size={18} />
              <span style={{ fontSize: '0.875rem' }}>Top 10 (Locked)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
