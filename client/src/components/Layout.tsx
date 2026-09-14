import { Link, useLocation } from "react-router-dom";
import { User, Trophy, Gift, Flag, Shield, ShieldCheck } from "@phosphor-icons/react";
import { useTheme, type House } from "./ThemeProvider";
import { useAuth } from "../contexts/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { house, setHouse } = useTheme();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Shield weight="duotone" size={24} color="var(--accent-house)" />
          <span>OFFCLASS</span>
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
          
          {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              <ShieldCheck size={20} weight={location.pathname === '/admin' ? 'fill' : 'regular'} />
              Admin
            </Link>
          )}

          {user && (
            <button 
              onClick={() => logout()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                marginLeft: '1rem',
                padding: '0'
              }}
            >
              Sign Out
            </button>
          )}
        </nav>


      </header>
      
      <main id="main-content" style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </>
  );
}
