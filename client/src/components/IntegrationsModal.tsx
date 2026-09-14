import React from 'react';
import { X, ShieldCheck } from '@phosphor-icons/react';
import { AccountLinker } from './AccountLinker';
import { CertificateUpload } from './CertificateUpload';

interface IntegrationsModalProps {
  onClose: () => void;
}

export function IntegrationsModal({ onClose }: IntegrationsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={18} weight="fill" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-display">Manage Integrations</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Link Accounts</h3>
            <AccountLinker />
          </div>
          
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Upload Certificates</h3>
            <CertificateUpload />
          </div>
        </div>
      </div>
    </div>
  );
}
