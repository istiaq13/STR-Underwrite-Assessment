"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUnderwriting } from "@/lib/context";
import { createDraftUnderwriting } from "@/lib/mockData";
import { PropertyHeader } from "@/components/workspace/PropertyHeader";
import { FinancialsTab } from "@/components/workspace/FinancialsTab";
import { AnalysisTab } from "@/components/workspace/AnalysisTab";
import { DealTagsTab } from "@/components/workspace/DealTagsTab";
import { ReviewTab } from "@/components/workspace/ReviewTab";
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
    selectProperty,
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

  const property = properties.find((p) => p.zpid === zpid);
  const market = markets.find((m) => m.id === property?.market_id);

  // Fallback to avoid flash or delay during route transitions
  const currentDraft = useMemo(() => {
    if (activeDraft && activeDraft.zpid === zpid) {
      return activeDraft;
    }
    if (property) {
      return createDraftUnderwriting(property);
    }
    return null;
  }, [activeDraft, zpid, property]);

  if (!property || !currentDraft) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-base font-semibold text-slate-800">Property not found</p>
        <p className="text-xs text-slate-500 mt-1">Unable to locate listing for ZPID: {zpid}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = () => {
    setSubmissionErrors([]);
    const res = submitUnderwriting(zpid);
    if (res.success) {
      router.push("/evaluation");
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
    <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6">
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

      {/* Tabs */}
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

      {/* Tab Panels */}
      <div className="pt-2">
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
          />
        )}
      </div>
    </div>
  );
}
