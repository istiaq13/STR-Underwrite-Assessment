import React from "react";
import { Property, Market } from "@/types";
import { StatusBadge, RatingBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
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

        <div className="flex items-center gap-2">
          <button
            onClick={onPrefillReference}
            title="Prefill with senior analyst reference data for testing/grading verification"
            className="px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Load Analyst Benchmark</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded-lg hover:bg-zinc-100 transition"
            title="Reset form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-save-draft"
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {/* Main info row */}
      <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail */}
        <div className="w-full md:w-44 h-32 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 relative shadow-sm">
          <img
            src={property.img_src}
            alt={property.address}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-zinc-900/90 text-white px-2 py-0.5 rounded-md text-xs font-mono font-bold backdrop-blur-md">
            {property.price}
          </div>
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

          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {property.address}
          </h2>

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
              href={property.detail_url}
              target="_blank"
              rel="noreferrer"
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
