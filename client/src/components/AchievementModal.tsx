import React, { useState, useRef } from 'react';
import { X, Trophy, MapPin, CalendarBlank, GraduationCap, Money, Checks, UploadSimple, Image as ImageIcon, Trash } from '@phosphor-icons/react';
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
    description: '',
    images: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (formData.images.length >= 5) {
      setError('You can only upload up to 5 pictures.');
      return;
    }

    setIsProcessingImage(true);
    
    // Process one file (or we could loop, but let's keep it simple for now)
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Str = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, images: [...prev.images, base64Str] }));
        }
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

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
      <div className="bg-card text-card-foreground rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-card text-card-foreground z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Trophy size={18} weight="fill" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-display">Add Achievement</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-muted-foreground hover:bg-muted/50 rounded-full transition-colors"
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
            <label className="block text-sm font-bold text-muted-foreground mb-1">Event / Achievement Title *</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. DEFCON 2026 Qualifiers"
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Category *</label>
              <select 
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="HACKATHON">Hackathon</option>
                <option value="CTF">Capture The Flag</option>
                <option value="COMPETITION">Competition</option>
                <option value="PUBLICATION">Publication</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Date *</label>
              <input 
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Result / Position *</label>
              <input 
                required
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g. 1st Place, Top 50"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-muted-foreground mb-1">Prize (Optional)</label>
              <input 
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                placeholder="e.g. $500, Swag"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Semester (Optional)</label>
            <input 
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              placeholder="e.g. Fall 2026"
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-1">Description / Links (Optional)</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Link to project, devpost, or paper..."
              rows={3}
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>


          {/* Images Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-muted-foreground">Evidence Pictures (Max 5)</label>
              <span className="text-xs text-muted-foreground">{formData.images.length}/5 added</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash weight="fill" className="text-white w-6 h-6" />
                  </button>
                </div>
              ))}
              
              {formData.images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-orange-500 hover:text-orange-500 transition-colors flex flex-col items-center justify-center text-muted-foreground gap-1"
                >
                  {isProcessingImage ? (
                    <span className="text-xs">Processing</span>
                  ) : (
                    <>
                      <UploadSimple size={20} />
                      <span className="text-xs font-bold">Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload}
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
