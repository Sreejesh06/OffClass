import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Warning, Plus, X, MagnifyingGlass, ShieldMinus } from '@phosphor-icons/react';

interface DisciplineRecord {
  id: string;
  user: { name: string; house: string };
  violation: string;
  pointsDeducted: number;
  evidence: string | null;
  termName: string | null;
  createdAt: string;
}

export function AdminDisciplineTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['admin', 'discipline'],
    queryFn: async () => {
      const res = await api.get('/admin/discipline');
      return res.data.records as DisciplineRecord[];
    }
  });

  const records = recordsData || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldMinus weight="duotone" />
            Discipline Log
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Penalties dock points directly from the House, not the individual student.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '0.75rem 1.5rem', background: '#e11d48', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus weight="bold" /> Log Penalty
        </button>
      </div>

      <div className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="responsive-table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>House</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Violation</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No discipline records found.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="mono" style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{record.user.name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', background: `var(--bg-surface)`, border: '1px solid var(--border-strong)' }}>
                        {record.user.house}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>{record.violation}</div>
                      {record.evidence && (
                        <a href={record.evidence} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'underline' }}>View Evidence</a>
                      )}
                    </td>
                    <td className="mono" style={{ padding: '1rem 1.5rem', color: '#e11d48', fontWeight: 700 }}>
                      -{record.pointsDeducted} pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <LogPenaltyModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function LogPenaltyModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    violation: '',
    pointsDeducted: 10,
    evidence: '',
    termName: 'Current'
  });

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.users);
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/discipline', {
        userId: selectedUser.id,
        violation: formData.violation,
        pointsDeducted: Number(formData.pointsDeducted),
        evidence: formData.evidence || null,
        termName: formData.termName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discipline'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'house-score'] }); // Refresh the math
      onClose();
    }
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-base)', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', width: '100%', maxWidth: '32rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '9999px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Warning size={18} weight="fill" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Log Disciplinary Action</h2>
          </div>
          <button onClick={onClose} style={{ padding: '0.5rem', color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderRadius: '9999px', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!selectedUser ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Search Student</label>
              <div style={{ position: 'relative' }}>
                <MagnifyingGlass style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--text-secondary)' }} />
                <input 
                  autoFocus
                  placeholder="Type name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '0.75rem', padding: '0.5rem 1rem 0.5rem 2.5rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
              </div>
              
              {searchResults.length > 0 && (
                <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  {searchResults.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedUser(u)}
                      style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{u.house}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '0.5rem', border: '1px solid var(--border-strong)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Target Student</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUser.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({selectedUser.house})</span></div>
                </div>
                <button onClick={() => setSelectedUser(null)} style={{ fontSize: '0.75rem', color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Infraction Details *</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.violation}
                  onChange={e => setFormData({ ...formData, violation: e.target.value })}
                  placeholder="e.g. Unauthorized lab access outside hours"
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '0.75rem', padding: '0.5rem 1rem', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Points Docked *</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.pointsDeducted}
                    onChange={e => setFormData({ ...formData, pointsDeducted: Number(e.target.value) })}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '0.75rem', padding: '0.5rem 1rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Term (Optional)</label>
                  <input 
                    value={formData.termName}
                    onChange={e => setFormData({ ...formData, termName: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '0.75rem', padding: '0.5rem 1rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Evidence URL (Optional)</label>
                <input 
                  type="url"
                  value={formData.evidence}
                  onChange={e => setFormData({ ...formData, evidence: e.target.value })}
                  placeholder="Link to incident report or screenshot"
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '0.75rem', padding: '0.5rem 1rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || !formData.violation}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: '#e11d48', color: 'white', fontWeight: 700, border: 'none', cursor: submitMutation.isPending || !formData.violation ? 'not-allowed' : 'pointer', opacity: submitMutation.isPending || !formData.violation ? 0.7 : 1 }}
                >
                  {submitMutation.isPending ? 'Logging Penalty...' : 'Log Penalty & Deduct Points'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
