import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, WarningCircle, CheckCircle, Info } from '@phosphor-icons/react';
import { api } from '../lib/api';

export type HouseType = 'RED' | 'BLUE' | 'GREEN' | 'PURPLE';

interface HouseTransferModalProps {
  currentHouse: HouseType;
  onClose: () => void;
  onSuccess: () => void;
}

const HOUSE_DETAILS: Record<HouseType, { label: string; color: string; bg: string; border: string; desc: string }> = {
  RED: {
    label: 'Red House',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200 hover:border-rose-300',
    desc: 'Offensive Security',
  },
  BLUE: {
    label: 'Blue House',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-300',
    desc: 'Defensive Security',
  },
  GREEN: {
    label: 'Green House',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-300',
    desc: 'Secure Development',
  },
  PURPLE: {
    label: 'Purple House',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-300',
    desc: 'Cryptography Research',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-20"
        >
          <X size={18} weight="bold" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center text-center p-12">
            <CheckCircle size={56} weight="fill" className="text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 font-display mb-2">Ticket Submitted</h2>
            <p className="text-sm text-gray-500">
              Your house transfer ticket has been routed to department teachers for verification.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3 bg-white/90 backdrop-blur-md sticky top-0 z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} weight="fill" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-display">House Transfer</h2>
                <p className="text-xs text-gray-500 mt-0.5">Submit a ticket for faculty review.</p>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6">
              
              {/* Policy Banner */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/60 text-xs text-gray-600 leading-relaxed">
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" weight="fill" />
                <p>
                  <strong className="text-gray-900">Policy:</strong> Transfers require faculty approval. Your accumulated points will move to the new leaderboard upon acceptance.
                </p>
              </div>

              {/* Target House */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Target House
                </label>
                <div className="flex flex-col gap-2">
                  {availableHouses.map((houseKey) => {
                    const info = HOUSE_DETAILS[houseKey];
                    const isSelected = targetHouse === houseKey;
                    
                    return (
                      <button
                        key={houseKey}
                        type="button"
                        onClick={() => setTargetHouse(houseKey)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? `${info.bg} ${info.border.split(' ')[0]} ring-1 ring-${info.color.split('-')[1]}-500/50` 
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <div className={`font-bold text-sm ${isSelected ? info.color : 'text-gray-700'}`}>
                            {info.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{info.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? `border-${info.color.split('-')[1]}-500 bg-${info.color.split('-')[1]}-500 text-white` : 'border-gray-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Reason
                  </label>
                  <span className={`text-[10px] font-bold font-mono ${reason.length < 10 ? 'text-rose-500' : 'text-gray-400'}`}>
                    {reason.length}/500
                  </span>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="e.g. Project alignment, focus on red-teaming..."
                  className="w-full p-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-medium">
                  <WarningCircle size={16} weight="fill" className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || reason.trim().length < 10}
                  className="px-5 py-2 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-gray-900/20"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                  <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
