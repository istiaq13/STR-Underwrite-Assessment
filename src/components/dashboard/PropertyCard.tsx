import React from "react";
import { Property } from "@/types";
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
} from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onSelect: (zpid: string) => void;
  onViewResults?: (submissionId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onViewResults,
}) => {
  const getButtonText = () => {
    if (property.status === "submitted") return "Review & Re-underwrite";
    if (property.status === "in_progress") return "Resume Underwriting";
    return "Start Underwriting";
  };

  const getRatingColor = () => {
    if (property.best_rating === "best") return "text-[#52A68B]";
    if (property.best_rating === "medium") return "text-amber-600";
    if (property.best_rating === "low") return "text-rose-600";
    return "text-neutral-800";
  };

  const getRatingInfo = () => {
    if (property.best_rating === "best") return `Best tier • ${property.best_accuracy}% accuracy against benchmark`;
    if (property.best_rating === "medium") return `Medium tier • ${property.best_accuracy}% accuracy against benchmark`;
    if (property.best_rating === "low") return `Low tier • ${property.best_accuracy}% accuracy against benchmark`;
    return "Ungraded";
  };

  const getStatusText = () => {
    if (property.status === "submitted") return "Submitted";
    if (property.status === "in_progress") return "In Progress";
    return "Not Started";
  };

  const getStatusStyle = () => {
    if (property.status === "submitted") return "text-emerald-600 font-bold";
    if (property.status === "in_progress") return "text-amber-500 font-bold";
    return "text-neutral-400 font-medium";
  };

  return (
    <div
      id={`property-card-${property.zpid}`}
      className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
    >
      <div
        onClick={() => onSelect(property.zpid)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(property.zpid);
          }
        }}
        title={`Open underwriting for ${property.address_street}`}
      >
        {/* Card Image / Header */}
        <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden">
          <img
            src={property.img_src}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-zinc-800 shadow-sm backdrop-blur-md border border-zinc-200/60 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#52A68B]" />
              <span>{property.market_name}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-1 tracking-tight group-hover:text-[#52A68B] transition-colors">
                {property.address_street}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-normal flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#52A68B] flex-shrink-0" />
                <span className="truncate">
                  {property.address_city}, {property.address_state} {property.address_zipcode}
                </span>
              </p>
            </div>
            <div className="text-right flex-shrink-0 pt-0.5">
              <span className="text-base sm:text-lg font-bold text-[#52A68B] tracking-tight">
                {property.price}
              </span>
            </div>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-zinc-100 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.beds} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.baths} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.area.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Performance & Score Banner */}
          <div className="py-2 px-3 rounded-xl bg-neutral-50/90 border border-neutral-100 flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 leading-tight">
                Benchmark Score
              </span>
              <div className="mt-0.5">
                {property.best_accuracy !== null ? (
                  <div className="relative group/score inline-block">
                    <span
                      className={`text-xs font-bold ${getRatingColor()} cursor-default select-none`}
                    >
                      {property.best_accuracy}%
                    </span>
                    {/* Immediate Hover Tooltip (0ms delay) */}
                    <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover/score:block bg-neutral-900 text-white text-[10px] font-medium py-1 px-2.5 rounded-md shadow-xl pointer-events-none whitespace-nowrap z-50">
                      {getRatingInfo()}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 italic font-normal leading-tight">
                    Ungraded
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={`text-[10px] uppercase tracking-wider leading-tight ${getStatusStyle()}`}>
                {getStatusText()}
              </span>
              <div className="mt-0.5">
                <span
                  className={`text-[11px] leading-tight ${
                    property.attempts === 0
                      ? "text-neutral-400 italic font-normal"
                      : "text-neutral-600 font-medium"
                  }`}
                >
                  {property.attempts} {property.attempts === 1 ? "attempt" : "attempts"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="p-4 pt-0">
        {property.status === "submitted" && property.latest_submission_id && onViewResults ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id={`btn-scorecard-${property.zpid}`}
              onClick={() => onViewResults(String(property.latest_submission_id))}
              className="w-full py-2.5 px-2 rounded-xl text-xs font-semibold tracking-wide bg-[#52A68B] text-white hover:bg-[#438a72] transition-all duration-200 cursor-pointer text-center shadow-sm truncate"
              title="View Graded Scorecard / Gradesheet"
            >
              View Gradesheet
            </button>
            <button
              type="button"
              id={`btn-select-${property.zpid}`}
              onClick={() => onSelect(property.zpid)}
              className="w-full py-2.5 px-2 rounded-xl text-xs font-semibold tracking-wide bg-[#EBF5F1] text-[#52A68B] hover:bg-[#52A68B] hover:text-white border border-[#52A68B]/40 transition-all duration-200 cursor-pointer text-center shadow-sm truncate"
              title="Review & Re-underwrite Deal"
            >
              Review
            </button>
          </div>
        ) : (
          <button
            id={`btn-select-${property.zpid}`}
            onClick={() => onSelect(property.zpid)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center ${
              property.status === "in_progress"
                ? "bg-[#52A68B] text-white hover:bg-[#438a72] shadow-sm shadow-[#52A68B]/25"
                : "border border-[#52A68B] text-[#52A68B] bg-white hover:bg-[#52A68B] hover:text-white shadow-sm"
            }`}
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};
