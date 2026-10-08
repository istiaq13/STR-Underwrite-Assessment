import React from "react";
import { Property, Market } from "@/types";
import { StatusBadge, RatingBadge } from "@/components/ui/Badge";
import { sanitizeUrl } from "@/lib/security";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  RotateCcw,
  Target,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Building2,
} from "lucide-react";

interface PropertyHeaderProps {
  property: Property;
  market?: Market;
  onBack: () => void;
  onSave: () => void;
  onReset: () => void;
  onPrefillReference: () => void;
  isSaving: boolean;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  property,
  market,
  onBack,
  onSave,
  onReset,
  onPrefillReference,
  isSaving,
}) => {
  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-card">
      {/* Top action row */}
      <div className="px-4 sm:px-6 py-3 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrefillReference}
            title="Load Analyst Benchmark"
            aria-label="Load Analyst Benchmark"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 hover:bg-[#EBF5F1]/60 hover:text-[#52A68B] hover:border-[#52A68B]/40 transition shadow-xs cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition shadow-xs cursor-pointer"
            title="Reset form"
            aria-label="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-save-draft"
            onClick={onSave}
            disabled={isSaving}
            title="Save Draft"
            aria-label="Save Draft"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-[#52A68B] hover:bg-[#438a73] border border-[#52A68B] shadow-sm shadow-[#52A68B]/25 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 text-white ${isSaving ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main info row */}
      <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail */}
        <div className="w-full md:w-44 h-32 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 relative shadow-sm">
          {property.img_src ? (
            <img
              src={property.img_src}
              alt={property.address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
              <Building2 className="w-8 h-8 opacity-40" />
            </div>
          )}
        </div>

        {/* Address and details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
              <MapPin className="w-3 h-3 text-zinc-500" />
              {property.market_name}
            </span>
            <StatusBadge status={property.status} />
            {property.best_accuracy !== null && (
              <RatingBadge rating={property.best_rating} accuracy={property.best_accuracy} />
            )}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight flex-1 min-w-0">
              {property.address}
            </h2>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block leading-tight">
                List Price
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#52A68B] tracking-tight font-mono">
                {property.price}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.beds} Bedrooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.baths} Bathrooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.area.toLocaleString()} sqft</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{property.time_on_zillow}</span>
            </div>
            <a
              href={sanitizeUrl(property.detail_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-900 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>View Listing</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Market Context Box */}
          {market && (
            <div className="mt-3.5 p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/80 text-xs text-zinc-600 leading-relaxed">
              <span className="font-semibold text-zinc-900">Regional Market Thesis ({market.name}): </span>
              {market.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
