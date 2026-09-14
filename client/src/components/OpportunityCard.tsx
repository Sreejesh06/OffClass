import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Users, CheckCircle, ExternalLink, Calendar, Share2, Check, UserPlus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { OpportunityType, House } from "shared";
import { InterestedStudentsModal } from "./InterestedStudentsModal";
import { cn } from "../lib/utils";

interface Props {
  opportunity: {
    id: string;
    title: string;
    description: string;
    externalUrl: string;
    type: OpportunityType;
    targetHouses: House[];
    deadline: string | null;
    createdAt: string;
    _count: { bookmarks: number };
    postedBy?: {
      name: string;
      avatar: string | null;
      house: House;
      role: string;
    }
  };
  isBookmarked: boolean;
  isLookingForTeammate: boolean;
  userRole: "STUDENT" | "TEACHER" | "ADMIN";
  onSubmitProof?: () => void;
}

const TYPE_COLORS: Record<OpportunityType, { bg: string; text: string }> = {
  BUG_BOUNTY: { bg: "color-mix(in srgb, var(--accent-amber) 15%, transparent)", text: "var(--accent-amber)" },
  CTF: { bg: "color-mix(in srgb, var(--house-red) 15%, transparent)", text: "var(--house-red)" },
  HACKATHON: { bg: "color-mix(in srgb, var(--house-green) 15%, transparent)", text: "var(--house-green)" },
  INTERNSHIP: { bg: "color-mix(in srgb, var(--house-blue) 15%, transparent)", text: "var(--house-blue)" },
  WORKSHOP: { bg: "color-mix(in srgb, var(--house-purple) 15%, transparent)", text: "var(--house-purple)" },
  CERT_DISCOUNT: { bg: "color-mix(in srgb, var(--text-secondary) 15%, transparent)", text: "var(--text-primary)" },
  OTHER: { bg: "color-mix(in srgb, var(--text-secondary) 15%, transparent)", text: "var(--text-primary)" },
};

const HOUSE_COLORS: Record<House, string> = {
  RED: "var(--house-red)",
  BLUE: "var(--house-blue)",
  GREEN: "var(--house-green)",
  PURPLE: "var(--house-purple)",
};

