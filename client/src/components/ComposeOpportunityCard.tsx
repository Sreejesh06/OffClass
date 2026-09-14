import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Calendar, Tag, Shield, Send } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { HouseEnum, OpportunityTypeEnum } from "shared";
import type { House, OpportunityType } from "shared";
import { cn } from "../lib/utils";

const OPPORTUNITY_TYPES: OpportunityType[] = [
  "BUG_BOUNTY", "HACKATHON", "CTF", "INTERNSHIP", 
  "WORKSHOP", "CERT_DISCOUNT", "OTHER"
];

const HOUSES: House[] = ["RED", "BLUE", "GREEN", "PURPLE"];

export function ComposeOpportunityCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [type, setType] = useState<OpportunityType>("OTHER");
  const [targetHouses, setTargetHouses] = useState<Set<House>>(new Set(HOUSES));
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/opportunities", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      // Reset form
      setTitle("");
      setDescription("");
      setExternalUrl("");
      setType("OTHER");
      setTargetHouses(new Set(HOUSES));
      setDeadline("");
      setIsExpanded(false);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to create opportunity");
    }
  });

  const toggleHouse = (house: House) => {
    const next = new Set(targetHouses);
    if (next.has(house)) {
      if (next.size > 1) next.delete(house); // Enforce at least 1
    } else {
      next.add(house);
    }
    setTargetHouses(next);
  };

  const handleSubmit = () => {
    setError("");

    if (!title || !description || !externalUrl) {
      setError("Please provide a title, description, and link.");
      return;
    }

    try {
      new URL(externalUrl);
    } catch {
      setError("Invalid URL format. Include https://");
      return;
    }

    createMutation.mutate({
      title,
      description,
      externalUrl,
      type,
      targetHouses: Array.from(targetHouses),
      deadline: deadline ? new Date(deadline).toISOString() : null,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-400">
      <div className="flex gap-4">
        
        {/* Avatar */}
        <div className="shrink-0">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
              {user?.name?.charAt(0) || "T"}
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          
          {error && (
            <div className="text-red-500 text-xs font-bold mb-1 bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {isExpanded && (
            <input 
              type="text"
              placeholder="Give it a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-bold text-gray-900 placeholder:text-gray-400 outline-none"
              autoFocus
            />
          )}

          <textarea
            placeholder={isExpanded ? "What are the details?" : "Post a new opportunity..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className={cn(
              "w-full bg-transparent text-gray-800 placeholder:text-gray-500 outline-none resize-none overflow-hidden transition-all",
              isExpanded ? "min-h-[80px] text-base" : "min-h-[24px] text-lg leading-tight"
            )}
            rows={isExpanded ? 3 : 1}
          />

          {isExpanded && (
            <div className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Link Input */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                <Link2 size={16} className="text-gray-400 shrink-0" />
                <input 
                  type="url"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
                />
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Type Selection */}
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as OpportunityType)}
                    className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-2 py-1.5 outline-none focus:border-gray-400 cursor-pointer"
                  >
                    {OPPORTUNITY_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <input 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg px-2 py-1 outline-none focus:border-gray-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* House Target Selection */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} /> Target Houses
                </span>
                <div className="flex flex-wrap gap-2">
                  {HOUSES.map(house => (
                    <button
                      key={house}
                      onClick={() => toggleHouse(house)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                        targetHouses.has(house) 
                          ? `bg-${house.toLowerCase()}-50 text-${house.toLowerCase()}-600 border-${house.toLowerCase()}-200` 
                          : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {house}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !title || !description || !externalUrl}
                  className="bg-gray-900 text-white font-bold px-6 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-95"
                >
                  <Send size={16} />
                  Post
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
