import React from "react";
import { Property } from "@/types";
import { CheckCircle, Clock, FileSpreadsheet, Target } from "lucide-react";

interface DashboardStatsProps {
  properties: Property[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ properties }) => {
  const total = properties.length;
  const submitted = properties.filter((p) => p.status === "submitted").length;
  const inProgress = properties.filter((p) => p.status === "in_progress").length;
  const notStarted = properties.filter((p) => p.status === "not_started").length;

  const submittedProps = properties.filter((p) => p.best_accuracy !== null);
  const avgAccuracy =
    submittedProps.length > 0
      ? (
          submittedProps.reduce((sum, p) => sum + (p.best_accuracy || 0), 0) /
          submittedProps.length
        ).toFixed(1)
      : "--";

  const stats = [
    {
      label: "Available Cases",
      value: total,
      subtext: "Seeded STR listings",
      icon: FileSpreadsheet,
      accent: "text-zinc-900 bg-zinc-100",
    },
    {
      label: "Completed & Graded",
      value: submitted,
      subtext: `${Math.round((submitted / total) * 100)}% overall progress`,
      icon: CheckCircle,
      accent: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Drafts In Progress",
      value: inProgress,
      subtext: "Saved work ready to finish",
      icon: Clock,
      accent: "text-blue-700 bg-blue-50",
    },
    {
      label: "Average Accuracy",
      value: avgAccuracy !== "--" ? `${avgAccuracy}%` : "--",
      subtext: "Analyst benchmark score",
      icon: Target,
      accent: "text-purple-700 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-zinc-200/90 shadow-card p-4 transition-all hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-lg ${stat.accent}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-mono tabular-nums">
                {stat.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 font-normal">{stat.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