export function OpportunityCard({ opportunity, isBookmarked, isLookingForTeammate, userRole, onSubmitProof }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInterested, setShowInterested] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/opportunities/${opportunity.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (payload: { lookingForTeammate?: boolean }) => {
      const res = await api.post(`/opportunities/${opportunity.id}/bookmark`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunities", "bookmarks"] });
    },
  });

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bookmarkMutation.mutate({ lookingForTeammate: isLookingForTeammate });
  };

  const handleFindTeamClick = () => {
    if (isLookingForTeammate) {
      // Toggle off completely to decrement count
      bookmarkMutation.mutate({});
    } else {
      bookmarkMutation.mutate({ lookingForTeammate: true });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(opportunity.externalUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const daysUntilDeadline = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

  // Format date
  const createdDate = new Date(opportunity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  
  // Extract domain for the link card
  let domain = "";
  try {
    domain = new URL(opportunity.externalUrl).hostname.replace("www.", "");
  } catch {
    domain = "external link";
  }

  const getAvatarUrl = (avatarStr: string | null | undefined, fallbackName: string) => {
    if (avatarStr?.startsWith("http")) return avatarStr;
    const seed = avatarStr || fallbackName;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`;
  };

  return (
    <>
      <div 
        className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl p-5 gap-4 transition-all hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5"
      >
        {/* Header (Author) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={getAvatarUrl(opportunity.postedBy?.avatar, opportunity.postedBy?.name || "Teacher")}
              alt={opportunity.postedBy?.name || "Teacher"} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100 bg-gray-50"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 text-sm">{opportunity.postedBy?.name || "Teacher"}</span>
                {opportunity.postedBy?.role === "ADMIN" && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span className="text-gray-400 text-sm">·</span>
                <span className="text-gray-500 text-sm">{createdDate}</span>
              </div>
              
              {/* Only show house badge if not an admin */}
              {opportunity.postedBy?.role !== "ADMIN" && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span 
                    className={cn(
                      "text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full",
                      opportunity.postedBy?.house === "RED" ? "bg-red-50 text-red-600" :
                      opportunity.postedBy?.house === "BLUE" ? "bg-blue-50 text-blue-600" :
                      opportunity.postedBy?.house === "GREEN" ? "bg-green-50 text-green-600" :
                      "bg-purple-50 text-purple-600"
                    )}
                  >
                    {opportunity.postedBy?.house}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            {(user?.id === opportunity.postedById || user?.role === "ADMIN") && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this opportunity?")) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                title="Delete Post"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkMutation.isPending}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
              title={isBookmarked ? "Remove Bookmark" : "Save Opportunity"}
            >
              <Bookmark fill={isBookmarked ? "currentColor" : "none"} size={20} className={cn(isBookmarked && "text-blue-500")} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-1">
            <span style={{
              background: TYPE_COLORS[opportunity.type].bg,
              color: TYPE_COLORS[opportunity.type].text,
            }} className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider">
              {opportunity.type.replace("_", " ")}
            </span>
            {opportunity.targetHouses.length < 4 && opportunity.targetHouses.map(h => (
              <span key={h} style={{
                background: `color-mix(in srgb, ${HOUSE_COLORS[h]} 10%, transparent)`,
                color: HOUSE_COLORS[h],
              }} className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider">
                {h}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-snug m-0">
            {opportunity.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed m-0 line-clamp-3">
            {opportunity.description}
          </p>
        </div>

        {/* Link Card embedded */}
        <a 
          href={opportunity.externalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors group/link decoration-transparent"
        >
          <div className="bg-gray-100 h-20 w-full flex items-center justify-center border-b border-gray-200 text-gray-400 group-hover/link:text-gray-500 transition-colors">
            <ExternalLink size={24} />
          </div>
          <div className="p-3 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{domain}</span>
            <span className="text-sm font-semibold text-gray-900 truncate">Visit external opportunity page</span>
          </div>
        </a>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() => setShowInterested(true)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm font-medium group/action"
            >
              <div className="p-1.5 rounded-full group-hover/action:bg-blue-50 transition-colors">
                <Users size={18} />
              </div>
              <span>{opportunity._count.bookmarks}</span>
            </button>
            
            {userRole === "STUDENT" && (
              <button
                onClick={handleFindTeamClick}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium group/action transition-colors",
                  isLookingForTeammate ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
                )}
                title="Find Teammates"
              >
                <div className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isLookingForTeammate ? "bg-blue-100" : "group-hover/action:bg-blue-50"
                )}>
                  <UserPlus size={18} />
                </div>
                <span className={cn(
                  "whitespace-nowrap",
                  isLookingForTeammate ? "text-blue-600 font-bold" : "text-gray-500"
                )}>
                  {isLookingForTeammate ? "Looking for team" : "Find Team"}
                </span>
              </button>
            )}

            {opportunity.deadline && (
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                isUrgent ? "text-red-500" : "text-gray-500"
              )}>
                <div className={cn("p-1.5 rounded-full", isUrgent && "bg-red-50")}>
                  <Calendar size={18} />
                </div>
                <span className="whitespace-nowrap">{daysUntilDeadline! < 0 ? "Closed" : `${daysUntilDeadline}d left`}</span>
              </div>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors text-sm font-medium group/action"
              title="Copy Link"
            >
              <div className="p-1.5 rounded-full group-hover/action:bg-green-50 transition-colors">
                {hasCopied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
              </div>
              <span className={cn("transition-colors whitespace-nowrap", hasCopied && "text-green-500")}>
                {hasCopied ? "Copied!" : "Share"}
              </span>
            </button>
          </div>

          {userRole === "STUDENT" && onSubmitProof && (
            <button
              onClick={onSubmitProof}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors active:scale-95 shrink-0"
            >
              Submit Proof
            </button>
          )}
        </div>
      </div>

      {showInterested && (
        <InterestedStudentsModal 
          opportunityId={opportunity.id} 
          opportunityTitle={opportunity.title}
          onClose={() => setShowInterested(false)} 
        />
      )}
    </>
  );
}
