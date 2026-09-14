import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Transaction {
  id: string;
  createdAt: string;
  delta: number;
  reason: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  filterType?: 'ACHIEVEMENTS' | 'ACTIVITY' | 'ALL';
}

export function TransactionHistory({ transactions, filterType = 'ALL' }: TransactionHistoryProps) {
  const isAchievement = (reason: string) => {
    const r = reason.toLowerCase();
    return !r.includes('manual adjustment') && !r.includes('sync') && !r.includes('certificate approved') && !r.includes('purchased');
  };

  const filtered = transactions.filter(tx => {
    if (filterType === 'ACHIEVEMENTS') return isAchievement(tx.reason);
    if (filterType === 'ACTIVITY') return !isAchievement(tx.reason);
    return true;
  });

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">No recent {filterType === 'ACHIEVEMENTS' ? 'achievements' : 'activity'} found.</div>
        ) : filtered.map(tx => (
          <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-800">{tx.reason}</span>
            <span className="text-xs font-mono text-gray-500">
              {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
