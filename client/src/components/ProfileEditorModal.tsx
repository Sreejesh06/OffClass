import React, { useState } from 'react';
import { X, Plus, Trash } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  isCurrent: boolean;
}

interface ProfileData {
  bio: string | null;
  workDomain: string | null;
  skills: string[];
  workExperiences: WorkExperience[];
}

interface ProfileEditorModalProps {
  initialData: ProfileData;
  onClose: () => void;
  isOnboarding?: boolean;
}

export function ProfileEditorModal({ initialData, onClose, isOnboarding = false }: ProfileEditorModalProps) {
  const queryClient = useQueryClient();
  const [bio, setBio] = useState(initialData.bio || '');
  const [workDomain, setWorkDomain] = useState(initialData.workDomain || '');
  const [skills, setSkills] = useState<string[]>(initialData.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<WorkExperience[]>(initialData.workExperiences || []);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.patch('/users/me/profile', {
        bio: bio.trim() || null,
        workDomain: workDomain.trim() || null,
        skills,
        workExperiences: experiences.map(e => ({
            ...e,
            description: e.description?.trim() || null
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onClose();
    },
  });

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', role: '', duration: '', description: '', isCurrent: false }]);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900">
              {isOnboarding ? 'Complete Your Profile' : 'Edit Profile'}
            </h2>
            {isOnboarding && (
              <p className="text-sm text-gray-500 mt-1">Add your skills and experience to get recognized!</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-gray-50/30">
          
          {/* Identity Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Identity & Focus</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Domain / Title</label>
                <input 
                  type="text" 
                  value={workDomain}
                  onChange={e => setWorkDomain(e.target.value)}
                  placeholder="e.g. Offensive Security, React Developer"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About Me (Bio)</label>
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={400}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Skills Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Technical Skills</h3>
            <div>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Add a skill (e.g. Python, Docker)"
                  className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  disabled={skills.length >= 20}
                />
                <button 
                  onClick={handleAddSkill}
                  className="px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 font-bold"
                  disabled={skills.length >= 20 || !newSkill.trim()}
                >
                  Add
                </button>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg text-sm text-gray-700 font-medium">
                      <span>{skill}</span>
                      <button onClick={() => removeSkill(index)} className="text-gray-400 hover:text-rose-500 ml-1">
                        <X size={14} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No skills added yet.</p>
              )}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Work Experience Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Work Experience</h3>
              <button 
                onClick={addExperience}
                className="flex items-center gap-1 text-xs font-bold bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} weight="bold" /> Add Entry
              </button>
            </div>
            
            <div className="space-y-4">
              {experiences.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
                  <p className="text-gray-400 text-sm">Add internships, roles, or major projects here.</p>
                </div>
              ) : (
                experiences.map((exp, index) => (
                  <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 relative group">
                    <button 
                      onClick={() => removeExperience(index)}
                      className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove experience"
                    >
                      <Trash size={18} />
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Company / Org</label>
                        <input 
                          type="text" 
                          value={exp.company}
                          onChange={e => updateExperience(index, 'company', e.target.value)}
                          placeholder="e.g. Google, Cryptid CTF Team"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role / Title</label>
                        <input 
                          type="text" 
                          value={exp.role}
                          onChange={e => updateExperience(index, 'role', e.target.value)}
                          placeholder="e.g. Security Intern"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                        <input 
                          type="text" 
                          value={exp.duration}
                          onChange={e => updateExperience(index, 'duration', e.target.value)}
                          placeholder="e.g. Jun 2025 - Present"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description (Optional)</label>
                        <textarea 
                          value={exp.description}
                          onChange={e => updateExperience(index, 'description', e.target.value)}
                          placeholder="What did you do there?"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:bg-white resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
          {!isOnboarding && (
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : isOnboarding ? 'Complete Profile' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
