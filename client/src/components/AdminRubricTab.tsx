import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PencilSimple, Check, X, Tag, SlidersHorizontal } from '@phosphor-icons/react';

interface RubricItem {
  id: string;
  category: string;
  activityKey: string;
  description: string;
  points: number;
  isBonus: boolean;
  capPerTerm: number | null;
  isActive: boolean;
}

export function AdminRubricTab() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ points: number; capPerTerm: number | null; isActive: boolean }>({ points: 0, capPerTerm: null, isActive: true });

  const { data: rubricData, isLoading } = useQuery({
    queryKey: ['admin', 'rubric'],
    queryFn: async () => {
      const res = await api.get('/admin/rubric');
      return res.data.rubric as RubricItem[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.patch(`/admin/rubric/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rubric'] });
      setEditingId(null);
    }
  });

  const grouped = useMemo(() => {
    if (!rubricData) return {};
    return rubricData.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, RubricItem[]>);
  }, [rubricData]);

  const handleEditClick = (item: RubricItem) => {
    setEditingId(item.id);
    setEditForm({ points: item.points, capPerTerm: item.capPerTerm, isActive: item.isActive });
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ id, data: editForm });
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Rubric Engine...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal weight="duotone" />
            Scoring Configuration
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Adjust point values and caps. Changes affect future submissions only.
          </p>
        </div>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {category.replace(/_/g, ' ')}
          </div>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Activity</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '120px' }}>Points</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '150px' }}>Term Cap</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '100px' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', width: '120px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: isEditing ? 'var(--bg-surface)' : 'transparent', opacity: item.isActive || isEditing ? 1 : 0.5 }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 500 }}>{item.description}</div>
                        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.activityKey} {item.isBonus && <span style={{ color: '#eab308' }}>(Bonus)</span>}</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {isEditing ? (
                          <input 
                            type="number"
                            value={editForm.points}
                            onChange={e => setEditForm({ ...editForm, points: Number(e.target.value) })}
                            style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)' }}
                          />
                        ) : (
                          <div className="mono" style={{ fontWeight: 600 }}>{item.points}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {isEditing ? (
                          <input 
                            type="number"
                            placeholder="No limit"
                            value={editForm.capPerTerm || ''}
                            onChange={e => setEditForm({ ...editForm, capPerTerm: e.target.value ? Number(e.target.value) : null })}
                            style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'var(--bg-base)' }}
                          />
                        ) : (
                          <div className="mono" style={{ color: 'var(--text-secondary)' }}>{item.capPerTerm || '∞'}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {isEditing ? (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                            />
                            <span style={{ fontSize: '0.85rem' }}>Active</span>
                          </label>
                        ) : (
                          <span style={{ padding: '0.25rem 0.5rem', background: item.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(225,29,72,0.1)', color: item.isActive ? '#10b981' : '#e11d48', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {item.isActive ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setEditingId(null); setEditForm({ points: item.points, capPerTerm: item.capPerTerm, isActive: item.isActive }); }} style={{ padding: '0.4rem', border: '1px solid var(--border-strong)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                            <button disabled={updateMutation.isPending} onClick={() => handleSave(item.id)} style={{ padding: '0.4rem', border: 'none', background: '#10b981', color: 'white', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}><Check size={16} weight="bold" /></button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditClick(item)} style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border-strong)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <PencilSimple size={14} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
