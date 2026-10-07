import React from "react";
import { useUnderwriting } from "@/lib/context";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Trophy, Medal, Award, Flame, ArrowLeft, CheckCircle2 } from "lucide-react";

interface LeaderboardViewProps {
  onBackToDashboard: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBackToDashboard }) => {
  const { leaderboard } = useUnderwriting();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-300">
            🥇
          </span>
        );
      case 2:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300">
            🥈
          </span>
        );
      case 3:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-900 font-bold text-xs flex items-center justify-center border border-amber-200">
            🥉
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-50 text-slate-600 font-mono text-xs flex items-center justify-center border border-slate-200">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-medium text-slate-500">
          Cohort Cohort-2026 • Live Ranking
        </span>
      </div>

      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-amber-300 mb-3">
            <Trophy className="w-3.5 h-3.5" />
            Underwriting Accuracy Leaderboard
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Analyst Cohort Performance & Leaderboard
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ranked by overall average underwriting accuracy across evaluated short-term rental training properties.
            Complete all 6 seed properties within the Best band (±10%) to graduate to live portfolio deals.
          </p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card id="card-leaderboard-table">
        <CardHeader
          title="Cohort Standings"
          subtitle="Real-time rankings updated automatically upon submitting underwriting evaluations."
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-16 text-center">Rank</th>
                  <th className="pb-3">Analyst Trainee</th>
                  <th className="pb-3 text-center">Completed</th>
                  <th className="pb-3 text-center">Best Score</th>
                  <th className="pb-3 text-right">Avg Accuracy</th>
                  <th className="pb-3 text-center">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50/50 transition ${
                      entry.is_current_user
                        ? "bg-slate-50/80 font-semibold ring-1 ring-inset ring-slate-900/10"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 text-center">
                      <div className="flex justify-center">{getRankBadge(entry.rank)}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{entry.name}</span>
                            {entry.is_current_user && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">{entry.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-mono">
                      {entry.completed_deals} / 6
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          entry.best_score === 100
                            ? "bg-emerald-100 text-emerald-800"
                            : entry.best_score === 70
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {entry.best_score}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-sm text-slate-900">
                      {entry.average_accuracy.toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-center font-mono">
                      {entry.streak > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold text-xs">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {entry.streak}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
