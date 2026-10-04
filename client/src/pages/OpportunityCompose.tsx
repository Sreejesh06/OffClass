import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Calendar, Tag, Shield, Send, ArrowLeft, Image, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { OpportunityTypeEnum } from "shared";
import type { House, OpportunityType } from "shared";
import { cn } from "../lib/utils";

const OPPORTUNITY_TYPES: OpportunityType[] = [
  "BUG_BOUNTY", "HACKATHON", "CTF", "INTERNSHIP", 
  "WORKSHOP", "CERT_DISCOUNT", "OTHER"
];

const HOUSES: House[] = ["RED", "BLUE", "GREEN", "PURPLE"];

export function OpportunityCompose() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [type, setType] = useState<OpportunityType>("OTHER");
  const [targetHouses, setTargetHouses] = useState<Set<House>>(new Set(HOUSES));
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/opportunities", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      navigate("/opportunities");
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to post opportunity");
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

  const toggleHouse = (house: House) => {
    const next = new Set(targetHouses);
    if (next.has(house)) next.delete(house);
    else next.add(house);
    
    if (next.size === 0) return; // Prevent deselecting all
    setTargetHouses(next);
  };

  const handleSubmit = () => {
    setError("");
    if (!title || !description || !externalUrl) {
      setError("Please fill in title, description, and external URL");
      return;
    }

    try {
      new URL(externalUrl);
    } catch {
      setError("Please provide a valid full URL (e.g. https://google.com)");
      return;
    }

    createMutation.mutate({
      title,
      description,
      externalUrl,
      type,
      image,
      targetHouses: Array.from(targetHouses),
      deadline: deadline ? new Date(deadline).toISOString() : null,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 font-sans">
      <button 
        onClick={() => navigate("/opportunities")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-bold text-sm w-fit"
      >
        <ArrowLeft size={16} /> Back to Headquarters
      </button>

      <div className="bg-card border-2 border-border shadow-lg rounded-3xl p-6 md:p-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Shield size={28} />
            </div>
            <h1 className="font-black text-2xl md:text-3xl text-foreground m-0">Post an Opportunity</h1>
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-base ml-14">
            Broadcast a new bounty, CTF, or event to the department.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Headline */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Headline</label>
            <input 
              type="text" 
              placeholder="Give it a catchy title..." 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-background border-2 border-border focus:border-blue-500 rounded-xl px-4 py-3 font-bold text-lg text-foreground outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Mission Details</label>
            <textarea 
              placeholder="What are the details?" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-background border-2 border-border focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-foreground outline-none transition-colors min-h-[160px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">External URL</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={externalUrl} 
                  onChange={e => setExternalUrl(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Deadline (Optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="date" 
                  value={deadline} 
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-colors text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" /> Category
              </label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as OpportunityType)}
                className="w-full bg-background border-2 border-border focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground outline-none transition-colors appearance-none"
              >
                {OPPORTUNITY_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Target Houses
              </label>
              <div className="flex flex-wrap gap-2">
                {HOUSES.map(h => {
                  const isSelected = targetHouses.has(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHouse(h)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        isSelected 
                          ? "bg-foreground text-background border-foreground shadow-sm" 
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Add Cover Photo</label>
            {image ? (
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border-4 border-border shadow-md">
                <img src={image} className="w-full object-cover" />
                <button 
                  onClick={() => setImage(null)} 
                  className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black backdrop-blur-sm transition-colors"
                >
                  <X size={16} weight="bold" />
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

          <div className="pt-6 mt-4 border-t border-border flex justify-end">
            <button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || !title || !description || !externalUrl}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 transition-all active:scale-95 text-lg"
            >
              <Send className="w-5 h-5" />
              {createMutation.isPending ? "Posting..." : "Post Opportunity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpportunityCompose;
