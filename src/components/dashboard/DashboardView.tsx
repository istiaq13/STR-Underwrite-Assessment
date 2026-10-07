"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useUnderwriting } from "@/lib/context";
import { PropertyCard } from "./PropertyCard";

interface DashboardViewProps {
  onSelectProperty: (zpid: string) => void;
  onOpenLeaderboard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectProperty,
}) => {
  const { properties } = useUnderwriting();
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProperties = properties.filter((p) => {
    // Market filter
    if (selectedMarketId !== null && p.market_id !== selectedMarketId) {
      return false;
    }
    // Status filter
    if (statusFilter === "completed" && p.status !== "submitted") return false;
    if (statusFilter === "in_progress" && p.status !== "in_progress") return false;
    if (statusFilter === "not_started" && p.status !== "not_started") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchCity = p.address_city.toLowerCase().includes(q);
      const matchMarket = p.market_name.toLowerCase().includes(q);
      return matchAddress || matchCity || matchMarket;
    }

    return true;
  });

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  const handleHeroSearch = () => {
    // When clicking search, filter by location if matching a market
    const loc = selectedLocation.toLowerCase().trim();
    if (loc) {
      if (loc.includes("broken bow")) setSelectedMarketId(1);
      else if (loc.includes("pigeon forge") || loc.includes("smoky") || loc.includes("blue ridge")) setSelectedMarketId(2);
      else if (loc.includes("joshua tree") || loc.includes("california")) setSelectedMarketId(3);
      else if (loc.includes("austin") || loc.includes("texas")) setSelectedMarketId(4);
      else if (loc.includes("florida") || loc.includes("orlando")) setSelectedMarketId(3);
      else {
        setSelectedMarketId(null);
        setSearchQuery(selectedLocation);
      }
    } else {
      setSelectedMarketId(null);
    }

    // Smooth scroll to results
    document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* ── 1. FULL VIEWPORT HERO SECTION (Covers entire screen, matching screenshot) ── */}
      <section className="relative w-full overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-center bg-white">
        {/* Right Half Background Building Image (1:1 with Screenshot) */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[48%] xl:w-[50%] 2xl:w-[52%] h-full z-0 pointer-events-none overflow-hidden">
          <img
            src="/images/mulih-hero-building.jpg"
            alt="Mulih Dream Residence"
            className="w-full h-full object-cover object-left-bottom select-none"
          />
        </div>

        {/* Center / Left Content Container */}
        <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10 my-auto py-8 sm:py-12">
          <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-6">
            {/* Pill Tag */}
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#52A68B] bg-[#EBF5F1] px-3.5 py-1.5 rounded-md inline-block">
                Real Estate
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-extrabold text-[#1E293B] leading-[1.12] tracking-tight">
              Let&apos;s hunt for your <br />
              dream residence
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-neutral-500 max-w-lg leading-relaxed">
              Explore our range of beautiful properties with the addition of separate accommodation suitable for you.
            </p>

            {/* Interactive Search Card with Buy Tab (Overlaps onto building image) */}
            <div className="pt-2 relative z-20">
              {/* Buy Tab */}
              <div className="flex items-center">
                <div className="px-7 py-2.5 rounded-t-xl text-sm font-semibold bg-white text-[#52A68B] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] inline-block select-none">
                  Buy
                </div>
              </div>

              {/* Card Container (Overlaps horizontally into the right half building) */}
              <div className="bg-white rounded-b-2xl rounded-tr-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 max-w-2xl lg:max-w-2xl xl:max-w-3xl">
                {/* 1. Location */}
                <div className="flex-1 px-3 py-1 border-b sm:border-b-0 sm:border-r border-neutral-100">
                  <label className="block text-[11px] font-bold text-neutral-800 tracking-wide mb-0.5">
                    Location
                  </label>
                  <div className="relative flex items-center justify-between">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium text-neutral-400 bg-transparent focus:outline-none cursor-pointer appearance-none truncate pr-5"
                    >
                      <option value="">Choose location</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8] flex-shrink-0 pointer-events-none absolute right-0" strokeWidth={2} />
                  </div>
                </div>

                {/* 2. Type */}
                <div className="flex-1 px-3 py-1 border-b sm:border-b-0 sm:border-r border-neutral-100">
                  <label className="block text-[11px] font-bold text-neutral-800 tracking-wide mb-0.5">
                    Type
                  </label>
                  <div className="relative flex items-center justify-between">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium text-neutral-400 bg-transparent focus:outline-none cursor-pointer appearance-none truncate pr-5"
                    >
                      <option value="">Choose type</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8] flex-shrink-0 pointer-events-none absolute right-0" strokeWidth={2} />
                  </div>
                </div>

                {/* 3. Price Range */}
                <div className="flex-1 px-3 py-1">
                  <label className="block text-[11px] font-bold text-neutral-800 tracking-wide mb-0.5">
                    Price Range
                  </label>
                  <div className="relative flex items-center justify-between">
                    <select
                      value={selectedPriceRange}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium text-neutral-400 bg-transparent focus:outline-none cursor-pointer appearance-none truncate pr-5"
                    >
                      <option value="">Set range</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8] flex-shrink-0 pointer-events-none absolute right-0" strokeWidth={2} />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={handleHeroSearch}
                  className="bg-[#52A68B] hover:bg-[#438a72] text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition shadow-md shadow-[#52A68B]/25 flex-shrink-0 cursor-pointer text-center"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Mobile Image Fallback */}
            <div className="lg:hidden mt-8 rounded-2xl overflow-hidden shadow-lg border border-neutral-100 aspect-[4/3]">
              <img
                src="/images/mulih-hero-building.jpg"
                alt="Mulih Dream Residence"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BEST RECOMMENDATION SECTION (Below the fold, user scrolls to see this) ── */}
      <section
        id="recommendations"
        className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 pt-16 sm:pt-24 pb-20 scroll-mt-20 border-t border-neutral-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#52A68B] bg-[#EBF5F1] px-3 py-1.5 rounded inline-block mb-3">
              Discover
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Best recomendation
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mt-2 leading-relaxed">
              Discover our exclusive selection of the finest one-of-a-kind luxury properties architectural masterpieces.
            </p>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-200 p-8">
            <p className="text-sm font-semibold text-neutral-700">No properties found</p>
            <p className="text-xs text-neutral-400 mt-1">Try selecting another location or property type.</p>
            <button
              onClick={() => {
                setSelectedMarketId(null);
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-3 text-xs font-semibold text-[#52A68B] underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.zpid}
                property={property}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
