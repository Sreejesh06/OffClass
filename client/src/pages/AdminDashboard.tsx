import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DownloadSimple, Check, X, Warning, MagnifyingGlass, Shield } from '@phosphor-icons/react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

import { AdminRubricTab } from '../components/AdminRubricTab';
import { AdminDisciplineTab } from '../components/AdminDisciplineTab';

type Tab = 'approvals' | 'moderation' | 'risk' | 'export' | 'rubric' | 'discipline';

interface ApprovalItem {
  id: string;
  studentName: string;
  studentHouse: string;
  targetHouse?: string;
  type: string;
  description: string;
  date: string;
  reason?: string;
}

interface ComplaintItem {
  id: string;
  trackingCode: string;
  category: string;
  date: string;
  status: string;
  content: string;
  notes: string;
}

interface AtRiskStudent {
  id: string;
  name: string;
  house: string;
  points: number;
  lastActive: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<Tab>('approvals');
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());

  // Fetch Approvals
  const { data: approvalsData } = useQuery({
    queryKey: ['admin', 'approvals'],
    queryFn: async () => {
      const res = await api.get('/admin/approvals');
      return res.data;
    }
  });
  const approvals: ApprovalItem[] = approvalsData?.approvals || [];

  // Fetch At Risk Students
  const { data: riskData } = useQuery({
    queryKey: ['admin', 'risk'],
    queryFn: async () => {
      const res = await api.get('/admin/students/at-risk');
      return res.data;
    }
  });
  const riskStudents: AtRiskStudent[] = riskData?.students || [];

  // Bulk Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ action, items }: { action: 'approve' | 'reject', items: string[] }) => {
      await api.post('/admin/approve', { action, items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] });
      setSelectedApprovals(new Set());
    }
  });

  // Single Item Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, action, type }: { id: string; action: 'approve' | 'reject'; type: string }) => {
      if (type === 'HOUSE_TRANSFER') {
        await api.post(`/admin/house-transfers/${id}/review`, { action });
      } else {
        await api.post('/admin/approve', { action, items: [id] });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] });
      setSelectedApprovals(new Set());
    }
  });

  // Fetch Complaints
  const { data: complaintsData, isLoading: isLoadingComplaints } = useQuery({
    queryKey: ['admin', 'complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints/admin');
      return res.data;
    },
    enabled: user?.role === 'ADMIN' || user?.role === 'TEACHER'
  });
  const complaints: ComplaintItem[] = complaintsData?.complaints || [];

  // Update Complaint Mutation
  const updateComplaintMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      await api.patch(`/complaints/admin/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] });
    }
  });

  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  // Role check AFTER all hooks
  if (user?.role !== 'ADMIN' && user?.role !== 'TEACHER') {
    return <Navigate to="/profile" replace />;
  }

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedApprovals(new Set(approvals.map(a => a.id)));
    } else {
      setSelectedApprovals(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedApprovals);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedApprovals(newSet);
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedApprovals.size === 0) return;
    approveMutation.mutate({ action, items: Array.from(selectedApprovals) });
  };

  // Complaint Actions
  const handleSaveNotes = (id: string, newStatus: string) => {
    updateComplaintMutation.mutate({ 
      id, 
      status: newStatus, 
      adminNotes: editingNotes[id] !== undefined ? editingNotes[id] : complaints.find(c => c.id === id)?.notes 
    });
    setExpandedComplaint(null);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await api.get(`/admin/export/students?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
        const link = document.createElement('a');
        link.href = dataStr;
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (e) {
      console.error('Export failed', e);
      alert('Failed to export data');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Department Tools</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Welcome, {user.name} ({user.role})</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '2rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {(['approvals', 'moderation', 'rubric', 'discipline', 'risk', 'export'] as Tab[]).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'approvals' ? `Approvals (${approvals.length})` : 
             tab === 'moderation' ? `Moderation (${complaints.filter(c => c.status !== 'RESOLVED').length})` :
             tab === 'rubric' ? 'Rubric Config' : 
             tab === 'discipline' ? 'Discipline Log' : 
             tab === 'risk' ? 'At-Risk Students' : 'Export & Reports'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {selectedApprovals.size} selected
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleBulkAction('reject')}
                  disabled={selectedApprovals.size === 0}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #e11d48', color: '#e11d48', borderRadius: 'var(--radius-sm)', cursor: selectedApprovals.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedApprovals.size === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <X /> Reject Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('approve')}
                  disabled={selectedApprovals.size === 0}
                  style={{ padding: '0.5rem 1rem', background: 'var(--text-primary)', border: 'none', color: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', cursor: selectedApprovals.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedApprovals.size === 0 ? 0.5 : 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Check weight="bold" /> Approve Selected
                </button>
              </div>
            </div>

            <div className="responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                    <th style={{ padding: '1rem', width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={approvals.length > 0 && selectedApprovals.size === approvals.length}
                        onChange={handleSelectAll}
                        aria-label="Select all approvals"
                      />
                    </th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Details</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Submitted</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No pending approvals.</td></tr>
                  ) : (
                    approvals.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: selectedApprovals.has(a.id) ? 'color-mix(in srgb, var(--accent-house) 5%, transparent)' : 'transparent' }}>
                        <td style={{ padding: '1rem' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedApprovals.has(a.id)}
                            onChange={() => handleSelect(a.id)}
                            aria-label={`Select approval for ${a.studentName}`}
                          />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600 }}>{a.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{a.studentHouse}</span>
                            {a.targetHouse && (
                              <>
                                <span>➔</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-house)' }}>{a.targetHouse}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: a.type === 'HOUSE_TRANSFER' ? 'rgba(234, 179, 8, 0.12)' : 'var(--bg-surface)',
                            border: a.type === 'HOUSE_TRANSFER' ? '1px solid #eab308' : '1px solid var(--border-strong)',
                            color: a.type === 'HOUSE_TRANSFER' ? '#eab308' : 'inherit',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.04em'
                          }}>
                            {a.type === 'HOUSE_TRANSFER' ? 'HOUSE TRANSFER' : a.type}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '300px', fontSize: '0.85rem' }}>
                          <div>{a.description}</div>
                          {a.type === 'CERTIFICATE' && (
                            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', width: 'fit-content' }}>
                              <Warning size={12} weight="bold" />
                              Defaults to 10pts. Override manually if higher tier.
                            </div>
                          )}
                        </td>
                        <td className="mono" style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(a.date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => reviewMutation.mutate({ id: a.id, action: 'reject', type: a.type })}
                              disabled={reviewMutation.isPending}
                              title="Reject"
                              style={{
                                padding: '5px 10px',
                                background: 'transparent',
                                border: '1px solid #e11d48',
                                color: '#e11d48',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <X size={13} /> Reject
                            </button>
                            <button
                              onClick={() => reviewMutation.mutate({ id: a.id, action: 'approve', type: a.type })}
                              disabled={reviewMutation.isPending}
                              title="Approve"
                              style={{
                                padding: '5px 10px',
                                background: '#10b981',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Check size={13} weight="bold" /> Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPLAINT MODERATION */}
        {activeTab === 'moderation' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {complaints.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No active complaints in your scope.</div>
            ) : (
              complaints.map(c => (
                <div key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {/* Row Summary */}
                  <div 
                    onClick={() => {
                      setExpandedComplaint(expandedComplaint === c.id ? null : c.id);
                      if (expandedComplaint !== c.id) setEditingNotes({ ...editingNotes, [c.id]: c.notes || '' });
                    }}
                    style={{ padding: '1rem', display: 'flex', gap: '2rem', cursor: 'pointer', background: expandedComplaint === c.id ? 'var(--bg-surface)' : 'transparent', alignItems: 'center' }}
                  >
                    <div className="mono" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.trackingCode}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', background: 'var(--border-strong)', borderRadius: 'var(--radius-sm)' }}>
                      {c.category}
                    </div>
                    <div className="mono" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(c.date || c.reportedDay).toLocaleDateString()}</div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: c.status === 'SUBMITTED' ? '#e11d48' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <MagnifyingGlass color="var(--text-secondary)" />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedComplaint === c.id && (
                    <div style={{ padding: '2rem', borderTop: '1px dashed var(--border-strong)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Complaint Content</div>
                        <p style={{ margin: 0, padding: '1rem', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)' }}>
                          {c.content}
                        </p>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Admin Notes (Visible to Student)</div>
                        <textarea 
                          value={editingNotes[c.id] || ''}
                          onChange={(e) => setEditingNotes({ ...editingNotes, [c.id]: e.target.value })}
                          rows={3}
                          style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                          placeholder="Updates or resolution details..."
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleSaveNotes(c.id, 'RESOLVED')}
                          disabled={updateComplaintMutation.isPending}
                          style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: updateComplaintMutation.isPending ? 'not-allowed' : 'pointer', opacity: updateComplaintMutation.isPending ? 0.5 : 1 }}
                        >
                          Mark Resolved
                        </button>
                        <button 
                          onClick={() => handleSaveNotes(c.id, 'UNDER_REVIEW')}
                          disabled={updateComplaintMutation.isPending}
                          style={{ padding: '0.5rem 1rem', background: 'var(--text-primary)', border: 'none', color: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', cursor: updateComplaintMutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: updateComplaintMutation.isPending ? 0.5 : 1 }}
                        >
                          Save Notes & Mark In Progress
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* AT RISK STUDENTS */}
        {activeTab === 'risk' && (
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>House</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Points</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Last Active</th>
                  <th style={{ padding: '1rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {riskStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '1rem' }}>{s.house}</td>
                    <td className="mono" style={{ padding: '1rem', color: '#e11d48' }}>{s.points}</td>
                    <td className="mono" style={{ padding: '1rem' }}>{s.lastActive}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button disabled title="Not Implemented Yet" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'not-allowed', opacity: 0.5, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Warning weight="fill" /> Flag for Check-in
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EXPORT */}
        {activeTab === 'export' && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <Shield weight="duotone" size={48} color="var(--border-strong)" />
            <div>
              <h2 style={{ margin: 0 }}>Department Records</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Export full point standings, redemptions, and activity logs for accreditation.</p>
            </div>
            
            <button 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', background: 'var(--text-primary)', border: 'none', color: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => handleExport('csv')}
            >
              <DownloadSimple weight="bold" /> Download Full CSV Report
            </button>
          </div>
        )}

        {/* RUBRIC */}
        {activeTab === 'rubric' && <AdminRubricTab />}

        {/* DISCIPLINE */}
        {activeTab === 'discipline' && <AdminDisciplineTab />}
      </div>

    </div>
  );
}
