"use client";

import React, { useState } from "react";
import { useUnderwriting } from "@/lib/context";
import { PropertyHeader } from "./PropertyHeader";
import { FinancialsTab } from "./FinancialsTab";
import { AnalysisTab } from "./AnalysisTab";
import { DealTagsTab } from "./DealTagsTab";
import { ReviewTab } from "./ReviewTab";
import {
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface WorkspaceViewProps {
  onBackToDashboard: () => void;
  onViewEvaluation: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  onBackToDashboard,
  onViewEvaluation,
}) => {
  const {
    activeDraft,
    selectedPropertyZpid,
    properties,
    markets,
    updateDraft,
    saveDraft,
    resetDraft,
    prefillFromReference,
    submitUnderwriting,
    isSaving,
  } = useUnderwriting();

  const [activeTab, setActiveTab] = useState<"financials" | "analysis" | "tags" | "review">("financials");
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);

  if (!selectedPropertyZpid || !activeDraft) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-base font-semibold text-slate-800">No property selected</p>
        <p className="text-xs text-slate-500 mt-1">Please select a property from the dashboard to start underwriting.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const property = properties.find((p) => p.zpid === selectedPropertyZpid);
  const market = markets.find((m) => m.id === property?.market_id);

  if (!property) return null;

  const handleSubmit = () => {
    setSubmissionErrors([]);
    const res = submitUnderwriting(selectedPropertyZpid);
    if (res.success) {
      onViewEvaluation();
    } else if (res.errors) {
      setSubmissionErrors(res.errors);
      setActiveTab("review");
    }
  };

  const tabs = [
    { id: "financials", label: "1. Financials", icon: DollarSign, sub: "Purchase, Setup & OPEX" },
    { id: "analysis", label: "2. Analysis", icon: TrendingUp, sub: "Revenue Scenarios & Returns" },
    { id: "tags", label: "3. Deal Tags", icon: Tag, sub: "Classifications & Pitch" },
    { id: "review", label: "4. Review & Submit", icon: CheckCircle, sub: "Validation & Grading" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Property Context Header */}
      <PropertyHeader
        property={property}
        market={market}
        onBack={onBackToDashboard}
        onSave={saveDraft}
        onReset={() => resetDraft(selectedPropertyZpid)}
        onPrefillReference={() => prefillFromReference(selectedPropertyZpid)}
        isSaving={isSaving}
      />

      {/* Submission Errors Alert */}
      {submissionErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Please address the following before submitting:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {submissionErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Workspace Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap flex items-center gap-2 transition ${
                  isActive
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                <div className="text-left">
                  <span>{tab.label}</span>
                  <span className="hidden sm:block text-[10px] text-slate-400 font-normal">
                    {tab.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === "financials" && (
          <FinancialsTab draft={activeDraft} onUpdate={updateDraft} />
        )}
        {activeTab === "analysis" && (
          <AnalysisTab draft={activeDraft} onUpdate={updateDraft} />
        )}
        {activeTab === "tags" && (
          <DealTagsTab draft={activeDraft} onUpdate={updateDraft} />
        )}
        {activeTab === "review" && (
          <ReviewTab
            draft={activeDraft}
            onSubmit={handleSubmit}
            onPrefillReference={() => prefillFromReference(selectedPropertyZpid)}
          />
        )}
      </div>
    </div>
  );
};
