import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check } from '@phosphor-icons/react';
import { api } from '../lib/api';

interface AvatarModalProps {
  currentAvatar: string | null;
  onClose: () => void;
}

const AVATAR_SEEDS = ["Felix", "Aneka", "Oliver", "Zoe", "Leo", "Mia", "Noah", "Ava"];

export function AvatarModal({ currentAvatar, onClose }: AvatarModalProps) {
  const [selected, setSelected] = useState<string | null>(currentAvatar);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 font-display">Choose Avatar</h2>
            <p className="text-sm text-gray-500 font-sans mt-1">Select your operative identity</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X weight="bold" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {AVATAR_SEEDS.map((seed) => (
              <button
                key={seed}
                onClick={() => setSelected(seed)}
                className={`relative group rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                  selected === seed ? 'border-orange-500 shadow-md transform scale-105' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="bg-gray-50 pt-2 px-2 aspect-square">
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

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors text-sm"
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
