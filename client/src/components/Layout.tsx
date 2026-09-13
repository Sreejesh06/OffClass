import { Link, useLocation } from "react-router-dom";
import { User, Trophy, Gift, Flag, Shield } from "@phosphor-icons/react";
import { useTheme, type House } from "./ThemeProvider";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { house, setHouse } = useTheme();

  return (
    <>
      <header className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Shield weight="duotone" size={24} color="var(--accent-house)" />
          <span>CRYPTID</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '1.5rem', marginLeft: '2rem' }}>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} weight={location.pathname === '/profile' ? 'fill' : 'regular'} />
            Profile
          </Link>
          <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>
            <Trophy size={20} weight={location.pathname === '/leaderboard' ? 'fill' : 'regular'} />
            Leaderboard
          </Link>
          <Link to="/redeem" className={`nav-link ${location.pathname === '/redeem' ? 'active' : ''}`}>
            <Gift size={20} weight={location.pathname === '/redeem' ? 'fill' : 'regular'} />
            Redeem
          </Link>
          <Link to="/complaints" className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`}>
            <Flag size={20} weight={location.pathname === '/complaints' ? 'fill' : 'regular'} />
            Complaints
          </Link>
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="mono" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Theme Swap (Dev):
          </span>
          <select 
            value={house} 
            onChange={(e) => setHouse(e.target.value as House)}
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <option value="none">None</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
          </select>
        </div>
      </header>
      
      <main id="main-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </>
  );
}
