import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CaretLeft, CaretRight, CaretUp, CaretDown, Minus } from "@phosphor-icons/react";
import { type House } from "../components/ThemeProvider";
import { api } from "../lib/api";

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  name: string;
  house: House;
  points: number;
}

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<House | 'overall'>('overall');
  const [page, setPage] = useState(1);
  const perPage = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', activeTab],
    queryFn: async () => {
      const endpoint = activeTab === 'overall' ? '/leaderboard/overall' : `/leaderboard/house/${activeTab.toUpperCase()}`;
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  // Calculate pagination locally for now, since API returns all top 100 for a house/overall
  const paginatedData = data?.leaderboard ? data.leaderboard.slice((page - 1) * perPage, page * perPage) : [];
  const totalPages = data?.leaderboard ? Math.ceil(data.leaderboard.length / perPage) : 1;

  const handleTabChange = (tab: House | 'overall') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Overall Leaderboard</h1>
      </div>

      {/* Term Reset Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)'
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Season 2 starts Nov 1st</span>
        — see past champions in the <a href="/hall-of-fame" style={{ color: 'var(--accent-house)' }}>Hall of Fame</a>.
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        {(['overall', 'red', 'blue', 'green', 'purple'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 700 : 500,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              padding: '0.5rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading logs...</div>
        ) : (
          <>
            <div className="responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)', background: 'var(--bg-base)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, width: '4rem' }}>Rank</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, width: '3rem' }}>+/-</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Operative</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>House</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((entry: LeaderboardEntry) => {
                    const rankDiff = entry.previousRank - entry.rank;
                    return (
                      <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className={`theme-${entry.house}`}>
                        <td style={{ padding: '0.75rem 1rem' }} className="mono">{entry.rank}</td>
                        <td style={{ padding: '0.75rem 1rem' }} className="mono">
                          {rankDiff > 0 ? (
                            <span style={{ color: 'var(--accent-house)', display: 'flex', alignItems: 'center', gap: '0.25rem' }} aria-label={`Moved up ${rankDiff} ranks`}>
                              <CaretUp weight="bold" /> {rankDiff}
                            </span>
                          ) : rankDiff < 0 ? (
                            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }} aria-label={`Moved down ${Math.abs(rankDiff)} ranks`}>
                              <CaretDown weight="bold" /> {Math.abs(rankDiff)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }} aria-label="Rank unchanged">
                              <Minus weight="bold" />
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          <Link to={`/profile/${entry.id}`} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-house)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                          >
                            {entry.name}
                          </Link>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          <span style={{ color: 'var(--accent-house)', fontWeight: 600 }}>{entry.house}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-primary)' }} className="mono">
                          {entry.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: 'none', 
                  color: page === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                <CaretLeft /> Prev
              </button>
              
              <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Page {page} of {totalPages}
              </span>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: 'none', 
                  color: page === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Next <CaretRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
