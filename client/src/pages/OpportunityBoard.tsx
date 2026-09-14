import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Telescope, Plus, Shield, Trophy, Flame } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { OpportunityCard } from "../components/OpportunityCard";
import { ComposeOpportunityCard } from "../components/ComposeOpportunityCard";
import { AchievementModal } from "../components/AchievementModal";
import type { OpportunityType, House } from "shared";
import { cn } from "../lib/utils";

type Tab = "ALL" | House | "MY_BOOKMARKS";

const HOUSE_COLORS: Record<House, { bg: string; text: string; border: string; gradient: string }> = {
  RED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", gradient: "from-red-500 to-red-700" },
  BLUE: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-500 to-blue-700" },
  GREEN: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", gradient: "from-green-500 to-green-700" },
  PURPLE: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", gradient: "from-purple-500 to-purple-700" },
};

export function OpportunityBoard() {
  const { user } = useAuth();
  
  // For students, their default active tab is their house
  // For teachers, default active tab is "ALL"
  const [activeTab, setActiveTab] = useState<Tab>(user?.role === "STUDENT" ? user.house : "ALL");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "ALL">("ALL");
  const [proofOpportunity, setProofOpportunity] = useState<{ id: string; title: string } | null>(null);

  const isStudent = user?.role === "STUDENT";
  
  // Determine which house is the context for the sidebar/banner
  const dashboardHouse: House | "ALL" = ["RED", "BLUE", "GREEN", "PURPLE"].includes(activeTab) 
    ? (activeTab as House) 
    : "ALL";

  const getQueryParams = () => {
    const params: any = {};
    if (typeFilter !== "ALL") params.type = typeFilter;
    if (activeTab !== "ALL" && activeTab !== "MY_BOOKMARKS") {
      params.house = activeTab;
    }
    return params;
  };

  const endpoint = activeTab === "MY_BOOKMARKS" ? "/opportunities/my-bookmarks" : "/opportunities";

  // Fetch opportunities
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", activeTab, typeFilter],
    queryFn: async () => {
      const res = await api.get(endpoint, { params: getQueryParams() });
      return res.data;
    }
  });

  // Fetch Bookmarks state for mapping
  const { data: bookmarksData } = useQuery({
    queryKey: ["opportunities", "bookmarks"],
    queryFn: async () => {
      const res = await api.get("/opportunities/my-bookmarks");
      return res.data.bookmarks;
    },
    staleTime: 1000 * 60 * 5
  });

  // Fetch Sidebar Data (Leaderboard top 5 of the house)
  const { data: houseLeaderboard } = useQuery({
    queryKey: ["leaderboard", "house", dashboardHouse],
    queryFn: async () => {
      const res = await api.get(`/leaderboard/house/${dashboardHouse}`);
      return res.data.leaderboard;
    },
    enabled: dashboardHouse !== "ALL"
  });

  // Fetch overall standings to get the house's total points
  const { data: hallOfFame } = useQuery({
    queryKey: ["leaderboard", "hall-of-fame"],
    queryFn: async () => {
      const res = await api.get("/leaderboard/hall-of-fame");
      return res.data.houseStandings;
    }
  });

  const opportunities = activeTab === "MY_BOOKMARKS" 
    ? (data?.bookmarks?.map((b: any) => ({ ...b.opportunity, _bookmark: b })) || [])
    : (data?.opportunities || []);

  const bookmarkedState = useMemo(() => new Map(
    bookmarksData?.map((b: any) => [b.opportunityId, b.lookingForTeammate]) || []
  ), [bookmarksData]);

  const tabs: { id: Tab; label: string }[] = isStudent
    ? [
        { id: user.house, label: `My HQ` },
        { id: "ALL", label: "All Houses" },
        ...((["RED", "BLUE", "GREEN", "PURPLE"] as House[]).filter(h => h !== user.house).map(h => ({ id: h as Tab, label: h }))),
        { id: "MY_BOOKMARKS", label: "Saved" }
      ]
    : [
        { id: "ALL", label: "All Houses" },
        { id: "RED", label: "Red" },
        { id: "BLUE", label: "Blue" },
        { id: "GREEN", label: "Green" },
        { id: "PURPLE", label: "Purple" },
        { id: "MY_BOOKMARKS", label: "Saved" }
      ];

  const types: { id: OpportunityType | "ALL"; label: string }[] = [
    { id: "ALL", label: "All Types" },
    { id: "BUG_BOUNTY", label: "Bug Bounty" },
    { id: "CTF", label: "CTF" },
    { id: "HACKATHON", label: "Hackathon" },
    { id: "INTERNSHIP", label: "Internship" },
    { id: "WORKSHOP", label: "Workshop" },
    { id: "CERT_DISCOUNT", label: "Cert Discount" },
    { id: "OTHER", label: "Other" }
  ];

  const currentHouseStandings = hallOfFame?.find((h: any) => h.name.toUpperCase() === dashboardHouse);
  const houseConfig = dashboardHouse !== "ALL" ? HOUSE_COLORS[dashboardHouse] : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      
      {/* Hero Banner */}
      <div className={cn(
        "w-full rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col justify-end min-h-[200px] md:min-h-[250px]",
        houseConfig ? `bg-gradient-to-br ${houseConfig.gradient}` : "bg-gradient-to-br from-gray-800 to-gray-900"
      )}>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Shield size={250} />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
            {dashboardHouse !== "ALL" ? `${dashboardHouse} House HQ` : "Department Headquarters"}
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
            {dashboardHouse !== "ALL" 
              ? "Your house's command center. Find opportunities, match with teammates, and push for the lead." 
              : "Global command center. Curated bounties, CTFs, and events to level up."}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar (Stats & Top Members) */}
        {dashboardHouse !== "ALL" && (
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            
            {/* House Stats Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-xl", houseConfig?.bg, houseConfig?.text)}>
                  <Trophy size={20} weight="fill" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">House Standing</h2>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-gray-900 tracking-tight">
                  {currentHouseStandings?.points?.toLocaleString() || "0"}
                </span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Points</span>
              </div>
            </div>

            {/* Top Members Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-xl", houseConfig?.bg, houseConfig?.text)}>
                  <Flame size={20} weight="fill" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Top Members</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {!houseLeaderboard ? (
                  <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
                ) : houseLeaderboard.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">No points recorded yet.</div>
                ) : (
                  houseLeaderboard.slice(0, 5).map((member: any, idx: number) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                          idx === 0 ? "bg-amber-100 text-amber-600" : 
                          idx === 1 ? "bg-slate-100 text-slate-600" :
                          idx === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"
                        )}>
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">
                          {member.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-500">{member.points}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main Feed */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-6">
          
          {/* Twitter-style Compose Box for Admins/Teachers */}
          {!isStudent && activeTab !== "MY_BOOKMARKS" && (
            <ComposeOpportunityCard />
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                    activeTab === tab.id 
                      ? "bg-gray-900 text-white" 
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab !== "MY_BOOKMARKS" && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                 {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTypeFilter(type.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                        typeFilter === type.id 
                          ? "bg-gray-900 border-gray-900 text-white shadow-sm" 
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="text-center text-gray-500 py-12">
              Loading feed...
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-16 text-gray-500 flex flex-col items-center">
              <Telescope size={48} className="opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quiet on the comms</h3>
              <p className="m-0">
                {activeTab === "MY_BOOKMARKS" 
                  ? "You haven't saved any opportunities." 
                  : "No active opportunities match your filters right now."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {opportunities.map((opp: any) => (
                <OpportunityCard 
                  key={opp.id} 
                  opportunity={opp} 
                  isBookmarked={bookmarkedState.has(opp.id)}
                  isLookingForTeammate={bookmarkedState.get(opp.id) || false}
                  userRole={user!.role}
                  onSubmitProof={() => setProofOpportunity({ id: opp.id, title: opp.title })}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      
      {proofOpportunity && (
        <AchievementModal
          onClose={() => setProofOpportunity(null)}
          onSuccess={() => setProofOpportunity(null)}
          opportunityId={proofOpportunity.id}
          initialTitle={`[Opportunity] ${proofOpportunity.title}`}
        />
      )}
    </div>
  );
}
