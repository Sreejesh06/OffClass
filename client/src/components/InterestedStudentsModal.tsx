import { useQuery } from "@tanstack/react-query";
import { X, Mail, Search } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { House } from "shared";
import { cn } from "../lib/utils";

interface Props {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
}

interface InterestedStudent {
  id: string;
  user: {
    id: string;
    name: string;
    house: House;
    avatar: string | null;
    email: string;
  };
  lookingForTeammate: boolean;
  createdAt: string;
}

const HOUSE_COLORS: Record<House, string> = {
  RED: "var(--house-red)",
  BLUE: "var(--house-blue)",
  GREEN: "var(--house-green)",
  PURPLE: "var(--house-purple)",
};

export function InterestedStudentsModal({ opportunityId, opportunityTitle, onClose }: Props) {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", opportunityId, "interested"],
    queryFn: async () => {
      const res = await api.get(`opportunities/${opportunityId}/interested`);
      return res.data.interested as InterestedStudent[];
    }
  });

  const getAvatarUrl = (avatarStr: string | null | undefined, fallbackName: string) => {
    if (avatarStr?.startsWith("http")) return avatarStr;
    const seed = avatarStr || fallbackName;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e5e7eb`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {user?.role === "STUDENT" ? "Looking for Teammates" : "Interested Students"}
            </h2>
            <p className="text-sm font-medium text-gray-500 m-0">
              {opportunityTitle}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8 font-medium">
              Loading...
            </div>
          ) : data?.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-medium">
              {user?.role === "STUDENT" 
                ? "No one has indicated they are looking for teammates yet."
                : "No students have bookmarked this opportunity yet."}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <img 
                      src={getAvatarUrl(item.user.avatar, item.user.name)} 
                      alt={item.user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"
                    />
                    <div>
                      <div className="font-bold text-gray-900">
                        {item.user.name}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {item.user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className={cn(
                          "font-bold tracking-wide uppercase",
                          item.user.house === "RED" ? "text-red-600" :
                          item.user.house === "BLUE" ? "text-blue-600" :
                          item.user.house === "GREEN" ? "text-green-600" :
                          "text-purple-600"
                        )}>
                          {item.user.house}
                        </span>
                        {item.lookingForTeammate && user?.role !== "STUDENT" && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-blue-600 font-bold">Looking for team</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
