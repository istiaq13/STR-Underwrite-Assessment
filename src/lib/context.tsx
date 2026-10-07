"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  LeaderboardEntry,
  Market,
  Property,
  SubmissionRecord,
  UnderwritingData,
} from "@/types";
import {
  INITIAL_LEADERBOARD,
  INITIAL_MARKETS,
  INITIAL_PROPERTIES,
  REFERENCE_UNDERWRITINGS,
  createDraftUnderwriting,
} from "./mockData";
import { calculateUnderwriting, scoreSubmission } from "./calculations";

interface UnderwritingContextType {
  markets: Market[];
  properties: Property[];
  submissions: SubmissionRecord[];
  leaderboard: LeaderboardEntry[];
  selectedPropertyZpid: string | null;
  activeDraft: UnderwritingData | null;
  latestSubmission: SubmissionRecord | null;
  isSaving: boolean;
  saveMessage: string | null;

  // Actions
  selectProperty: (zpid: string) => void;
  clearSelectedProperty: () => void;
  updateDraft: (updater: (prev: UnderwritingData) => UnderwritingData) => void;
  saveDraft: () => void;
  resetDraft: (zpid: string) => void;
  prefillFromReference: (zpid: string) => void;
  submitUnderwriting: (zpid: string) => { success: boolean; errors?: string[]; submission?: SubmissionRecord };
  getSubmissionById: (id: string) => SubmissionRecord | undefined;
  setLatestSubmission: (sub: SubmissionRecord | null) => void;
}

const UnderwritingContext = createContext<UnderwritingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROPERTIES: "str_training_properties_v1",
  DRAFTS: "str_training_drafts_v1",
  SUBMISSIONS: "str_training_submissions_v1",
  LEADERBOARD: "str_training_leaderboard_v1",
};

