import React, { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { Trophy, Image, Trash, Plus, Link as LinkIcon, CurrencyDollar, Buildings, Sparkle, X, GraduationCap, Funnel } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function HallOfFame() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
                    
      const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedSpotlight, setSelectedSpotlight] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['spotlights'],
    queryFn: async () => {
      const res = await api.get('/spotlights');
      return res.data.spotlights || [];
    }
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-for-tagging'],
    queryFn: async () => {
      const res = await api.get('/spotlights/students');
      return res.data.students || [];
    },
    enabled: user?.role === 'ADMIN' || user?.role === 'TEACHER'
  });

  
  const departments = useMemo(() => {
    if (!data) return ["ALL"];
    const deps = data.map((d: any) => d.department).filter(Boolean);
    return ["ALL", ...Array.from(new Set(deps))];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((spotlight: any) => {
      if (departmentFilter !== "ALL" && spotlight.department !== departmentFilter) return false;
      return true;
    });
  }, [data, departmentFilter]);

    const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/spotlights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotlights'] });
    }
  });

    return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6 font-sans">
      
      {/* Hero Banner */}
      <div className="w-full rounded-3xl p-8 md:p-12 text-white shadow-xl relative flex flex-col justify-end min-h-[200px] md:min-h-[250px] bg-gradient-to-br from-amber-500 to-orange-700">
        {/* Isolated overflow container for background graphic */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <Sparkle size={250} />
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
              Department Spotlight
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
              A gallery of student wins, hackathon victories, and academic achievements.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 shrink-0">
            {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
              <RouterLink 
                to="/hall-of-fame/new"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-orange-600 hover:bg-white/90 shadow-lg transition-colors"
              >
                <Plus size={18} weight="bold" /> Publish Victory
              </RouterLink>
            )}
            
            {/* Filter positioned inside the banner */}
            <div className="relative shrink-0">
              <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md transition-colors border ${
                departmentFilter !== "ALL" || showFilterMenu
                  ? "bg-white text-orange-600 border-white" 
                  : "bg-black/20 text-white border-transparent hover:bg-black/30"
              }`}
            >
              <Funnel size={18} weight="bold" /> 
              {departmentFilter === "ALL" ? "Filter" : `Dept: ${departmentFilter}`}
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Department
                </div>
                {departments.map((dep: any) => (
                  <button
                    key={dep}
                    onClick={() => {
                      setDepartmentFilter(dep);
                      setShowFilterMenu(false);
                    }}
                    className={`px-4 py-3 text-sm font-bold text-left transition-colors flex items-center justify-between ${
                      departmentFilter === dep 
                        ? "bg-muted text-foreground" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span>{dep === "ALL" ? "All Departments" : dep}</span>
                    {departmentFilter === dep && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto flex flex-col gap-8 mt-6">
        
        {/* Feed - Fixed Grid Layout with flex cols to ensure uniform heights */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground font-medium col-span-full">Loading highlights...</div>
          ) : filteredData?.length === 0 ? (
            <div className="text-center bg-muted/30 border-2 border-dashed border-border rounded-3xl p-16 text-muted-foreground flex flex-col items-center col-span-full">
              <Sparkle size={48} className="opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">No victories posted yet</h3>
              <p className="m-0 text-sm">When students win big, their achievements will be showcased here.</p>
            </div>
          ) : (
            filteredData?.map((spotlight: any) => (
              <div 
                key={spotlight.id} 
                onClick={() => setSelectedSpotlight(spotlight)}
                className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col group h-full"
              >
                {spotlight.image ? (
                  <div className="w-full h-48 overflow-hidden bg-muted shrink-0 relative">
                    <img src={spotlight.image} alt={spotlight.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white font-bold text-sm flex items-center gap-1">Click to read more <Sparkle size={14} weight="fill" /></span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 shrink-0 flex items-center justify-center border-b border-border">
                    <Trophy size={48} className="text-muted-foreground opacity-50" />
                  </div>
                )}
                
                <div className="p-6 flex flex-col grow">
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider mb-3 shrink-0">
                    {spotlight.department && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-md">
                        <Buildings size={14} weight="bold" /> {spotlight.department}
                      </span>
                    )}
                    {spotlight.year && (
                      <span className="flex items-center gap-1 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-2 py-1 rounded-md">
                        <GraduationCap size={14} weight="bold" /> {spotlight.year}
                      </span>
                    )}
                    {spotlight.cashPrize && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-1 rounded-md">
                        <CurrencyDollar size={14} weight="bold" /> {spotlight.cashPrize}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-black text-foreground mb-2 line-clamp-2 shrink-0" title={spotlight.title}>
                    {spotlight.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4 shrink-0" title={spotlight.description}>
                    {spotlight.description}
                  </p>

                  {/* Tagged students rendered inside card */}
                  {spotlight.taggedStudents && spotlight.taggedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                      {spotlight.taggedStudents.slice(0, 3).map((s: any) => (
                        <RouterLink 
                          key={s.id} 
                          to={`/profile/${s.id}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 bg-muted/50 hover:bg-muted border border-border px-2 py-1 rounded-full text-[10px] font-bold transition-colors text-foreground"
                        >
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center text-[8px]">{s.name.charAt(0)}</div>
                          )}
                          {s.name}
                        </RouterLink>
                      ))}
                      {spotlight.taggedStudents.length > 3 && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted border border-border text-[10px] font-bold">
                          +{spotlight.taggedStudents.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* The footer is pushed to the bottom of the card universally */}
                  <div className="mt-auto pt-4 border-t border-border/50 shrink-0">
                    <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                      <span>By {spotlight.author.name}</span>
                      <span>{new Date(spotlight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hover Modal overlay */}
      <AnimatePresence>
        {selectedSpotlight && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedSpotlight(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-border border shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative"
            >
              <button 
                onClick={() => setSelectedSpotlight(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition-colors"
              >
                <X size={20} weight="bold" />
              </button>

              {selectedSpotlight.image && (
                <div className="w-full h-64 md:h-80 shrink-0">
                  <img src={selectedSpotlight.image} alt={selectedSpotlight.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="p-6 md:p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-black text-foreground leading-tight mb-4">{selectedSpotlight.title}</h2>
                  
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                    {selectedSpotlight.department && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-md">
                        <Buildings size={16} weight="bold" /> {selectedSpotlight.department}
                      </span>
                    )}
                    {selectedSpotlight.year && (
                      <span className="flex items-center gap-1 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-md">
                        <GraduationCap size={16} weight="bold" /> {selectedSpotlight.year}
                      </span>
                    )}
                    {selectedSpotlight.cashPrize && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-md">
                        <CurrencyDollar size={16} weight="bold" /> {selectedSpotlight.cashPrize}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span>Posted by {selectedSpotlight.author.name}</span>
                    <span>•</span>
                    <span>{new Date(selectedSpotlight.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {selectedSpotlight.taggedStudents && selectedSpotlight.taggedStudents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Operatives Involved</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpotlight.taggedStudents.map((s: any) => (
                        <RouterLink 
                          key={s.id} 
                          to={`/profile/${s.id}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 bg-muted/50 hover:bg-muted border border-border px-3 py-1.5 rounded-full text-sm font-bold transition-colors text-foreground"
                        >
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center text-[10px]">{s.name.charAt(0)}</div>
                          )}
                          {s.name}
                        </RouterLink>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Mission Report</h3>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base">
                    {selectedSpotlight.description}
                  </p>
                </div>

                {selectedSpotlight.links && selectedSpotlight.links.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Project Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedSpotlight.links.map((link: any, i: number) => (
                        <a 
                          key={i} 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                          <LinkIcon size={16} weight="bold" /> {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                  <div className="mt-4 pt-6 border-t border-border flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(selectedSpotlight.id);
                        setSelectedSpotlight(null);
                      }} 
                      className="flex items-center gap-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                      <Trash size={16} weight="bold" /> Delete Highlight
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HallOfFame;
