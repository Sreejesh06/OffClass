import { SealCheck } from "@phosphor-icons/react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface UserBadge {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
  };
  awardedAt: string;
}

export function BadgeWallet() {
  const { user } = useAuth();
  
  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await api.get(`/badges/user/${user.id}`);
      return res.data;
    },
    enabled: !!user?.id
  });

  const userBadges: UserBadge[] = badges || [];

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
        {isLoading ? (
          <div className="w-full text-center text-gray-400 py-8">Loading badges...</div>
        ) : userBadges.length === 0 ? (
          <div className="w-full text-center text-gray-400 py-8">No badges earned yet.</div>
        ) : (
          userBadges.map(({ id, badge, awardedAt }) => (
            <div 
              key={id}
              className="flex flex-col items-center gap-3 text-center w-28"
            >
              {/* Badge Icon / Visual */}
              <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center shadow-sm shadow-amber-200">
                <SealCheck size={40} weight="fill" className="text-amber-500" />
              </div>
              
              {/* Info */}
              <div>
                <div className="font-semibold text-sm leading-tight text-gray-800">{badge.name}</div>
                <div className="text-[10px] text-gray-500 mt-1 flex flex-col gap-0.5">
                  <span>{badge.description}</span>
                  <span className="font-mono opacity-70">{new Date(awardedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
