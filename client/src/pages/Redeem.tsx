import { useState } from "react";
import { Gift, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  quantityRemaining: number | null;
  isActive: boolean;
}

export function Redeem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [status, setStatus] = useState<'idle' | 'confirm' | 'processing' | 'success' | 'error'>('idle');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  const { data: catalogueData, isLoading } = useQuery({
    queryKey: ['perks'],
    queryFn: async () => {
      const res = await api.get('/perks');
      return res.data;
    }
  });

  const CATALOGUE: Perk[] = catalogueData?.items || [];
  const userPoints = user?.points || 0;

  const redeemMutation = useMutation({
    mutationFn: async ({ id, idempotencyKey }: { id: string, idempotencyKey: string }) => {
      await api.post(`/perks/${id}/redeem`, { idempotencyKey });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perks'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    }
  });

  const handleSelect = (perk: Perk) => {
    const isAvailable = perk.quantityRemaining === null || perk.quantityRemaining > 0;
    if (!isAvailable || userPoints < perk.cost) return;
    setSelectedPerk(perk);
    setStatus('confirm');
    setIdempotencyKey(crypto.randomUUID());
  };

  const handleConfirm = () => {
    if (!selectedPerk) return;
    setStatus('processing');
    redeemMutation.mutate({ id: selectedPerk.id, idempotencyKey });
  };

  const handleReset = () => {
    setStatus('idle');
    setSelectedPerk(null);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Redemption Catalogue</h1>
          <p>Exchange your hard-earned points for real-world perks.</p>
        </div>
        <div className="dossier-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Available Balance</span>
          <span className="mono" style={{ fontSize: '2rem', color: 'var(--accent-house)', fontWeight: 700 }}>{userPoints}</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading catalogue...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {CATALOGUE.map(perk => {
            const isAvailable = perk.quantityRemaining === null || perk.quantityRemaining > 0;
            const canAfford = userPoints >= perk.cost;
            const disabled = !isAvailable || !canAfford;

            return (
              <div 
                key={perk.id}
                className="dossier-card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  opacity: disabled ? 0.6 : 1,
                  border: selectedPerk?.id === perk.id ? '2px solid var(--accent-house)' : '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                {!isAvailable && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--border-strong)', borderRadius: 'var(--radius-sm)' }}>
                    Out of Stock
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, paddingRight: '4rem' }}>{perk.name}</h3>
                  <span className="mono" style={{ color: canAfford ? 'var(--accent-house)' : '#e11d48', fontWeight: 600 }}>{perk.cost} pts</span>
                </div>
                <p style={{ fontSize: '0.875rem', flex: 1, margin: 0 }}>{perk.description}</p>
                
                <button 
                  disabled={disabled}
                  onClick={() => handleSelect(perk)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: canAfford && isAvailable ? 'var(--text-primary)' : 'var(--border-subtle)',
                    color: canAfford && isAvailable ? 'var(--bg-base)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    marginTop: 'auto'
                  }}
                >
                  <Gift size={20} weight={canAfford && isAvailable ? "fill" : "regular"} />
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Overlay Modal for Confirmation / Status */}
      {status !== 'idle' && selectedPerk && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="dossier-card" style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--accent-house)' }}>
            
            {status === 'confirm' && (
              <>
                <div>
                  <h3 style={{ margin: 0 }}>Confirm Transaction</h3>
                  <p style={{ margin: 0, marginTop: '0.5rem' }}>You are about to spend <strong className="mono" style={{ color: '#e11d48' }}>{selectedPerk.cost}</strong> points on <strong>{selectedPerk.name}</strong>.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleReset} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleConfirm} style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-house)', border: 'none', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
                </div>
              </>
            )}

            {status === 'processing' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Processing transaction...</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--border-strong)' }}>ID: {idempotencyKey}</div>
              </div>
            )}

            {status === 'success' && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle size={48} weight="fill" color="var(--accent-house)" />
                <div>
                  <h3 style={{ margin: 0 }}>Redemption Successful</h3>
                  <p style={{ margin: 0, marginTop: '0.5rem' }}>Your request for <strong>{selectedPerk.name}</strong> has been logged in the ledger and sent for fulfillment.</p>
                </div>
                <button onClick={handleReset} style={{ width: '100%', padding: '0.75rem', background: 'var(--text-primary)', border: 'none', color: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Close</button>
              </div>
            )}

            {status === 'error' && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <XCircle size={48} weight="fill" color="#e11d48" />
                <div>
                  <h3 style={{ margin: 0 }}>Transaction Failed</h3>
                  <p style={{ margin: 0, marginTop: '0.5rem' }}>There was an issue processing your request. Your points have not been deducted.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <button onClick={handleReset} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleConfirm} style={{ flex: 1, padding: '0.75rem', background: '#e11d48', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
