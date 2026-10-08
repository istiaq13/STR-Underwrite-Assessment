"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { useUnderwriting } from "@/lib/context";
import { fetchProperties } from "@/lib/api";
import { PropertyCard } from "./PropertyCard";
import { PropertyCardSkeleton } from "./PropertyCardSkeleton";
import { DashboardStats } from "./DashboardStats";

interface DashboardViewProps {
  onSelectProperty: (zpid: string) => void;
  onOpenLeaderboard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectProperty,
}) => {
  const router = useRouter();
  const {
    properties,
    markets,
    dashboardSummary,
    isLoadingDashboard,
    dashboardError,
    refreshDashboard,
    startOpeningProperty,
  } = useUnderwriting();
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [matchingZpids, setMatchingZpids] = useState<string[] | null>(null);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);

  // Calls GET /api/properties?search= over the wire when user types in search box
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchingZpids(null);
      setIsSearchingCatalog(false);
      return;
    }

    let isMounted = true;
    setIsSearchingCatalog(true);

    const timer = setTimeout(async () => {
      try {
        const results = await fetchProperties(
          searchQuery.trim(),
          selectedMarketId ?? undefined
        );
        if (isMounted) {
          setMatchingZpids(results.map((r) => r.zpid));
        }
      } catch (err) {
        console.warn("Backend property catalog query failed:", err);
      } finally {
        if (isMounted) setIsSearchingCatalog(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedMarketId]);

  const filteredProperties = properties.filter((p) => {
    // 1. Instant Market filter (Instant 0ms synchronous filter)
    if (selectedMarketId !== null && p.market_id !== selectedMarketId) {
      return false;
    }

    // 2. Search query filter (instant local match + backend catalog sync)
    if (matchingZpids !== null) {
      if (!matchingZpids.includes(p.zpid)) return false;
    } else if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchCity = p.address_city.toLowerCase().includes(q);
      const matchMarket = p.market_name.toLowerCase().includes(q);
      if (!matchAddress && !matchCity && !matchMarket) return false;
    }

    // Status filter
    if (statusFilter === "completed" && p.status !== "submitted") return false;
    if (statusFilter === "in_progress" && p.status !== "in_progress") return false;
    if (statusFilter === "not_started" && p.status !== "not_started") return false;

    return true;
  });

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  const handleHeroSearch = () => {
    // When clicking search, filter by location if matching a market
    const loc = selectedLocation.toLowerCase().trim();
    if (loc) {
      const match = markets.find(
        (m) => m.name.toLowerCase() === loc || (m.slug && m.slug.toLowerCase() === loc)
      );
      if (match) {
        setSelectedMarketId(match.id);
        setSearchQuery("");
      } else {
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
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-20 relative z-10 my-auto py-8 sm:py-12">
          <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-5 sm:space-y-6">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-extrabold text-[#1E293B] leading-[1.15] sm:leading-[1.12] tracking-tight">
              Let&apos;s hunt for your <br className="hidden sm:inline" />
              dream residence
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-lg leading-relaxed">
              Explore our range of beautiful properties with the addition of separate accommodation suitable for you.
            </p>

            {/* Interactive Search Card with Buy Tab (Overlaps onto building image) */}
            <div className="pt-2 relative z-20">
              {/* Buy Tab */}
              <div className="flex items-center">
                <div className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold bg-white text-[#52A68B] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] inline-block select-none">
                  Buy
                </div>
              </div>

              {/* Card Container (Overlaps horizontally into the right half building) */}
              <div className="bg-white rounded-b-2xl rounded-tr-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 max-w-2xl lg:max-w-2xl xl:max-w-3xl">
                {/* 1. Location */}
                <div className="flex-1 px-2 sm:px-3 py-1 border-b sm:border-b-0 sm:border-r border-neutral-100 pb-2.5 sm:pb-1">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-neutral-800 tracking-wide mb-0.5">
                    Location
                  </label>
                  <div className="relative flex items-center justify-between">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full text-xs sm:text-sm font-medium text-neutral-700 bg-transparent focus:outline-none cursor-pointer appearance-none truncate pr-5"
                    >
                      <option value="">All Markets & Locations</option>
                      {markets.map((m) => (
                        <option key={m.id} value={m.name} className="text-neutral-800">
                          {m.name} ({m.property_count} listings)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8] flex-shrink-0 pointer-events-none absolute right-0" strokeWidth={2} />
                  </div>
                </div>

                {/* 2. Type */}
                <div className="flex-1 px-2 sm:px-3 py-1 border-b sm:border-b-0 sm:border-r border-neutral-100 pb-2.5 sm:pb-1">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-neutral-800 tracking-wide mb-0.5">
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
                <div className="flex-1 px-2 sm:px-3 py-1 pb-1 sm:pb-1">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-neutral-800 tracking-wide mb-0.5">
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
                  className="w-full sm:w-auto bg-[#52A68B] hover:bg-[#438a72] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-md shadow-[#52A68B]/25 flex-shrink-0 cursor-pointer text-center"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Mobile Image Fallback */}
            <div className="lg:hidden mt-6 sm:mt-8 rounded-2xl overflow-hidden shadow-lg border border-neutral-100 aspect-[16/10] sm:aspect-[16/9]">
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
        className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-20 pt-12 sm:pt-20 pb-16 sm:pb-20 scroll-mt-20 border-t border-neutral-100"
      >
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Best recomendation
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mt-1 leading-relaxed">
            Discover our exclusive selection of the finest one-of-a-kind luxury properties architectural masterpieces.
          </p>
        </div>

        {dashboardError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="text-xs">
              <span className="font-bold">Backend Connection Notice: </span>
              {dashboardError}. Ensure your FastAPI backend is running on <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono">http://localhost:8000</code>.
            </div>
            <button
              type="button"
              onClick={() => refreshDashboard()}
              className="text-xs font-semibold bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded-lg transition cursor-pointer flex-shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Training KPI Dashboard Stats */}
        <div className="mb-8">
          <DashboardStats
            properties={properties}
            summary={dashboardSummary}
            isLoading={isLoadingDashboard}
          />
        </div>

        {/* Modern Filter Toolbar & Reshaped Search Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6">
          {markets.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none flex-1 -mx-1 px-1 sm:mx-0 sm:px-0">
              <button
                type="button"
                id="market-filter-all"
                onClick={() => setSelectedMarketId(null)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 flex items-center gap-1.5 sm:gap-2 border ${
                  selectedMarketId === null
                    ? "bg-[#52A68B] text-white border-[#52A68B] shadow-sm shadow-[#52A68B]/25"
                    : "bg-white text-neutral-600 border-neutral-200/90 hover:bg-[#EBF5F1]/70 hover:text-[#52A68B] hover:border-[#52A68B]/40"
                }`}
              >
                <span>All Markets</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    selectedMarketId === null
                      ? "bg-white/20 text-white font-bold"
                      : "bg-neutral-100 text-neutral-600 font-medium"
                  }`}
                >
                  {properties.length}
                </span>
              </button>
              {markets.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  id={`market-filter-${m.id}`}
                  onClick={() => setSelectedMarketId(m.id === selectedMarketId ? null : m.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 flex items-center gap-1.5 sm:gap-2 border ${
                    selectedMarketId === m.id
                      ? "bg-[#52A68B] text-white border-[#52A68B] shadow-sm shadow-[#52A68B]/25"
                      : "bg-white text-neutral-600 border-neutral-200/90 hover:bg-[#EBF5F1]/70 hover:text-[#52A68B] hover:border-[#52A68B]/40"
                  }`}
                >
                  <span>{m.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      selectedMarketId === m.id
                        ? "bg-white/20 text-white font-bold"
                        : "bg-neutral-100 text-neutral-600 font-medium"
                    }`}
                  >
                    {m.property_count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Reshaped Modern Search Box */}
          <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[260px] md:min-w-[280px] lg:min-w-[300px]">
            <div className="flex items-center h-10 px-3.5 bg-white border border-neutral-200/90 rounded-xl shadow-xs transition-all duration-200 focus-within:border-[#52A68B] focus-within:ring-2 focus-within:ring-[#52A68B]/15 focus-within:shadow-sm">
              <Search
                className={`w-4 h-4 mr-2.5 flex-shrink-0 transition-colors ${
                  isSearchingCatalog ? "text-[#52A68B] animate-pulse" : "text-neutral-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search properties or addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 w-4 h-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center text-[10px] font-bold transition flex-shrink-0 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoadingDashboard && properties.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <PropertyCardSkeleton key={n} />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.zpid}
                property={property}
                onSelect={onSelectProperty}
                onViewResults={(subId) => {
                  startOpeningProperty();
                  router.push(`/evaluation?id=${subId}`);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
