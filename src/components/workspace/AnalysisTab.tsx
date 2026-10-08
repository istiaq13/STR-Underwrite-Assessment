"use client";

import React from "react";
import { UnderwritingData, CompItem } from "@/types";
import { formatCurrency } from "@/lib/calculations";
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
  const compSet = draft.comp_set || [];
  const avgCompRevenue =
    compSet.length > 0
      ? Math.round(
          compSet.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0) /
            compSet.length
        )
      : 0;

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
      listing_url: "",
      revenue: 0,
      bedrooms: 0,
      sleeps: 0,
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
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Cautious
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
                  placeholder="Enter low revenue"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
                />
              </div>
            </div>

            {/* Mid Scenario - Highlighted */}
            <div className="p-4 rounded-xl border-2 border-[#52A68B] bg-[#52A68B]/5 relative shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#52A68B] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#52A68B]" />
                  Mid Scenario (Expected)
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#52A68B] text-white font-bold tracking-wide uppercase shadow-xs">
                  Graded Metric
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 mb-2">
                Base expected performance. Scored directly against senior analyst benchmark.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#52A68B] font-mono text-sm font-bold">$</span>
                <input
                  id="input-mid-revenue"
                  type="number"
                  value={rev.mid_revenue || ""}
                  onChange={(e) => updateRevenue("mid_revenue", Number(e.target.value))}
                  placeholder="Enter mid revenue"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold text-zinc-900 rounded-lg border-2 border-[#52A68B] bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/40 focus:border-[#52A68B] transition-colors"
                />
              </div>
            </div>

            {/* High Scenario */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  High Scenario (Bullish)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Bullish
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
                  placeholder="Enter high revenue"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
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
                  <th className="pb-2.5 pr-2">Listing URL / Comp Link</th>
                  <th className="pb-2.5 px-2 text-right w-24">Bedrooms</th>
                  <th className="pb-2.5 px-2 text-right w-24">Sleeps</th>
                  <th className="pb-2.5 px-2 text-right w-44">Annual Revenue ($)</th>
                  <th className="pb-2.5 pl-2 text-center w-14">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {compSet.length > 0 ? (
                  compSet.map((comp) => (
                    <tr key={comp.id} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={comp.listing_url}
                            onChange={(e) => updateCompItem(comp.id, "listing_url", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                            placeholder="Enter listing URL (e.g. airbnb.com/...)"
                          />
                          {comp.listing_url && (
                            <a
                              href={sanitizeUrl(comp.listing_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-[#52A68B] transition-colors p-1"
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
                          min={0}
                          value={comp.bedrooms || ""}
                          onChange={(e) => updateCompItem(comp.id, "bedrooms", Number(e.target.value))}
                          placeholder="Beds"
                          className="w-16 px-2 py-1.5 text-xs font-mono text-right rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono">
                        <input
                          type="number"
                          min={0}
                          value={comp.sleeps || ""}
                          onChange={(e) => updateCompItem(comp.id, "sleeps", Number(e.target.value))}
                          placeholder="Sleeps"
                          className="w-16 px-2 py-1.5 text-xs font-mono text-right rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="relative inline-block w-36 sm:w-40">
                          <span className="absolute left-2.5 top-1.5 text-zinc-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            value={comp.revenue || ""}
                            onChange={(e) => updateCompItem(comp.id, "revenue", Number(e.target.value))}
                            placeholder="Enter revenue"
                            className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono text-right font-bold text-zinc-900 rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 pl-2 text-center">
                        <button
                          onClick={() => removeCompItem(comp.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

          <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              Total comps: {compSet.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700">Average Comp Revenue:</span>
              <span className="text-sm font-bold font-mono text-[#52A68B]">
                {formatCurrency(avgCompRevenue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
