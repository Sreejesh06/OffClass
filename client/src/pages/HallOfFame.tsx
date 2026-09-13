import { Shield, Trophy, CircleNotch } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface TopStudent {
  id: string;
  name: string;
  house: string;
  points: number;
  rank: number;
  badges: number;
}

interface HouseStanding {
  name: string;
  points: number;
}

export function HallOfFame() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hallOfFame'],
    queryFn: async () => {
      const res = await api.get('/leaderboard/hall-of-fame');
      return res.data;
    }
  });

  const topStudents: TopStudent[] = data?.topStudents || [];
  const houseStandings: HouseStanding[] = data?.houseStandings || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', paddingBottom: '4rem' }}>
      {/* Public Nav */}
      <header className="nav-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Shield weight="duotone" size={24} color="var(--accent-house)" />
          <span>OFFCLASS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/complaints" className="nav-link" style={{ fontSize: '0.875rem' }}>File Complaint</Link>
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--bg-base)', 
              background: 'var(--text-primary)', 
              padding: '0.5rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              textDecoration: 'none', 
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Student Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Trophy size={48} weight="duotone" color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h1>Hall of Fame</h1>
          <p style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            The top-performing students and houses in the OffClass cybersecurity department. Real skills, proven work.
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <CircleNotch size={32} color="var(--text-secondary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#e11d48' }}>Failed to load Hall of Fame.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Top Students Dossier */}
            <section className="dossier-card">
              <div className="dossier-header">
                <h2>Top Operatives</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topStudents.map((student) => (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid var(--border-strong)` }} className={`theme-${student.house.toLowerCase()}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)' }}>#{student.rank}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{student.house} House</div>
                      </div>
                    </div>
                    <div className="mono" style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{student.points} pts</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.badges} badges</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* House Standings Dossier */}
            <section className="dossier-card">
              <div className="dossier-header">
                <h2>House Standings</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {houseStandings.map((house, idx) => (
                  <div key={house.name} className={`theme-${house.name.toLowerCase()}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-house)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="mono" style={{ fontSize: '1rem', color: 'var(--accent-house)' }}>{idx + 1}</span>
                      <span style={{ fontWeight: 600 }}>{house.name} House</span>
                    </div>
                    <span className="mono" style={{ color: 'var(--accent-house)', fontWeight: 700 }}>{house.points}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
