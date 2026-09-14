import React from 'react';
import { X, ShieldCheck } from '@phosphor-icons/react';
import { AccountLinker } from './AccountLinker';

interface IntegrationsModalProps {
  onClose: () => void;
}

export function IntegrationsModal({ onClose }: IntegrationsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={18} weight="fill" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 font-display">Manage Integrations</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <AccountLinker />
        </div>
      </div>
    </div>
  );
}
