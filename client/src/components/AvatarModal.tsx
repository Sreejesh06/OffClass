import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, UploadSimple } from '@phosphor-icons/react';
import { api } from '../lib/api';

interface AvatarModalProps {
  currentAvatar: string | null;
  onClose: () => void;
}

const AVATAR_SEEDS = ["Felix", "Aneka", "Oliver", "Zoe", "Leo", "Mia", "Noah", "Ava"];

export function AvatarModal({ currentAvatar, onClose }: AvatarModalProps) {
  const [selected, setSelected] = useState<string | null>(currentAvatar);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (avatar: string) => {
      await api.patch('/users/me/avatar', { avatar });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      onClose();
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        // Crop to square
        const minDim = Math.min(width, height);
        const sx = (width - minDim) / 2;
        const sy = (height - minDim) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);
          const base64Str = canvas.toDataURL('image/jpeg', 0.8);
          setSelected(base64Str);
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isBase64 = selected?.startsWith('data:image');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-[2rem] shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground font-display">Choose Avatar</h2>
            <p className="text-sm text-muted-foreground font-sans mt-1">Select your operative identity</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X weight="bold" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Custom Upload Section */}
          <div className="mb-6">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-3 px-4 border-2 border-dashed border-border rounded-xl text-sm font-bold text-muted-foreground hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <UploadSimple size={20} />
              {isProcessing ? 'Processing...' : 'Upload Custom Picture'}
            </button>
            
            {isBase64 && (
              <div className="mt-4 flex flex-col items-center">
                <p className="text-xs text-muted-foreground mb-2">Uploaded Picture:</p>
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-orange-500 shadow-md">
                   <img src={selected} alt="Custom avatar" className="w-full h-full object-cover" />
                   <div className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <Check size={12} weight="bold" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Or choose a preset</p>
          <div className="grid grid-cols-4 gap-4">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                onClick={() => setSelected(seed)}
                className={`relative group rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                  selected === seed ? 'border-orange-500 shadow-md transform scale-105' : 'border-border hover:border-border/80'
                }`}
              >
                <div className="bg-muted/50 pt-2 px-2 aspect-square">
                  <img 
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=transparent`}
                    alt={seed}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selected === seed && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <Check size={12} weight="bold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => { if (selected) mutation.mutate(selected); }}
            disabled={!selected || selected === currentAvatar || mutation.isPending}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
          >
            {mutation.isPending ? 'Saving...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
