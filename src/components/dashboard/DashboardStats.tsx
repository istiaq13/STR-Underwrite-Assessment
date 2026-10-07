import React from "react";
import { DashboardSummary, Property } from "@/types";
import { CheckCircle, Clock, FileSpreadsheet, Target } from "lucide-react";

interface DashboardStatsProps {
  properties: Property[];
  summary?: DashboardSummary | null;
  isLoading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  properties,
  summary,
  isLoading = false,
}) => {
  const total = summary ? summary.total_properties : properties.length;
  const submitted = summary ? summary.submitted : properties.filter((p) => p.status === "submitted").length;
  const inProgress = summary ? summary.in_progress : properties.filter((p) => p.status === "in_progress").length;
  const notStarted = summary ? summary.not_started : properties.filter((p) => p.status === "not_started").length;

  let avgAccuracy: string = "--";
  if (summary && summary.average_accuracy !== null && summary.average_accuracy !== undefined) {
    avgAccuracy = Number(summary.average_accuracy).toFixed(1);
  } else {
    const submittedProps = properties.filter((p) => p.best_accuracy !== null);
    if (submittedProps.length > 0) {
      avgAccuracy = (
        submittedProps.reduce((sum, p) => sum + (p.best_accuracy || 0), 0) /
        submittedProps.length
      ).toFixed(1);
    }
  }

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
              {isLoading ? (
                <div className="h-8 w-16 rounded-md skeleton-wave my-0.5" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-mono tabular-nums">
                  {stat.value}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500 font-normal">{stat.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
