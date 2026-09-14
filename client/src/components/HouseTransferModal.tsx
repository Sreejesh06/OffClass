import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { api } from '../lib/api';

export type HouseType = 'RED' | 'BLUE' | 'GREEN' | 'PURPLE';

interface HouseTransferModalProps {
  currentHouse: HouseType;
  onClose: () => void;
  onSuccess: () => void;
}

const HOUSE_DETAILS: Record<HouseType, { label: string; color: string; bg: string; desc: string }> = {
  RED: {
    label: 'Red House',
    color: '#e11d48',
    bg: 'rgba(225, 29, 72, 0.12)',
    desc: 'Penetration Testing & Offensive Security',
  },
  BLUE: {
    label: 'Blue House',
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.12)',
    desc: 'Defensive Security & Incident Response',
  },
  GREEN: {
    label: 'Green House',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    desc: 'Secure Development & DevSecOps',
  },
  PURPLE: {
    label: 'Purple House',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    desc: 'Cryptography & Protocol Research',
  },
};

const ALL_HOUSES: HouseType[] = ['RED', 'BLUE', 'GREEN', 'PURPLE'];

export function HouseTransferModal({ currentHouse, onClose, onSuccess }: HouseTransferModalProps) {
  const availableHouses = ALL_HOUSES.filter((h) => h !== currentHouse);
  const [targetHouse, setTargetHouse] = useState<HouseType>(availableHouses[0] || 'BLUE');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError('Please provide a reason of at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/users/me/house-transfer', {
        targetHouse,
        reason: reason.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit transfer request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dossier-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle size={56} weight="fill" color="var(--accent-house)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>Ticket Submitted</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto' }}>
              Your house transfer ticket has been routed to department teachers for verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={22} color="var(--accent-house)" />
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Request House Transfer</h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                House allotment is locked. To change houses, raise a ticket for teacher review.
              </p>
            </div>

            {/* Department Notice Banner */}
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Policy Reminder:</span> Students are
              allotted a house upon joining. House changes require departmental faculty approval and will transfer your
              accumulated points to the new house leaderboard upon acceptance.
            </div>

            {/* Current vs Target House selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                Select Target House
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {availableHouses.map((houseKey) => {
                  const info = HOUSE_DETAILS[houseKey];
                  const isSelected = targetHouse === houseKey;
                  return (
                    <button
                      key={houseKey}
                      type="button"
                      onClick={() => setTargetHouse(houseKey)}
                      style={{
                        padding: '0.875rem',
                        textAlign: 'left',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? info.bg : 'var(--bg-base)',
                        border: isSelected ? `2px solid ${info.color}` : '1px solid var(--border-subtle)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: info.color }}>
                          {info.label}
                        </span>
                        {isSelected && <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: info.color, color: '#fff', borderRadius: '3px', fontWeight: 700 }}>SELECTED</span>}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {info.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason Textarea */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Reason for Transfer Request
                </label>
                <span style={{ fontSize: '0.7rem', color: reason.length < 10 ? '#e11d48' : 'var(--text-secondary)' }}>
                  {reason.length}/500 (min 10)
                </span>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Explain why you are requesting to transfer (e.g., project alignment, focus on offensive red-teaming, faculty recommendation)..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(225, 29, 72, 0.1)',
                  border: '1px solid #e11d48',
                  color: '#e11d48',
                  fontSize: '0.8rem',
                }}
              >
                <WarningCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || reason.trim().length < 10}
                style={{
                  padding: '0.65rem 1.4rem',
                  background: 'var(--text-primary)',
                  border: 'none',
                  color: 'var(--bg-base)',
                  borderRadius: '6px',
                  cursor: loading || reason.trim().length < 10 ? 'not-allowed' : 'pointer',
                  opacity: loading || reason.trim().length < 10 ? 0.5 : 1,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {loading ? 'Submitting Ticket...' : 'Submit Ticket'}
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
