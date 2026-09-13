import { useAuth } from '../contexts/AuthContext';
import { BadgeWallet } from '../components/BadgeWallet';
import { TransactionHistory } from '../components/TransactionHistory';
import { AccountLinker } from '../components/AccountLinker';
import { CertificateUpload } from '../components/CertificateUpload';

export function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>OffClass Agent Dossier</h1>
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
              <span style={{ color: 'var(--text-primary)' }}>#37 Overall | #12 in {user?.house ? user.house.charAt(0).toUpperCase() + user.house.slice(1) : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Points:</span> 
              <span style={{ color: 'var(--accent-house)', fontSize: '1.5rem', fontWeight: 700 }}>{user?.points?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Linked Accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <AccountLinker />
          <CertificateUpload />
        </div>
      </div>
      
      {/* Badge Wallet */}
      <BadgeWallet />

      {/* Points Ledger */}
      <TransactionHistory />
    </div>
  );
}
