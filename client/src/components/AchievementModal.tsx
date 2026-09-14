import React, { useState } from 'react';
import { X, Trophy, MapPin, CalendarBlank, GraduationCap, Money, Checks } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface AchievementModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
  opportunityId?: string;
}

type AchievementCategory = 'HACKATHON' | 'CTF' | 'COMPETITION' | 'PUBLICATION' | 'OTHER';

export function AchievementModal({ onClose, onSuccess, initialTitle, opportunityId }: AchievementModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: initialTitle || '',
    category: 'HACKATHON' as AchievementCategory,
    position: '',
    date: '',
    semester: '',
    prize: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/users/me/achievements', { ...formData, opportunityId });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit achievement');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Trophy size={18} weight="fill" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-display">Add Achievement</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Board Tie-in Note */}
        {opportunityId && (
          <div className="px-6 pt-4">
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
              <Trophy size={16} />
              <span>Linking this achievement to the Opportunity Board post.</span>
            </div>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Event / Achievement Title *</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. DEFCON 2026 Qualifiers"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
              <select 
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="HACKATHON">Hackathon</option>
                <option value="CTF">Capture The Flag</option>
                <option value="COMPETITION">Competition</option>
                <option value="PUBLICATION">Publication</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date *</label>
              <input 
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Result / Position *</label>
              <input 
                required
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g. 1st Place, Top 50"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Prize (Optional)</label>
              <input 
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                placeholder="e.g. $500, Swag"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Semester (Optional)</label>
            <input 
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              placeholder="e.g. Fall 2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description / Links (Optional)</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Link to project, devpost, or paper..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Checks size={20} />
                  Submit for Approval
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              This will be reviewed by a teacher before appearing on your profile.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
