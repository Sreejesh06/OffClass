import React from 'react';
import { X, Certificate } from '@phosphor-icons/react';
import { CertificateUpload } from './CertificateUpload';

interface CertificateUploadModalProps {
  onClose: () => void;
}

export function CertificateUploadModal({ onClose }: CertificateUploadModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Certificate size={18} weight="fill" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-display">Add Certificate</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <CertificateUpload />
        </div>
      </div>
    </div>
  );
}
