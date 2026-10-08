import React from "react";
import { Rating, UnderwritingStatus } from "@/types";

interface BadgeProps {
  children?: React.ReactNode;
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-zinc-100 text-zinc-800 border-zinc-200",
    outline: "bg-transparent text-zinc-700 border-zinc-300",
    success: "bg-emerald-50/80 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50/80 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50/80 text-rose-700 border-rose-200/80",
    info: "bg-blue-50/80 text-blue-700 border-blue-200/80",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: UnderwritingStatus }> = ({ status }) => {
  switch (status) {
    case "submitted":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Submitted
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          In Progress
        </span>
      );
    case "not_started":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
          Not Started
        </span>
      );
  }
};

export const RatingBadge: React.FC<{ rating: Rating | null; accuracy?: number | null }> = ({
  rating,
  accuracy,
}) => {
  if (!rating) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-500">
        Unrated
      </span>
    );
  }

  const scoreText = accuracy !== undefined && accuracy !== null ? ` • ${accuracy}` : "";

  switch (rating) {
    case "best":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Best{scoreText}
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Medium{scoreText}
        </span>
      );
    case "low":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Low{scoreText}
        </span>
      );
  }
};
