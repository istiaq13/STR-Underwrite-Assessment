"use client";

import React, { useState } from "react";
import { useUnderwriting } from "@/lib/context";
import { PropertyHeader } from "./PropertyHeader";
import { FinancialsTab } from "./FinancialsTab";
import { AnalysisTab } from "./AnalysisTab";
import { DealTagsTab } from "./DealTagsTab";
import { ReviewTab } from "./ReviewTab";
import { RealtimeResultsPanel } from "./RealtimeResultsPanel";
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

  const handleSubmit = async () => {
    setSubmissionErrors([]);
    const res = await submitUnderwriting(selectedPropertyZpid);
    if (res.success) {
      onViewEvaluation();
    } else if (res.errors) {
      setSubmissionErrors(res.errors);
      setActiveTab("review");
    }
  };

  const tabs = [
    { id: "financials", label: "1. Financials", icon: DollarSign },
    { id: "analysis", label: "2. Analysis", icon: TrendingUp },
    { id: "tags", label: "3. Deal Tags", icon: Tag },
    { id: "review", label: "4. Review & Submit", icon: CheckCircle },
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

      {/* Partitioned 2-Section Workspace Layout */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/90">
          
          {/* LEFT SECTION: Tabs Navigation & Calculation Input Part */}
          <section className="lg:col-span-7 xl:col-span-7 p-5 sm:p-7 space-y-6">
            {/* Left Header: Underwriting Steps / Tabs */}
            <div className="border-b border-zinc-200/90 pb-4">
              <div className="flex items-center gap-2 mb-3.5">
                <span className="w-2 h-2 rounded-full bg-[#52A68B]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Underwriting Workflow
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all text-left relative cursor-pointer border ${
                        isActive
                          ? "bg-[#52A68B] text-white border-[#52A68B] shadow-sm shadow-[#52A68B]/30 ring-2 ring-[#52A68B]/25"
                          : "bg-white text-zinc-700 hover:text-[#2E6B57] hover:bg-[#EBF5F1]/50 border-zinc-200/90 hover:border-[#52A68B]/40 shadow-xs"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-zinc-100 text-zinc-500 group-hover:bg-[#EBF5F1] group-hover:text-[#52A68B]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`truncate font-bold ${isActive ? "text-white" : "text-zinc-800 group-hover:text-zinc-900"}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Left Body: Calculation Input Part for Active Tab */}
            <div className="space-y-6">
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
          </section>

          {/* RIGHT SECTION: Real-Time Calculated Results Panel */}
          <section className="lg:col-span-5 xl:col-span-5 bg-zinc-50/40 p-5 sm:p-7 space-y-6">
            <RealtimeResultsPanel draft={activeDraft} />
          </section>
        </div>
      </div>
    </div>
  );
};
