import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trophy, Image, Trash, Plus, Link as LinkIcon, CurrencyDollar, Buildings, GraduationCap, ArrowLeft } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export function SpotlightCompose() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [cashPrize, setCashPrize] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [links, setLinks] = useState<{label: string, url: string}[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  
  const [taggedStudentIds, setTaggedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");

  const { data: studentsData } = useQuery({
    queryKey: ['students-for-tagging'],
    queryFn: async () => {
      const res = await api.get('/spotlights/students');
      return res.data.students || [];
    },
    enabled: user?.role === 'ADMIN' || user?.role === 'TEACHER'
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post('/spotlights', { 
        title, 
        description, 
        image, 
        cashPrize, 
        department, 
        year, 
        links, 
        taggedStudentIds 
      });
    },
    onSuccess: () => {
      navigate("/hall-of-fame");
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setLinks([...links, { label: newLinkLabel, url: newLinkUrl }]);
      setNewLinkLabel("");
      setNewLinkUrl("");
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'TEACHER') {
    return <div className="p-8 text-center font-bold text-red-500">Access Denied</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 font-sans">
      <button 
        onClick={() => navigate("/hall-of-fame")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold text-sm w-fit"
      >
        <ArrowLeft size={16} weight="bold" /> Back to Hall of Fame
      </button>

      <div className="bg-card border-2 border-border shadow-lg rounded-3xl p-6 md:p-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
              <Trophy size={28} weight="fill" />
            </div>
            <h1 className="font-black text-2xl md:text-3xl text-foreground m-0">Publish a Victory</h1>
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-base ml-14">
            Broadcast a major student achievement, hackathon win, or department spotlight to the Hall of Fame.
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Headline */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Headline</label>
            <input 
              type="text" 
              placeholder="e.g. 1st Place at ETHGlobal!" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-background border-2 border-border focus:border-orange-500 rounded-xl px-4 py-3 font-bold text-lg text-foreground outline-none transition-colors"
            />
          </div>

          {/* Grid for Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Cash Prize (Optional)</label>
              <div className="relative">
                <CurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. $5,000" 
                  value={cashPrize} 
                  onChange={e => setCashPrize(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Department (Optional)</label>
              <div className="relative">
                <Buildings className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. CSE / IT" 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Year (Optional)</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 2nd Year" 
                  value={year} 
                  onChange={e => setYear(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Mission Report</label>
            <textarea 
              placeholder="Describe the achievement, the competition, and what the operatives built..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-background border-2 border-border focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-foreground outline-none transition-colors min-h-[160px] resize-y"
            />
          </div>

          {/* Student Tagging */}
          <div className="flex flex-col gap-3 bg-muted/20 p-5 rounded-2xl border-2 border-border border-dashed">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">Tag Operatives</span>
              <span className="text-xs text-muted-foreground">Select the students involved in this victory.</span>
            </div>
            
            {taggedStudentIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {taggedStudentIds.map(id => {
                  const s = studentsData?.find((s: any) => s.id === id);
                  if (!s) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                      {s.avatar ? (
                        <img src={s.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px]">{s.name.charAt(0)}</div>
                      )}
                      {s.name}
                      <button onClick={() => setTaggedStudentIds(prev => prev.filter(x => x !== id))} className="ml-1 text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-red-500/10">
                        <Trash size={14} weight="bold" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative w-full md:w-1/2">
              <input 
                type="text" 
                placeholder="Search students by name..." 
                value={studentSearch} 
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full bg-background border-2 border-border focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm font-medium outline-none shadow-sm"
              />
              {studentSearch && studentsData && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                  {studentsData.filter((s: any) => s.name.toLowerCase().includes(studentSearch.toLowerCase()) && !taggedStudentIds.includes(s.id)).slice(0, 8).map((s: any) => (
                    <button 
                      key={s.id}
                      onClick={() => {
                        setTaggedStudentIds([...taggedStudentIds, s.id]);
                        setStudentSearch("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors border-b border-border/50 last:border-0"
                    >
                      {s.avatar ? (
                        <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{s.name.charAt(0)}</div>
                      )}
                      <span className="font-bold text-sm text-foreground">{s.name}</span>
                      <span className="text-xs font-bold text-muted-foreground ml-auto bg-muted px-2 py-1 rounded-md">{s.house}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links Builder */}
          <div className="flex flex-col gap-3 bg-muted/20 p-5 rounded-2xl border-2 border-border border-dashed">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">Project Links (Optional)</span>
              <span className="text-xs text-muted-foreground">Add links to GitHub repos, news articles, or project sites.</span>
            </div>
            
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm">
                    <LinkIcon size={14} /> {link.label}
                    <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="ml-1 text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-red-500/10">
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Label (e.g. GitHub Repository)" 
                value={newLinkLabel} 
                onChange={e => setNewLinkLabel(e.target.value)}
                className="w-full md:w-1/3 bg-background border-2 border-border focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm font-medium outline-none shadow-sm"
              />
              <div className="flex gap-2 flex-1">
                <input 
                  type="text" 
                  placeholder="URL (https://...)" 
                  value={newLinkUrl} 
                  onChange={e => setNewLinkUrl(e.target.value)}
                  className="flex-1 bg-background border-2 border-border focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm font-medium outline-none shadow-sm"
                />
                <button onClick={addLink} className="bg-foreground text-background rounded-xl px-4 py-2.5 flex items-center justify-center hover:opacity-90 transition-opacity font-bold shadow-sm">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Cover Photo */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-foreground">Cover Photo</label>
            {image ? (
              <div className="relative w-full max-w-xl">
                <img src={image} alt="Preview" className="w-full max-h-80 object-cover rounded-2xl border-2 border-border shadow-sm" />
                <button onClick={() => setImage(null)} className="absolute top-4 right-4 bg-red-500/90 text-white rounded-full p-2 shadow-lg hover:bg-red-500 transition-colors backdrop-blur-sm">
                  <Trash size={20} weight="bold" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full md:w-fit flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted/30 border-2 border-border border-dashed hover:border-foreground/30 px-6 py-8 rounded-2xl"
              >
                <Image size={24} /> Upload Image...
              </button>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="pt-6 mt-2 border-t border-border flex justify-end">
            <button 
              onClick={() => postMutation.mutate()} 
              disabled={!title || !description || postMutation.isPending}
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 transition-all active:scale-95 text-lg"
            >
              {postMutation.isPending ? "Publishing..." : "Publish to Spotlight"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpotlightCompose;
