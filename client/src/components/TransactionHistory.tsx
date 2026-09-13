import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Transaction {
  id: string;
  createdAt: string;
  delta: number;
  reason: string;
}

export function TransactionHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['ledger'],
    queryFn: async () => {
      const res = await api.get('/ledger/me');
      return res.data;
    }
  });

  const transactions: Transaction[] = data?.transactions || [];

  return (
    <div className="dossier-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="dossier-header" style={{ padding: '1.5rem 1.5rem 1rem', margin: 0, borderBottom: '1px solid var(--border-strong)' }}>
        <h2 style={{ margin: 0 }}>POINTS LEDGER</h2>
      </div>
      
      <div className="responsive-table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-strong)', background: 'var(--bg-base)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Timestamp</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Reason</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody className="mono">
            {isLoading ? (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading ledger...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</td>
              </tr>
            ) : transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {tx.reason}
                </td>
                <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>
                  {tx.delta > 0 ? (
                    <span style={{ color: 'var(--accent-house)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <ArrowUpRight weight="bold" /> +{tx.delta}
                    </span>
                  ) : (
                    <span style={{ color: '#e11d48', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <ArrowDownRight weight="bold" /> {tx.delta}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
