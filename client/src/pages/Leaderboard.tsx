import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CaretLeft, CaretRight, CaretUp, CaretDown, Minus, Trophy, Star, Lightning, ArrowUpRight, TrendUp } from "@phosphor-icons/react";
import { type House } from "../components/ThemeProvider";
import { api } from "../lib/api";

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  name: string;
  house: House;
  points: number;
  avatar: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAvatar = (fallbackSeed: string, avatarSeed?: string | null) => {
  const seed = avatarSeed || fallbackSeed;
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f8f9fa`;
};

const houseGradients = {
  RED: "from-red-50 to-red-100/50",
  BLUE: "from-blue-50 to-blue-100/50",
  GREEN: "from-green-50 to-green-100/50",
  PURPLE: "from-purple-50 to-purple-100/50",
};

const houseColors = {
  RED: "text-red-600 bg-red-100",
  BLUE: "text-blue-600 bg-blue-100",
  GREEN: "text-green-600 bg-green-100",
  PURPLE: "text-purple-600 bg-purple-100",
};

// ─── Components ──────────────────────────────────────────────────────────────

const PodiumCard = ({ entry, position, maxPoints }: { entry: LeaderboardEntry | null; position: 1 | 2 | 3, maxPoints: number }) => {
  if (!entry) return <div className="w-full max-w-[280px] h-[320px] rounded-3xl" />;

  const isFirst = position === 1;
  const gradient = houseGradients[entry.house];
  const color = houseColors[entry.house];
  const rankDiff = entry.previousRank - entry.rank;

  return (
    <div 
      className={`relative w-full max-w-[280px] bg-gradient-to-b ${gradient} border border-white shadow-xl rounded-[2rem] p-6 flex flex-col items-center justify-between transition-transform hover:-translate-y-2
        ${isFirst ? 'z-10 min-h-[380px] shadow-2xl' : 'z-0 min-h-[340px] opacity-95'}
      `}
    >
      {/* Huge Background Number */}
      <div className={`absolute top-4 right-4 text-8xl font-black opacity-5 font-display ${isFirst ? 'text-9xl right-2' : ''}`}>
        {position}
      </div>

      <div className="relative w-24 h-24 mt-4 shrink-0">
        <div className={`absolute inset-0 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white`}>
          <img src={getAvatar(entry.id, entry.avatar)} alt={entry.name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-white shadow-sm flex items-center gap-1">
          <Star size={12} weight="fill" className="text-yellow-400" />
          {entry.points}
        </div>
      </div>

      <div className="text-center mt-6 z-10 w-full">
        <h3 className="font-display font-bold text-gray-900 text-xl truncate px-2">{entry.name}</h3>
        <span className={`inline-block mt-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${color}`}>
          {entry.house}
        </span>
      </div>

      <div className="flex justify-around w-full mt-6 border-t border-black/5 pt-4 z-10">
        <div className="text-center">
          <div className="text-xs text-gray-500 font-medium">Trend</div>
          <div className="font-bold text-gray-900 flex items-center justify-center gap-1 mt-1">
            {rankDiff > 0 ? (
              <><CaretUp size={14} weight="bold" className="text-green-500" /> +{rankDiff}</>
            ) : rankDiff < 0 ? (
              <><CaretDown size={14} weight="bold" className="text-red-500" /> {Math.abs(rankDiff)}</>
            ) : (
              <><Minus size={14} weight="bold" className="text-gray-400" /> 0</>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 font-medium">Rel. to Top</div>
          <div className="font-bold text-gray-900 mt-1">
            {Math.round((entry.points / Math.max(maxPoints, 1)) * 100)}%
          </div>
        </div>
      </div>

      <Link 
        to={`/profile/${entry.id}`}
        className="w-full mt-6 py-2.5 bg-white text-gray-900 text-sm font-bold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-center z-10 relative overflow-hidden group"
      >
        <span className="relative z-10">View Profile</span>
      </Link>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<House | 'overall'>('overall');
  const [page, setPage] = useState(1);
  const perPage = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', activeTab],
    queryFn: async () => {
      const endpoint = activeTab === 'overall' ? '/leaderboard/overall' : `/leaderboard/house/${activeTab.toUpperCase()}`;
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  const allEntries: LeaderboardEntry[] = data?.leaderboard || [];
  
  // Podium logic: top 3
  const top1 = allEntries[0] || null;
  const top2 = allEntries[1] || null;
  const top3 = allEntries[2] || null;
  
  const maxPoints = top1?.points || 1;

  // List logic: 4 onwards
  const remainingEntries = allEntries.slice(3);
  const paginatedData = remainingEntries.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(remainingEntries.length / perPage));

  const handleTabChange = (tab: House | 'overall') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans">
      
      {/* Hero Header Area */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-[2rem] flex items-center justify-center transform -rotate-3 shadow-lg shadow-orange-500/30 border border-orange-400/50 mb-2">
          <Trophy size={40} weight="fill" />
        </div>
        <div>
          <h1 className="text-5xl md:text-6xl font-black font-display text-gray-900 tracking-tight mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-500 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Season 2 is underway. Compete for your house, earn points, and climb the ranks.
          </p>
        </div>
        
        {/* House Tabs */}
        <div className="mt-4 flex flex-wrap justify-center bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-gray-200/60 w-fit max-w-full overflow-x-auto gap-1">
          {(['overall', 'red', 'blue', 'green', 'purple'] as const).map(tab => {
            const isSelected = activeTab === tab;
            let tabColorClass = 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
            
            if (isSelected) {
              if (tab === 'red') tabColorClass = 'bg-red-500 text-white shadow-md border-red-600/20';
              else if (tab === 'blue') tabColorClass = 'bg-blue-500 text-white shadow-md border-blue-600/20';
              else if (tab === 'green') tabColorClass = 'bg-green-500 text-white shadow-md border-green-600/20';
              else if (tab === 'purple') tabColorClass = 'bg-purple-500 text-white shadow-md border-purple-600/20';
              else tabColorClass = 'bg-gray-900 text-white shadow-md border-gray-800/20';
            }

            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border border-transparent ${tabColorClass}`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 flex flex-col gap-12">
        
        {/* Podium */}
        {!isLoading && allEntries.length > 0 && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 pt-8">
            <div className="order-2 md:order-1 w-full md:w-auto flex justify-center"><PodiumCard entry={top2} position={2} maxPoints={maxPoints} /></div>
            <div className="order-1 md:order-2 w-full md:w-auto flex justify-center"><PodiumCard entry={top1} position={1} maxPoints={maxPoints} /></div>
            <div className="order-3 md:order-3 w-full md:w-auto flex justify-center"><PodiumCard entry={top3} position={3} maxPoints={maxPoints} /></div>
          </div>
        )}

        {/* Highlights Strip */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 mt-4">
          <div className="flex-1 flex items-center gap-4 px-4 py-2 md:py-0">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <TrendUp size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Ranked</p>
              <p className="text-2xl font-black text-gray-900 font-display">{allEntries.length}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4 px-4 py-2 md:py-0">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
              <Lightning size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Points</p>
              <p className="text-2xl font-black text-gray-900 font-display">
                {allEntries.reduce((sum, e) => sum + e.points, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4 px-4 py-2 md:py-0">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
              <Star size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top House</p>
              <p className="text-2xl font-black text-gray-900 font-display">
                {activeTab === 'overall' && allEntries.length > 0 ? allEntries[0].house : (activeTab !== 'overall' ? activeTab.toUpperCase() : 'N/A')}
              </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 font-medium flex justify-center items-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            Loading champions...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Table Header Equivalent */}
            <div className="flex px-6 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:flex">
              <div className="w-16 text-center">Rank</div>
              <div className="flex-1">Operative</div>
              <div className="w-24 text-center">Trend</div>
              <div className="w-32 text-right pr-4">Points</div>
              <div className="w-16"></div>
            </div>

            {paginatedData.map((entry) => {
              const rankDiff = entry.previousRank - entry.rank;
              const color = houseColors[entry.house];

              return (
                <div 
                  key={entry.id} 
                  className="group flex flex-col md:flex-row items-start md:items-center bg-white border border-gray-100 rounded-2xl p-4 md:p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="w-full md:w-16 text-left md:text-center mb-3 md:mb-0">
                    <span className="text-sm md:text-xl font-black text-gray-300 font-display group-hover:text-gray-900 transition-colors">
                      {entry.rank}
                    </span>
                  </div>
                  
                  {/* Angled separator (desktop only) */}
                  <div className="hidden md:block w-px h-10 bg-gray-100 transform rotate-12 mx-4 group-hover:bg-gray-200 transition-colors"></div>
                  
                  <div className="flex-1 flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-white shadow-sm overflow-hidden shrink-0">
                      <img src={getAvatar(entry.id, entry.avatar)} alt={entry.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 flex-1">
                      <Link to={`/profile/${entry.id}`} className="font-bold text-gray-900 hover:text-orange-600 transition-colors text-base">
                        {entry.name}
                      </Link>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${color} w-fit`}>
                        {entry.house}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-10 bg-gray-100 transform rotate-12 mx-4 group-hover:bg-gray-200 transition-colors"></div>

                  <div className="w-24 flex justify-center hidden md:flex">
                    <div className="flex flex-col items-center">
                      <div className="font-bold text-sm flex items-center gap-1 mt-0.5">
                        {rankDiff > 0 ? (
                          <><CaretUp size={14} weight="bold" className="text-green-500" /> {rankDiff}</>
                        ) : rankDiff < 0 ? (
                          <><CaretDown size={14} weight="bold" className="text-red-500" /> {Math.abs(rankDiff)}</>
                        ) : (
                          <><Minus size={14} weight="bold" className="text-gray-300" /></>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-10 bg-gray-100 transform rotate-12 mx-4 group-hover:bg-gray-200 transition-colors"></div>

                  <div className="w-32 flex justify-start md:justify-end items-center mt-3 md:mt-0 pr-4">
                    <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-inner">
                      <Star size={12} weight="fill" className="text-yellow-400" />
                      <span className="font-bold font-mono text-sm">{entry.points}</span>
                    </div>
                  </div>

                  <div className="w-16 flex justify-end absolute right-4 top-4 md:static">
                    <Link 
                      to={`/profile/${entry.id}`}
                      className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                    >
                      <ArrowUpRight size={16} weight="bold" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CaretLeft weight="bold" /> Prev
            </button>
            
            <span className="font-mono text-gray-500 text-sm font-medium">
              Page {page} of {totalPages}
            </span>

            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next <CaretRight weight="bold" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
