import React from "react";
import { useUnderwriting } from "@/lib/context";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

interface LeaderboardViewProps {
  onBackToDashboard: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBackToDashboard }) => {
  const { leaderboard } = useUnderwriting();

  const getScoreBadge = (score: number) => {
    if (score >= 100) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#EBF5F1] text-[#204e40] border border-[#c2e4d8] shadow-2xs">
          100
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          {score}
        </span>
      );
    }
    if (score > 0) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
          {score}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono text-zinc-400 italic">
        -
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-[#204e40] bg-white hover:bg-[#EBF5F1]/40 border border-zinc-200 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#52A68B]" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Hero Banner: Styled consistently with brand theme */}
      <div className="bg-gradient-to-br from-white via-[#FAFDFB] to-[#EBF5F1]/50 border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-[#52A68B]/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Analyst Cohort Performance & Leaderboard
          </h1>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <Card id="card-leaderboard-table">
        <CardHeader title="Cohort Standings" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-16 text-center">Rank</th>
                  <th className="pb-3">Analyst Trainee</th>
                  <th className="pb-3 text-center">Completed</th>
                  <th className="pb-3 text-center">Best Score</th>
                  <th className="pb-3 text-right">Avg Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.is_current_user
                        ? "bg-[#52A68B]/8 font-semibold ring-1 ring-inset ring-[#52A68B]/30 hover:bg-[#52A68B]/12"
                        : "hover:bg-zinc-50/70"
                    }`}
                  >
                    <td className="py-3.5 text-center font-mono font-semibold text-xs text-zinc-600">
                      #{entry.rank}
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-zinc-900 truncate">
                              {entry.name}
                            </span>
                            {entry.is_current_user && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#52A68B] text-white uppercase tracking-wider shadow-2xs">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 block truncate">
                            {entry.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-mono">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-zinc-700 font-semibold">{entry.completed_deals} / 6</span>
                        <div className="hidden sm:block w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#52A68B] rounded-full transition-all duration-300"
                            style={{ width: `${(entry.completed_deals / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      {getScoreBadge(entry.best_score)}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-sm text-zinc-900">
                      {entry.average_accuracy.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
