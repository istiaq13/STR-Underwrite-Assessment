"use client";

import React from "react";
import { UnderwritingData, CompItem } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PercentageSliderInput } from "@/components/ui/Input";
import { sanitizeUrl } from "@/lib/security";
import {
  Target,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface AnalysisTabProps {
  draft: UnderwritingData;
  onUpdate: (updater: (prev: UnderwritingData) => UnderwritingData) => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ draft, onUpdate }) => {
  const rev = draft.forecasted_revenue;

  const updateRevenue = (field: keyof typeof rev, val: number) => {
    onUpdate((prev) => ({
      ...prev,
      forecasted_revenue: {
        ...prev.forecasted_revenue,
        [field]: val,
      },
    }));
  };

  const addCompItem = () => {
    const newComp: CompItem = {
      id: `comp-${Date.now()}`,
      listing_url: "https://www.airbnb.com",
      revenue: 125000,
      bedrooms: draft.bedrooms || 3,
      sleeps: draft.sleep_count_low || 6,
    };

    onUpdate((prev) => ({
      ...prev,
      comp_set: [...(prev.comp_set || []), newComp],
    }));
  };

  const updateCompItem = (id: string, field: keyof CompItem, value: any) => {
    onUpdate((prev) => ({
      ...prev,
      comp_set: (prev.comp_set || []).map((comp) =>
        comp.id === id ? { ...comp, [field]: value } : comp
      ),
    }));
  };

  const removeCompItem = (id: string) => {
    onUpdate((prev) => ({
      ...prev,
      comp_set: (prev.comp_set || []).filter((comp) => comp.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Revenue Forecasts */}
      <Card id="card-revenue-scenarios">
        <CardHeader
          title="1. Revenue Scenarios & Operational Assumptions"
          subtitle="Enter Low, Mid, and High annual gross revenue projections. Note: Your Mid forecast is what the grading algorithm evaluates."
        />
        <CardContent>
          {/* Revenue Scenarios Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Low Scenario */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Low Scenario (Cautious)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono">
                  OPEX × 0.96
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">
                Off-peak weather, higher vacancy, market headwinds.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-mono text-sm">$</span>
                <input
                  id="input-low-revenue"
                  type="number"
                  value={rev.low_revenue || ""}
                  onChange={(e) => updateRevenue("low_revenue", Number(e.target.value))}
                  placeholder="105,000"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Mid Scenario - Highlighted */}
            <div className="p-4 rounded-xl border-2 border-zinc-900 bg-zinc-900/5 relative shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-zinc-900" />
                  Mid Scenario (Expected)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-white font-bold tracking-wide uppercase">
                  Graded Metric
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 mb-2">
                Base expected performance. Scored directly against senior analyst benchmark.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm font-bold">$</span>
                <input
                  id="input-mid-revenue"
                  type="number"
                  value={rev.mid_revenue || ""}
                  onChange={(e) => updateRevenue("mid_revenue", Number(e.target.value))}
                  placeholder="125,000"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold text-zinc-900 rounded-lg border-2 border-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* High Scenario */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  High Scenario (Bullish)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-mono">
                  OPEX × 1.04
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">
                Strong event calendar, peak ADR, Superhost status.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-mono text-sm">$</span>
                <input
                  id="input-high-revenue"
                  type="number"
                  value={rev.high_revenue || ""}
                  onChange={(e) => updateRevenue("high_revenue", Number(e.target.value))}
                  placeholder="142,000"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Operational Overheads & Appreciation */}
          <div className="mt-6 pt-6 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <PercentageSliderInput
              id="slider-cohost-fee"
              label="Co-Hosting Management Fee %"
              value={rev.co_hosting_fee_pct}
              onChange={(val) => updateRevenue("co_hosting_fee_pct", val)}
              min={0}
              max={30}
              step={1}
              helperText="Set to 0% if self-managing. Standard co-host management is 10%–20%."
            />

            <PercentageSliderInput
              id="slider-re-appreciation"
              label="Annual Real Estate Appreciation %"
              value={rev.annual_re_appreciation_pct}
              onChange={(val) => updateRevenue("annual_re_appreciation_pct", val)}
              min={0}
              max={8}
              step={0.5}
              helperText="Expected annual property value appreciation (standard 3.0%)."
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Micro-Market Rental Comparables (Comps Set) */}
      <Card id="card-comp-set">
        <CardHeader
          title="2. Micro-Market Rental Comparables (Comps Set)"
          subtitle="Reference market comparables to calibrate your gross annual revenue assumptions."
          action={
            <button
              id="btn-add-comp"
              onClick={addCompItem}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#52A68B] hover:bg-[#438a73] shadow-sm shadow-[#52A68B]/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Comp</span>
            </button>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-2">Listing URL / Comp Link</th>
                  <th className="pb-2 text-right">Bedrooms</th>
                  <th className="pb-2 text-right">Sleeps</th>
                  <th className="pb-2 text-right">Annual Revenue ($)</th>
                  <th className="pb-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(draft.comp_set && draft.comp_set.length > 0) ? (
                  draft.comp_set.map((comp) => (
                    <tr key={comp.id} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={comp.listing_url}
                            onChange={(e) => updateCompItem(comp.id, "listing_url", e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                            placeholder="https://airbnb.com/rooms/..."
                          />
                          {comp.listing_url && (
                            <a
                              href={sanitizeUrl(comp.listing_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-zinc-700"
                              title="Open listing"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        <input
                          type="number"
                          value={comp.bedrooms || ""}
                          onChange={(e) => updateCompItem(comp.id, "bedrooms", Number(e.target.value))}
                          className="w-14 px-1.5 py-1 text-xs font-mono text-right rounded border border-zinc-200 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        <input
                          type="number"
                          value={comp.sleeps || ""}
                          onChange={(e) => updateCompItem(comp.id, "sleeps", Number(e.target.value))}
                          className="w-14 px-1.5 py-1 text-xs font-mono text-right rounded border border-zinc-200 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-zinc-900">
                        $<input
                          type="number"
                          value={comp.revenue || ""}
                          onChange={(e) => updateCompItem(comp.id, "revenue", Number(e.target.value))}
                          className="w-24 px-1.5 py-1 text-xs font-mono text-right rounded border border-zinc-200 bg-white"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => removeCompItem(comp.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 transition"
                          title="Remove comp"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400 italic">
                      No comparable listings attached. Click &quot;Add Comp&quot; to calibrate revenue assumptions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
