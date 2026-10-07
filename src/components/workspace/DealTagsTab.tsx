import React from "react";
import { UnderwritingData, DealTags } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Tag, Sparkles, Sliders, FileText } from "lucide-react";

interface DealTagsTabProps {
  draft: UnderwritingData;
  onUpdate: (updater: (prev: UnderwritingData) => UnderwritingData) => void;
}

const TAG_CONFIG: { key: keyof DealTags; label: string; desc: string }[] = [
  { key: "turnkey", label: "Turnkey", desc: "Ready to rent on day one without major capital fixes." },
  { key: "furnished", label: "Furnished", desc: "Existing furniture package included in purchase." },
  { key: "luxury", label: "Luxury", desc: "Top-decile finishes, designer architecture, or high-end amenities." },
  { key: "tax_efficient", label: "Tax Efficient", desc: "High short-life depreciation ratio unlocks large Y1 tax savings." },
  { key: "new_construction", label: "New Construction", desc: "Built recently with minimal near-term maintenance reserves." },
  { key: "existing_airbnb", label: "Existing Airbnb", desc: "Active STR operational history and review track record." },
  { key: "arv", label: "ARV Opportunity", desc: "Significant value-add potential post-renovation." },
  { key: "high_cash_on_cash", label: "High Cash-on-Cash", desc: "Produces double-digit expected free cash flow yield." },
  { key: "low_cash_on_cash", label: "Low Cash-on-Cash", desc: "Appreciation or trophy play with modest initial yield." },
  { key: "add_inground_pool", label: "Add In-ground Pool", desc: "Opportunity to add a pool to unlock higher ADR tiers." },
  { key: "waterfront", label: "Waterfront", desc: "Direct lakefront, beachfront, or creek frontage." },
  { key: "remote", label: "Remote Location", desc: "Rural or secluded cabin requiring dedicated local operations." },
  { key: "can_support_cohost", label: "Can Support Co-host", desc: "Strong enough margins to afford third-party management." },
];

export const DealTagsTab: React.FC<DealTagsTabProps> = ({ draft, onUpdate }) => {
  const tags = draft.tags;

  const toggleTag = (key: keyof DealTags) => {
    onUpdate((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [key]: !prev.tags[key],
      },
    }));
  };

  const setNumericTag = (key: "renovation_level" | "deal_complexity", val: number) => {
    onUpdate((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [key]: val,
      },
    }));
  };

  const updatePitch = (pitch: string) => {
    onUpdate((prev) => ({
      ...prev,
      deal_pitch: pitch,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Yes/No Deal Classification Tags */}
      <Card id="card-deal-tags">
        <CardHeader
          title="1. Deal Classification Tags"
          subtitle="Yes/no descriptors that categorize property characteristics at a glance. These describe the deal profile and don't directly affect the accuracy score."
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {TAG_CONFIG.map(({ key, label, desc }) => {
              const isActive = Boolean(tags[key]);
              return (
                <button
                  key={key}
                  id={`tag-toggle-${key}`}
                  type="button"
                  onClick={() => toggleTag(key)}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition ${
                      isActive
                        ? "bg-white border-white text-slate-900"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isActive && (
                      <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M3 7.5L5.5 10L11 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">{label}</span>
                    <span
                      className={`text-[11px] leading-tight block mt-0.5 line-clamp-2 ${
                        isActive ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Rating Levels */}
      <Card id="card-deal-complexity">
        <CardHeader
          title="2. Renovation & Complexity Grading"
          subtitle="Assess execution difficulty and capital overhaul requirements (1 = Minimal / Turnkey, 5 = Extensive / Heavy)."
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Renovation Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Renovation Level: Level {tags.renovation_level}
                </label>
                <span className="text-xs font-medium text-slate-500">
                  {tags.renovation_level === 1 && "Turnkey / Cosmetic"}
                  {tags.renovation_level === 2 && "Light Furnishing & Paint"}
                  {tags.renovation_level === 3 && "Kitchen/Bath Refresh + Amenities"}
                  {tags.renovation_level === 4 && "Substantial Remodel"}
                  {tags.renovation_level === 5 && "Full Gut / Expansion"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNumericTag("renovation_level", lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                      tags.renovation_level === lvl
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Deal Complexity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Deal Complexity: Level {tags.deal_complexity}
                </label>
                <span className="text-xs font-medium text-slate-500">
                  {tags.deal_complexity === 1 && "Straightforward Acquisition"}
                  {tags.deal_complexity === 2 && "Standard Cabin / HOA"}
                  {tags.deal_complexity === 3 && "Cohost Setup & Permitting"}
                  {tags.deal_complexity === 4 && "Heavy Permitting / Pool Construction"}
                  {tags.deal_complexity === 5 && "Complex Multi-Unit / Zoning"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNumericTag("deal_complexity", lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                      tags.deal_complexity === lvl
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Deal Pitch & Investment Thesis */}
      <Card id="card-deal-pitch">
        <CardHeader
          title="3. Trainee Investment Pitch"
          subtitle="Summarize why an investor should buy this property and the primary driver of outsized return."
        />
        <CardContent>
          <textarea
            id="textarea-deal-pitch"
            rows={4}
            value={draft.deal_pitch || ""}
            onChange={(e) => updatePitch(e.target.value)}
            placeholder="e.g. Scenic mountain views near Ober; hot tub and game room unlock top-tier weekend ADR with year-round demand..."
            className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Recorded in your submission history for senior analyst review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
