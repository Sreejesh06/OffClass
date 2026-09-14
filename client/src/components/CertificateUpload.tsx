import { useState, useRef } from 'react';
import { UploadSimple, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'verifying' | 'success' | 'error';

export function CertificateUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');
    setStatus('idle');
    setProgress(0);

    // 1. Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File must be under 5MB.');
      return;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setErrorMsg('Invalid format. File must be PDF or JPG/PNG only.');
      return;
    }

    try {
      setStatus('presigning');
      
      const presignRes = await api.post('/integrations/certs/presign', {
        name: file.name,
        mimeType: file.type
      });
      const { uploadUrl, fileKey } = presignRes.data;

      setStatus('uploading');

      // Direct upload to MinIO using XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.floor((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload to storage failed.'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
        xhr.open('PUT', uploadUrl);
        // MinIO might require explicit Content-Type matching what we signed
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      setStatus('verifying');
      
      await api.post('/integrations/certs/verify', { fileKey });

      setStatus('success');
      setSuccessMsg(`Successfully uploaded ${file.name}. It is now displayed on your profile.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred during upload. Please try again.');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">

      <p style={{ margin: 0, fontSize: '0.875rem' }}>Upload certifications to earn points. Max 5MB, PDF/JPG/PNG only.</p>

      {/* Upload Zone */}
      <div 
        onClick={() => status !== 'uploading' && status !== 'presigning' && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center gap-4 transition-colors ${
          status === 'uploading' || status === 'presigning' 
            ? 'cursor-wait bg-gray-50 border-gray-200' 
            : 'cursor-pointer border-gray-300 hover:bg-gray-50 bg-white'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept=".pdf,image/jpeg,image/png" 
          style={{ display: 'none' }}
        />
        
        {status === 'idle' || status === 'error' || status === 'success' ? (
          <>
            <UploadSimple size={32} className="text-gray-400" />
            <span className="font-semibold text-gray-700">Click to select file</span>
          </>
        ) : (
          <div className="w-full max-w-xs flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                {status === 'presigning' ? 'Preparing upload...' : status === 'verifying' ? 'Verifying with server...' : 'Uploading...'}
              </span>
              <span className="font-mono text-blue-600 font-medium">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-200 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-rose-600 p-3 bg-rose-50 rounded-lg border border-rose-100">
          <XCircle size={20} weight="fill" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <CheckCircle size={20} weight="fill" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
