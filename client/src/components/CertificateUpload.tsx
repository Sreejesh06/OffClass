import { useState, useRef } from 'react';
import { UploadSimple, CheckCircle, XCircle } from '@phosphor-icons/react';
import { api } from '../lib/api';

type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'verifying' | 'success' | 'error';

export function CertificateUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSuccessMsg(`Successfully uploaded ${file.name}. Pending review.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred during upload. Please try again.');
    }
  };

  return (
    <div className="dossier-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="dossier-header" style={{ marginBottom: 0, paddingBottom: '0.5rem', border: 'none' }}>
        <h2 style={{ margin: 0 }}>SUBMIT CERTIFICATE</h2>
      </div>

      <p style={{ margin: 0, fontSize: '0.875rem' }}>Upload certifications to earn points. Max 5MB, PDF/JPG/PNG only.</p>

      {/* Upload Zone */}
      <div 
        onClick={() => status !== 'uploading' && status !== 'presigning' && fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          textAlign: 'center',
          cursor: status === 'uploading' || status === 'presigning' ? 'wait' : 'pointer',
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 50%, transparent)',
          transition: 'background-color 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
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
            <UploadSimple size={32} color="var(--text-secondary)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to select file</span>
          </>
        ) : (
          <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>
                {status === 'presigning' ? 'Preparing upload...' : status === 'verifying' ? 'Verifying with server...' : 'Uploading...'}
              </span>
              <span className="mono" style={{ color: 'var(--accent-house)' }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--accent-house)', transition: 'width 0.2s ease-out' }} />
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'color-mix(in srgb, #e11d48 10%, transparent)', borderRadius: 'var(--radius-sm)', border: '1px solid #e11d48' }}>
          <XCircle size={20} weight="fill" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-house)', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'color-mix(in srgb, var(--accent-house) 10%, transparent)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-house)' }}>
          <CheckCircle size={20} weight="fill" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