export const UnderwritingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets] = useState<Market[]>(INITIAL_MARKETS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [drafts, setDrafts] = useState<Record<string, UnderwritingData>>({});
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  const [selectedPropertyZpid, setSelectedPropertyZpid] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<UnderwritingData | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<SubmissionRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage or mock data
  useEffect(() => {
    try {
      const storedProps = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      const storedDrafts = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      const storedLeader = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);

      if (storedProps) setProperties(JSON.parse(storedProps));
      if (storedDrafts) setDrafts(JSON.parse(storedDrafts));
      if (storedSubs) setSubmissions(JSON.parse(storedSubs));
      if (storedLeader) setLeaderboard(JSON.parse(storedLeader));
    } catch (e) {
      console.error("Failed to load from storage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage when updated
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [properties, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [drafts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [submissions, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [leaderboard, isHydrated]);

  // Handle property selection and loading or initializing draft
  const selectProperty = (zpid: string) => {
    setSelectedPropertyZpid(zpid);
    const existingProperty = properties.find((p) => p.zpid === zpid);
    if (!existingProperty) return;

    if (drafts[zpid]) {
      const loaded = drafts[zpid];
      // Recalculate outputs to ensure formulas are up-to-date
      const recalculated = {
        ...loaded,
        calculations: calculateUnderwriting(
          loaded.purchase_details,
          loaded.forecasted_revenue,
          loaded.taxes,
          loaded.optimization_items,
          loaded.operating_expenses
        ),
      };
      setActiveDraft(recalculated);
    } else {
      const newDraft = createDraftUnderwriting(existingProperty);
      setActiveDraft(newDraft);
      setDrafts((prev) => ({ ...prev, [zpid]: newDraft }));
    }
  };

  const clearSelectedProperty = () => {
    setSelectedPropertyZpid(null);
    setActiveDraft(null);
  };

  const updateDraft = (updater: (prev: UnderwritingData) => UnderwritingData) => {
    if (!activeDraft) return;
    const updated = updater(activeDraft);

    // Recalculate outputs on every change
    const recalculated: UnderwritingData = {
      ...updated,
      updated_at: new Date().toISOString(),
      calculations: calculateUnderwriting(
        updated.purchase_details,
        updated.forecasted_revenue,
        updated.taxes,
        updated.optimization_items,
        updated.operating_expenses
      ),
    };

    setActiveDraft(recalculated);

    // Also update in drafts map
    setDrafts((prev) => ({
      ...prev,
      [recalculated.zpid]: recalculated,
    }));

    // Update property status to 'in_progress' if currently 'not_started'
    setProperties((prev) =>
      prev.map((p) => {
        if (p.zpid === recalculated.zpid && p.status === "not_started") {
          return {
            ...p,
            status: "in_progress",
            active_underwriting_id: recalculated.id,
          };
        }
        return p;
      })
    );
  };

  const saveDraft = () => {
    if (!activeDraft) return;
    setIsSaving(true);
    setSaveMessage("Saving draft...");

    setTimeout(() => {
      setDrafts((prev) => ({
        ...prev,
        [activeDraft.zpid]: activeDraft,
      }));

      setProperties((prev) =>
        prev.map((p) => {
          if (p.zpid === activeDraft.zpid) {
            return {
              ...p,
              status: p.status === "submitted" ? "submitted" : "in_progress",
              active_underwriting_id: activeDraft.id,
            };
          }
          return p;
        })
      );

      setIsSaving(false);
      setSaveMessage("Draft saved successfully");
      setTimeout(() => setSaveMessage(null), 2500);
    }, 350);
  };

  const resetDraft = (zpid: string) => {
    const property = properties.find((p) => p.zpid === zpid);
    if (!property) return;
    const freshDraft = createDraftUnderwriting(property);
    setActiveDraft(freshDraft);
    setDrafts((prev) => ({
      ...prev,
      [zpid]: freshDraft,
    }));
  };

  const prefillFromReference = (zpid: string) => {
    const reference = REFERENCE_UNDERWRITINGS[zpid];
    if (!reference) return;

    const populatedDraft: UnderwritingData = {
      ...reference,
      id: `draft-${zpid}`,
      updated_at: new Date().toISOString(),
      calculations: calculateUnderwriting(
        reference.purchase_details,
        reference.forecasted_revenue,
        reference.taxes,
        reference.optimization_items,
        reference.operating_expenses
      ),
    };

    setActiveDraft(populatedDraft);
    setDrafts((prev) => ({
      ...prev,
      [zpid]: populatedDraft,
    }));
  };

  const submitUnderwriting = (zpid: string) => {
    const draft = activeDraft && activeDraft.zpid === zpid ? activeDraft : drafts[zpid];
    const property = properties.find((p) => p.zpid === zpid);
    const reference = REFERENCE_UNDERWRITINGS[zpid];

    if (!draft || !property || !reference) {
      return { success: false, errors: ["Underwriting or property record not found."] };
    }

    // Validation checks
    const errors: string[] = [];
    if (!draft.purchase_details.purchase_price || draft.purchase_details.purchase_price <= 0) {
      errors.push("Purchase price must be greater than $0");
    }
    if (draft.purchase_details.down_payment_pct < 0 || draft.purchase_details.down_payment_pct > 1) {
      errors.push("Down payment must be between 0% and 100%");
    }
    if (draft.purchase_details.interest_rate <= 0) {
      errors.push("Interest rate must be greater than 0%");
    }
    if (!draft.forecasted_revenue.mid_revenue || draft.forecasted_revenue.mid_revenue <= 0) {
      errors.push("Mid revenue forecast is required for analyst scoring");
    }
    if (draft.forecasted_revenue.low_revenue < 0 || draft.forecasted_revenue.high_revenue < 0) {
      errors.push("Revenue forecasts cannot be negative");
    }
    if (
      draft.forecasted_revenue.low_revenue > draft.forecasted_revenue.mid_revenue ||
      draft.forecasted_revenue.mid_revenue > draft.forecasted_revenue.high_revenue
    ) {
      errors.push("Revenue forecast hierarchy must follow: Low ≤ Mid ≤ High");
    }
    if (draft.calculations && draft.calculations.total_oop <= 0) {
      errors.push("Total Out of Pocket cash must be positive");
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Grade against reference mid revenue
    const candidateMid = draft.forecasted_revenue.mid_revenue;
    const referenceMid = reference.forecasted_revenue.mid_revenue;
    const breakdown = scoreSubmission(candidateMid, referenceMid);

    const submissionRecord: SubmissionRecord = {
      id: `sub-${Date.now()}`,
      underwriting_id: draft.id,
      zpid: draft.zpid,
      property_address: property.address,
      rating: breakdown.rating,
      accuracy: breakdown.accuracy,
      breakdown,
      submitted_at: new Date().toISOString(),
      trainee_underwriting: JSON.parse(JSON.stringify(draft)),
      reference_underwriting: JSON.parse(JSON.stringify(reference)),
    };

    // Update submissions history
    setSubmissions((prev) => [submissionRecord, ...prev]);
    setLatestSubmission(submissionRecord);

    // Update property accuracy and status
    setProperties((prev) =>
      prev.map((p) => {
        if (p.zpid === zpid) {
          const newAttempts = p.attempts + 1;
          const bestAcc = p.best_accuracy !== null
            ? Math.max(p.best_accuracy, breakdown.accuracy)
            : breakdown.accuracy;
          const bestRate = bestAcc === 100 ? "best" : bestAcc === 70 ? "medium" : "low";

          return {
            ...p,
            status: "submitted",
            attempts: newAttempts,
            latest_accuracy: breakdown.accuracy,
            latest_rating: breakdown.rating,
            best_accuracy: bestAcc,
            best_rating: bestRate,
            latest_submission_id: submissionRecord.id,
          };
        }
        return p;
      })
    );

    // Update Leaderboard current user entry
    setLeaderboard((prev) => {
      const userIndex = prev.findIndex((entry) => entry.is_current_user);
      if (userIndex === -1) return prev;

      const user = prev[userIndex];
      const completedCount = user.completed_deals + 1;
      const bestScore = Math.max(user.best_score, breakdown.accuracy);
      const newAvg = Number(
        (((user.average_accuracy * user.completed_deals) + breakdown.accuracy) / completedCount).toFixed(1)
      );
      const bestRatingCount = breakdown.rating === "best" ? user.best_rating_count + 1 : user.best_rating_count;
      const streak = breakdown.rating === "best" ? user.streak + 1 : 0;

      const updatedUser: LeaderboardEntry = {
        ...user,
        completed_deals: completedCount,
        best_score: bestScore,
        average_accuracy: newAvg,
        best_rating_count: bestRatingCount,
        streak,
      };

      const updatedList = [...prev];
      updatedList[userIndex] = updatedUser;

      // Sort by average_accuracy desc, then best_score desc
      updatedList.sort((a, b) => b.average_accuracy - a.average_accuracy || b.best_score - a.best_score);

      // Re-assign ranks
      return updatedList.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    });

    return { success: true, submission: submissionRecord };
  };

  const getSubmissionById = (id: string) => {
    return submissions.find((s) => s.id === id);
  };

  return (
    <UnderwritingContext.Provider
      value={{
        markets,
        properties,
        submissions,
        leaderboard,
        selectedPropertyZpid,
        activeDraft,
        latestSubmission,
        isSaving,
        saveMessage,
        selectProperty,
        clearSelectedProperty,
        updateDraft,
        saveDraft,
        resetDraft,
        prefillFromReference,
        submitUnderwriting,
        getSubmissionById,
        setLatestSubmission,
      }}
    >
      {children}
    </UnderwritingContext.Provider>
  );
};

export const useUnderwriting = () => {
  const context = useContext(UnderwritingContext);
  if (!context) {
    throw new Error("useUnderwriting must be used within an UnderwritingProvider");
  }
  return context;
};
