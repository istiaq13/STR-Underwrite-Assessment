"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUnderwriting } from "@/lib/context";
import { PropertyHeader } from "@/components/workspace/PropertyHeader";
import { FinancialsTab } from "@/components/workspace/FinancialsTab";
import { AnalysisTab } from "@/components/workspace/AnalysisTab";
import { DealTagsTab } from "@/components/workspace/DealTagsTab";
import { ReviewTab } from "@/components/workspace/ReviewTab";
import { RealtimeResultsPanel } from "@/components/workspace/RealtimeResultsPanel";
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceSkeleton";
import {
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const zpid = (params?.zpid as string) || "";

  const {
    activeDraft,
    selectedPropertyZpid,
    properties,
    markets,
    isLoadingDashboard,
    isLoadingDraft,
    selectProperty,
    finishOpeningProperty,
    updateDraft,
    saveDraft,
    resetDraft,
    prefillFromReference,
    submitUnderwriting,
    isSaving,
  } = useUnderwriting();

  const [activeTab, setActiveTab] = useState<"financials" | "analysis" | "tags" | "review">("financials");
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);

  useEffect(() => {
    if (zpid && zpid !== selectedPropertyZpid) {
      selectProperty(zpid);
    }
  }, [zpid, selectedPropertyZpid, selectProperty]);

  // Dismiss top loading bar and dull overlay once workspace is mounted and ready
  useEffect(() => {
    const timer = setTimeout(() => {
      finishOpeningProperty();
    }, 250);
    return () => clearTimeout(timer);
  }, [finishOpeningProperty]);

  const property = properties.find((p) => p.zpid === zpid);
  const market = markets.find((m) => m.id === property?.market_id);

  const currentDraft = useMemo(() => {
    if (activeDraft && activeDraft.zpid === zpid) {
      return activeDraft;
    }
    return null;
  }, [activeDraft, zpid]);

  // If loading or initializing from backend, show wave skeleton
  if (isLoadingDashboard || isLoadingDraft || (!currentDraft && !property)) {
    return <WorkspaceSkeleton />;
  }

  if (!property || !currentDraft) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-base font-semibold text-slate-800">Property not found</p>
        <p className="text-xs text-slate-500 mt-1">Unable to locate listing or draft for ZPID: {zpid}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmissionErrors([]);
    const res = await submitUnderwriting(zpid);
    if (res.success) {
      router.push("/evaluation");
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
    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      <PropertyHeader
        property={property}
        market={market}
        onBack={() => router.push("/")}
        onSave={saveDraft}
        onReset={() => resetDraft(zpid)}
        onPrefillReference={() => prefillFromReference(zpid)}
        isSaving={isSaving}
      />

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
          <section className="lg:col-span-7 xl:col-span-7 p-3.5 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
            {/* Left Header: Underwriting Steps / Tabs */}
            <div className="border-b border-zinc-200/90 pb-3.5 sm:pb-4">
              <div className="flex items-center gap-2 mb-3 sm:mb-3.5">
                <span className="w-2 h-2 rounded-full bg-[#52A68B]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Underwriting Workflow
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all text-left relative cursor-pointer border ${
                        isActive
                          ? "bg-[#52A68B] text-white border-[#52A68B] shadow-sm shadow-[#52A68B]/30 ring-2 ring-[#52A68B]/25"
                          : "bg-white text-zinc-700 hover:text-[#2E6B57] hover:bg-[#EBF5F1]/50 border-zinc-200/90 hover:border-[#52A68B]/40 shadow-xs"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-zinc-100 text-zinc-500 group-hover:bg-[#EBF5F1] group-hover:text-[#52A68B]"
                        }`}
                      >
                        <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
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
                <FinancialsTab draft={currentDraft} onUpdate={updateDraft} />
              )}
              {activeTab === "analysis" && (
                <AnalysisTab draft={currentDraft} onUpdate={updateDraft} />
              )}
              {activeTab === "tags" && (
                <DealTagsTab draft={currentDraft} onUpdate={updateDraft} />
              )}
              {activeTab === "review" && (
                <ReviewTab
                  draft={currentDraft}
                  onSubmit={handleSubmit}
                  onPrefillReference={() => prefillFromReference(zpid)}
                  isSubmitting={isSaving}
                />
              )}
            </div>
          </section>

          {/* RIGHT SECTION: Real-Time Calculated Results Panel */}
          <section className="lg:col-span-5 xl:col-span-5 bg-zinc-50/40 p-3.5 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
            <RealtimeResultsPanel draft={currentDraft} />
          </section>
        </div>
      </div>
    </div>
  );
}
