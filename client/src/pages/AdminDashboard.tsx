import React, { useState } from "react";
import { CheckCircle, XCircle, Warning, DownloadSimple, Shield, MagnifyingGlass, UserCircle, Export, ChartLineUp, Storefront, FileText } from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'fulfillment' | 'approvals' | 'moderation' | 'risk' | 'export'>('fulfillment');
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // FULFILLMENT QUEUE
  const { data: fulfillments = [], isLoading: loadingFills } = useQuery({
    queryKey: ['admin-fulfillment'],
    queryFn: async () => {
      const res = await api.get('/admin/redemptions');
      return res.data.redemptions || [];
    }
  });

  const fulfillMutation = useMutation({
    mutationFn: async (redemptionId: string) => {
      await api.patch(`/admin/redemptions/${redemptionId}`, { action: 'fulfill' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fulfillment'] });
    }
  });

  // APPROVALS QUEUE
  const { data: approvalsData } = useQuery({
    queryKey: ['admin-approvals'],
    queryFn: async () => {
      const res = await api.get('/admin/approvals');
      return res.data;
    }
  });
  const approvals = approvalsData?.approvals || approvalsData || [];

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string, approved: boolean }) => {
      await api.post('/admin/approve', { items: [id], action: approved ? 'approve' : 'reject' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
    }
  });

  // COMPLAINTS
  const { data: complaintsData } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints/admin');
      return res.data;
    }
  });
  const complaints = complaintsData?.complaints || [];

  const complaintMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string, status: string, adminNotes: string }) => {
      await api.patch(`/complaints/admin/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      setExpandedComplaint(null);
    }
  });

  // AT RISK
  const { data: riskData } = useQuery({
    queryKey: ['admin-risk'],
    queryFn: async () => {
      const res = await api.get('/admin/students/at-risk');
      return res.data;
    }
  });
  const riskStudents = riskData?.students || [];

  const handleApprove = (id: string, approved: boolean) => {
    approveMutation.mutate({ id, approved });
  };

  const handleSaveNotes = (id: string, newStatus: string) => {
    const adminNotes = editingNotes[id] || '';
    complaintMutation.mutate({ id, status: newStatus, adminNotes });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    window.open(`/api/admin/export/students?format=${format}`, '_blank');
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'TEACHER') {
    return <div className="p-12 text-center text-red-500 font-bold text-xl">Access Denied</div>;
  }

  const tabs = [
    { id: 'fulfillment', label: 'Fulfillment', icon: <Storefront size={18} weight={activeTab === 'fulfillment' ? 'fill' : 'regular'} /> },
    { id: 'approvals', label: 'Point Approvals', icon: <CheckCircle size={18} weight={activeTab === 'approvals' ? 'fill' : 'regular'} /> },
    { id: 'moderation', label: 'Complaints', icon: <FileText size={18} weight={activeTab === 'moderation' ? 'fill' : 'regular'} /> },
    { id: 'risk', label: 'At-Risk Watch', icon: <Warning size={18} weight={activeTab === 'risk' ? 'fill' : 'regular'} /> },
    { id: 'export', label: 'Export Data', icon: <Export size={18} weight={activeTab === 'export' ? 'fill' : 'regular'} /> },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black text-foreground m-0 flex items-center gap-3">
          <Shield size={36} className="text-blue-500" weight="duotone" /> 
          Department Command
        </h1>
        <p className="text-muted-foreground font-medium text-lg m-0">
          Manage point approvals, fulfill perks, and oversee department health.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id 
                ? "border-blue-500 text-blue-500 bg-blue-500/10 rounded-t-xl" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted rounded-t-xl"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden min-h-[400px]">
        
        {/* FULFILLMENT QUEUE */}
        {activeTab === 'fulfillment' && (
          <div className="flex flex-col">
            {loadingFills ? (
              <div className="p-12 text-center text-muted-foreground font-bold">Loading queue...</div>
            ) : fulfillments.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <Storefront size={48} className="text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-foreground">Queue is clear</h3>
                <p className="text-muted-foreground">No pending perk fulfillments at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Item</th>
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Requested</th>
                      <th className="p-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fulfillments.map((f: any) => (
                      <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-foreground">{f.perkItem.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase font-bold">{f.perkItem.type}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {f.user.avatar ? (
                              <img src={f.user.avatar} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{f.user.name.charAt(0)}</div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground">{f.user.name}</span>
                              <span className="text-xs text-muted-foreground">{f.user.house}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            NEEDS FULFILLMENT
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-muted-foreground">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => fulfillMutation.mutate(f.id)}
                            disabled={fulfillMutation.isPending}
                            className="inline-flex items-center gap-1.5 bg-green-500 text-white hover:bg-green-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                          >
                            <CheckCircle weight="bold" /> Fulfill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="flex flex-col">
            {approvals.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <CheckCircle size={48} className="text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-foreground">Inbox Zero</h3>
                <p className="text-muted-foreground">All point submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Submission</th>
                      
                      <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="p-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map(a => (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-sm text-foreground">{a.studentName}</div>
                          <div className="text-xs text-muted-foreground font-bold">{a.studentHouse}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-sm text-foreground">{a.type}</div>
                          <div className="text-xs text-muted-foreground">{a.description}</div>
                        </td>
                        
                        <td className="p-4 text-sm font-medium text-muted-foreground">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleApprove(a.id, true)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve">
                              <CheckCircle size={20} weight="bold" />
                            </button>
                            <button onClick={() => handleApprove(a.id, false)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject">
                              <XCircle size={20} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COMPLAINTS */}
        {activeTab === 'moderation' && (
          <div className="flex flex-col">
            {complaints.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <FileText size={48} className="text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No active complaints</h3>
                <p className="text-muted-foreground">The department is quiet.</p>
              </div>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="border-b border-border last:border-0">
                  {/* Row Summary */}
                  <div 
                    onClick={() => {
                      setExpandedComplaint(expandedComplaint === c.id ? null : c.id);
                      if (expandedComplaint !== c.id) setEditingNotes({ ...editingNotes, [c.id]: c.adminNotes });
                    }}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${expandedComplaint === c.id ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                  >
                    <div className="font-mono text-sm font-bold text-foreground bg-background border border-border px-2 py-1 rounded-md">{c.trackingCode}</div>
                    <div className="text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-1 rounded-md">
                      {c.category}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground hidden md:block">{new Date(c.reportedDay).toLocaleDateString()}</div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className={`text-xs font-bold uppercase ${c.status === 'SUBMITTED' ? 'text-red-500' : 'text-blue-500'}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <div className="p-1.5 bg-background border border-border rounded-lg text-muted-foreground">
                        <MagnifyingGlass size={16} weight="bold" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedComplaint === c.id && (
                    <div className="p-6 bg-muted/20 border-t border-border flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Complaint Content</div>
                        <p className="m-0 p-4 bg-background border border-border rounded-xl text-sm leading-relaxed text-foreground">
                          {c.content}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Admin Notes (Visible to Student)</div>
                        <textarea 
                          value={editingNotes[c.id] || ''}
                          onChange={(e) => setEditingNotes({ ...editingNotes, [c.id]: e.target.value })}
                          rows={3}
                          className="w-full p-4 bg-background border border-border focus:border-blue-500 rounded-xl text-sm text-foreground outline-none transition-colors resize-y min-h-[100px]"
                          placeholder="Updates or resolution details..."
                        />
                      </div>

                      <div className="flex flex-wrap justify-end gap-3">
                        <button 
                          onClick={() => handleSaveNotes(c.id, 'REJECTED')}
                          className="px-4 py-2 bg-background hover:bg-red-500/10 hover:text-red-500 border border-border hover:border-red-500/20 text-foreground rounded-xl text-sm font-bold transition-colors"
                        >
                          Reject Complaint
                        </button>
                        <button 
                          onClick={() => handleSaveNotes(c.id, 'PUBLISHED')}
                          className="px-4 py-2 bg-background hover:bg-green-500/10 hover:text-green-500 border border-border hover:border-green-500/20 text-foreground rounded-xl text-sm font-bold transition-colors"
                        >
                          Publish Resolution
                        </button>
                        <button 
                          onClick={() => handleSaveNotes(c.id, 'UNDER_REVIEW')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                        >
                          Save Notes & In Progress
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">House</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Points</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Active</th>
                  <th className="p-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {riskStudents.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-sm text-foreground">{s.name}</td>
                    <td className="p-4 text-xs font-bold text-muted-foreground">{s.house}</td>
                    <td className="p-4 font-mono font-bold text-red-500">{s.points}</td>
                    <td className="p-4 text-sm font-medium text-muted-foreground">{s.lastActive}</td>
                    <td className="p-4 text-right">
                      <button className="inline-flex items-center gap-1.5 bg-background border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        <Warning weight="bold" /> Flag
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
          <div className="p-12 md:p-20 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <DownloadSimple size={48} weight="duotone" />
            </div>
            
            <div className="max-w-md">
              <h2 className="text-2xl font-black text-foreground mb-2">Department Records</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Export full point standings, redemptions, and activity logs for official college accreditation or department review.
              </p>
            </div>
            
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-8 py-4 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95"
            >
              <DownloadSimple size={20} weight="bold" /> Download Full CSV Report
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminDashboard;
