import React from "react";
import { UnderwritingData, DealTags } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Tag, FileText, Check } from "lucide-react";

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
  const selectedTagsCount = TAG_CONFIG.filter(({ key }) => Boolean(tags[key])).length;

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
          action={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF5F1] text-[#3d7d69] border border-[#c2e4d8]">
              <Tag className="w-3.5 h-3.5" />
              <span>{selectedTagsCount} of {TAG_CONFIG.length} Selected</span>
            </span>
          }
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
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? "bg-[#52A68B]/10 border-[#52A68B] shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/60"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition flex-shrink-0 ${
                      isActive
                        ? "bg-[#52A68B] border-[#52A68B] text-white shadow-xs"
                        : "border-zinc-300 bg-white"
                    }`}
                  >
                    {isActive && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <span className={`text-xs block ${isActive ? "font-bold text-[#204e40]" : "font-semibold text-zinc-800"}`}>
                      {label}
                    </span>
                    <span
                      className={`text-[11px] leading-tight block mt-0.5 line-clamp-2 ${
                        isActive ? "text-zinc-600" : "text-zinc-500"
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
          title="2. Renovation Level Grading"
          subtitle="Assess execution difficulty and capital overhaul requirements (1 = Minimal / Turnkey, 5 = Extensive / Heavy)."
        />
        <CardContent>
          <div className="max-w-xl">
            {/* Renovation Level */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40">
              <div className="mb-2">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Renovation Level
                </label>
              </div>
              <p className="text-[11px] text-zinc-500 mb-3 min-h-[16px]">
                {tags.renovation_level === 1 && "Turnkey / Cosmetic"}
                {tags.renovation_level === 2 && "Light Furnishing & Paint"}
                {tags.renovation_level === 3 && "Kitchen/Bath Refresh + Amenities"}
                {tags.renovation_level === 4 && "Substantial Remodel"}
                {tags.renovation_level === 5 && "Full Gut / Expansion"}
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNumericTag("renovation_level", lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      tags.renovation_level === lvl
                        ? "bg-[#52A68B] border-[#52A68B] text-white shadow-sm shadow-[#52A68B]/25"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
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
          <div className="relative">
            <textarea
              id="textarea-deal-pitch"
              rows={4}
              value={draft.deal_pitch || ""}
              onChange={(e) => updatePitch(e.target.value)}
              placeholder="e.g. Scenic mountain views near Ober; hot tub and game room unlock top-tier weekend ADR with year-round demand..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Recorded in submission history for senior analyst review.
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              {(draft.deal_pitch || "").length} characters
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
