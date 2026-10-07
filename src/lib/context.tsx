"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DashboardSummary,
  LeaderboardEntry,
  Market,
  Property,
  SubmissionRecord,
  UnderwritingData,
} from "@/types";
import { INITIAL_LEADERBOARD } from "@/config/leaderboard";
import { calculateUnderwriting } from "./calculations";
import {
  fetchDashboard,
  fetchMarkets,
  createUnderwriting,
  fetchUnderwriting,
  saveUnderwriting,
  submitUnderwritingApi,
  fetchSubmissions,
  fetchSubmission,
  fetchPropertyByZpid,
} from "./api";
import { validateUnderwritingDraft } from "./schemas";

interface UnderwritingContextType {
  markets: Market[];
  properties: Property[];
  dashboardSummary: DashboardSummary | null;
  isLoadingDashboard: boolean;
  isLoadingDraft: boolean;
  dashboardError: string | null;
  refreshDashboard: () => Promise<void>;
  submissions: SubmissionRecord[];
  leaderboard: LeaderboardEntry[];
  selectedPropertyZpid: string | null;
  activeDraft: UnderwritingData | null;
  latestSubmission: SubmissionRecord | null;
  isSaving: boolean;
  saveMessage: string | null;

  // Navigation & Loading Progress
  isOpeningProperty: boolean;
  setIsOpeningProperty: (v: boolean) => void;
  startOpeningProperty: (zpid?: string) => void;
  finishOpeningProperty: () => void;

  // Actions
  selectProperty: (zpid: string) => Promise<void>;
  clearSelectedProperty: () => void;
  updateDraft: (updater: (prev: UnderwritingData) => UnderwritingData) => void;
  saveDraft: () => Promise<void>;
  resetDraft: (zpid: string) => Promise<void>;
  prefillFromReference: (zpid: string) => Promise<void>;
  submitUnderwriting: (zpid: string) => Promise<{ success: boolean; errors?: string[]; submission?: SubmissionRecord }>;
  getSubmissionById: (id: string) => SubmissionRecord | undefined;
  loadSubmission: (id: string | number) => Promise<SubmissionRecord | undefined>;
  setLatestSubmission: (sub: SubmissionRecord | null) => void;
}

const UnderwritingContext = createContext<UnderwritingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LEADERBOARD: "str_training_leaderboard_v1",
};

export const UnderwritingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [drafts, setDrafts] = useState<Record<string, UnderwritingData>>({});
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  const [selectedPropertyZpid, setSelectedPropertyZpid] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<UnderwritingData | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
  const [isOpeningProperty, setIsOpeningProperty] = useState<boolean>(false);
  const [latestSubmission, setLatestSubmission] = useState<SubmissionRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const startOpeningProperty = useCallback((zpid?: string) => {
    setIsOpeningProperty(true);
    if (zpid) {
      setSelectedPropertyZpid(zpid);
    }
  }, []);

  const finishOpeningProperty = useCallback(() => {
    setIsOpeningProperty(false);
  }, []);

  // Dashboard API state
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Calls GET /api/dashboard, GET /api/markets, and GET /api/submissions to fetch live data from backend
  const refreshDashboard = useCallback(async () => {
    setIsLoadingDashboard(true);
    setDashboardError(null);
    try {
      const [dashData, marketList, subsList] = await Promise.all([
        fetchDashboard(),
        fetchMarkets().catch((err) => {
          console.warn("Could not fetch /api/markets:", err);
          return [] as Market[];
        }),
        fetchSubmissions().catch((err) => {
          console.warn("Could not fetch /api/submissions:", err);
          return [] as SubmissionRecord[];
        }),
      ]);
      setDashboardSummary(dashData.summary);
      setProperties(dashData.properties);
      if (marketList && marketList.length > 0) {
        setMarkets(marketList);
      }
      if (subsList && subsList.length > 0) {
        setSubmissions(subsList);
        setLatestSubmission((prev) => prev || subsList[0]);

        // Compute current user's live leaderboard score from PostgreSQL submissions
        setLeaderboard((prev) => {
          const userIndex = prev.findIndex((entry) => entry.is_current_user);
          if (userIndex === -1) return prev;
          const user = prev[userIndex];
          const completedCount = subsList.length;
          const bestScore = Math.max(...subsList.map((s) => s.accuracy), 0);
          const totalAccuracy = subsList.reduce((acc, s) => acc + s.accuracy, 0);
          const avgAccuracy = Number((totalAccuracy / completedCount).toFixed(1));
          const bestRatingCount = subsList.filter((s) => s.rating === "best").length;

          const updatedUser: LeaderboardEntry = {
            ...user,
            completed_deals: completedCount,
            best_score: bestScore,
            average_accuracy: avgAccuracy,
            best_rating_count: bestRatingCount,
            streak: subsList[0]?.rating === "best" ? 1 : 0,
          };

          const updatedList = [...prev];
          updatedList[userIndex] = updatedUser;
          updatedList.sort((a, b) => b.average_accuracy - a.average_accuracy || b.best_score - a.best_score);
          return updatedList.map((entry, index) => ({ ...entry, rank: index + 1 }));
        });
      }
    } catch (err: any) {
      console.warn("Backend API not reachable for /api/dashboard:", err);
      setDashboardError(err?.message || "Failed to load dashboard from backend");
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  // Fetch dashboard from FastAPI backend on mount
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Initialize leaderboard from localStorage
  useEffect(() => {
    try {
      const storedLeader = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (storedLeader) setLeaderboard(JSON.parse(storedLeader));
    } catch (e) {
      console.error("Failed to load from storage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    } catch (e) {
      console.error("Storage error", e);
    }
  }, [leaderboard, isHydrated]);

  // Handle property selection and loading or initializing draft via backend API
  const selectProperty = useCallback(async (zpid: string) => {
    setSelectedPropertyZpid(zpid);
    setIsOpeningProperty(true);

    // If already in memory and has a valid ID, use it with fresh calculations
    if (drafts[zpid] && !drafts[zpid].id.startsWith("draft-")) {
      const loaded = drafts[zpid];
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
      return;
    }

    const existingProperty = properties.find((p) => p.zpid === zpid);
    setIsLoadingDraft(true);

    try {
      // 1. Fetch live property specs from GET /api/properties/{zpid}
      try {
        const freshProp = await fetchPropertyByZpid(zpid);
        setProperties((prev) =>
          prev.map((p) =>
            p.zpid === zpid
              ? {
                  ...p,
                  price: freshProp.price || p.price,
                  beds: freshProp.beds ?? p.beds,
                  baths: freshProp.baths ?? p.baths,
                  area: freshProp.area ?? p.area,
                  detail_url: freshProp.detail_url || p.detail_url,
                  img_src: freshProp.img_src || p.img_src,
                  address: freshProp.address || p.address,
                }
              : p
          )
        );
      } catch (propErr) {
        console.warn(`Could not refresh property details via GET /api/properties/${zpid}:`, propErr);
      }

      let draftData: UnderwritingData;

      // If this property has an existing active_underwriting_id in PostgreSQL, fetch it
      if (existingProperty?.active_underwriting_id) {
        try {
          draftData = await fetchUnderwriting(existingProperty.active_underwriting_id);
        } catch (fetchErr) {
          console.warn(`Could not fetch draft ID ${existingProperty.active_underwriting_id}, creating new via POST /api/underwritings:`, fetchErr);
          draftData = await createUnderwriting(zpid);
        }
      } else {
        // Call POST /api/underwritings to initialize a real draft in PostgreSQL
        draftData = await createUnderwriting(zpid);
      }

      setActiveDraft(draftData);
      setDrafts((prev) => ({ ...prev, [zpid]: draftData }));

      // Update property status in state to in_progress with active_underwriting_id
      setProperties((prev) =>
        prev.map((p) =>
          p.zpid === zpid
            ? {
                ...p,
                status: p.status === "submitted" ? "submitted" : "in_progress",
                active_underwriting_id: draftData.id,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to initialize underwriting via API:", err);
    } finally {
      setIsLoadingDraft(false);
    }
  }, [drafts, properties]);

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

  const saveDraft = useCallback(async () => {
    if (!activeDraft || isSaving) return;
    setIsSaving(true);
    setSaveMessage("Saving draft...");

    try {
      // Persist draft updates to PostgreSQL via PUT /api/underwritings/{id}
      const savedDraft = await saveUnderwriting(activeDraft.id, activeDraft);
      setActiveDraft(savedDraft);
      setDrafts((prev) => ({
        ...prev,
        [savedDraft.zpid]: savedDraft,
      }));

      setProperties((prev) =>
        prev.map((p) => {
          if (p.zpid === savedDraft.zpid) {
            return {
              ...p,
              status: p.status === "submitted" ? "submitted" : "in_progress",
              active_underwriting_id: savedDraft.id,
            };
          }
          return p;
        })
      );

      setSaveMessage("Draft saved successfully");
    } catch (err: any) {
      console.error("Failed to save draft to backend:", err);
      setSaveMessage(err?.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2500);
    }
  }, [activeDraft]);

  const resetDraft = useCallback(async (zpid: string) => {
    setIsLoadingDraft(true);
    try {
      // Re-initialize a fresh draft from PostgreSQL
      const freshDraft = await createUnderwriting(zpid);
      setActiveDraft(freshDraft);
      setDrafts((prev) => ({
        ...prev,
        [zpid]: freshDraft,
      }));
      setProperties((prev) =>
        prev.map((p) =>
          p.zpid === zpid
            ? {
                ...p,
                status: "in_progress",
                active_underwriting_id: freshDraft.id,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to reset draft via API:", err);
    } finally {
      setIsLoadingDraft(false);
    }
  }, []);

  // Map of zpid to backend reference underwriting IDs in PostgreSQL (IDs 1 through 6)
  const ZPID_TO_REFERENCE_ID: Record<string, number> = {
    "41234567": 1,
    "52345678": 2,
    "63456789": 3,
    "74567890": 4,
    "85678901": 5,
    "96789012": 6,
  };

  const prefillFromReference = async (zpid: string) => {
    const refId = ZPID_TO_REFERENCE_ID[zpid];
    if (!refId) return;

    try {
      setIsSaving(true);
      setSaveMessage("Loading benchmark reference from API...");

      // Fetch live reference underwriting directly from PostgreSQL via GET /api/underwritings/{refId}
      const liveRef = await fetchUnderwriting(refId);

      const populatedDraft: UnderwritingData = {
        ...liveRef,
        id: activeDraft?.id && !activeDraft.id.startsWith("draft-") ? activeDraft.id : `draft-${zpid}`,
        updated_at: new Date().toISOString(),
      };

      setActiveDraft(populatedDraft);
      setDrafts((prev) => ({
        ...prev,
        [zpid]: populatedDraft,
      }));

      // Automatically persist to PostgreSQL if active draft has a database ID
      if (activeDraft?.id && !activeDraft.id.startsWith("draft-")) {
        await saveUnderwriting(activeDraft.id, populatedDraft);
      }

      setSaveMessage("Analyst benchmark loaded from database");
    } catch (err: any) {
      console.error("Failed to load reference underwriting from API:", err);
      setSaveMessage("Failed to load benchmark from API");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2500);
    }
  };

  const submitUnderwriting = async (zpid: string) => {
    if (isSaving) {
      return { success: false, errors: ["A submission is already in progress. Please wait."] };
    }

    const draft = activeDraft && activeDraft.zpid === zpid ? activeDraft : drafts[zpid];
    const property = properties.find((p) => p.zpid === zpid);

    if (!draft || !property) {
      return { success: false, errors: ["Underwriting or property record not found."] };
    }

    // Comprehensive Zod schema validation
    const validation = validateUnderwritingDraft(draft);
    const errors: string[] = [...validation.errors];

    if (draft.calculations && draft.calculations.total_oop <= 0) {
      errors.push("Total Out of Pocket cash must be positive");
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    try {
      setIsSaving(true);
      setSaveMessage("Submitting & grading deal...");

      // Submit and grade deal via POST /api/underwritings/{id}/submit in PostgreSQL
      const result = await submitUnderwritingApi(draft.id, draft);

      // Update submissions history and latest submission
      setSubmissions((prev) => [result.submission, ...prev.filter((s) => s.id !== result.submission.id)]);
      setLatestSubmission(result.submission);

      // Update active draft and local drafts map
      setActiveDraft(result.underwriting);
      setDrafts((prev) => ({
        ...prev,
        [zpid]: result.underwriting,
      }));

      // Update dashboard properties & summary directly from backend response!
      setProperties(result.dashboard.properties);
      setDashboardSummary(result.dashboard.summary);

      // Update local Leaderboard entry for current user
      setLeaderboard((prev) => {
        const userIndex = prev.findIndex((entry) => entry.is_current_user);
        if (userIndex === -1) return prev;

        const user = prev[userIndex];
        const completedCount = user.completed_deals + 1;
        const bestScore = Math.max(user.best_score, result.submission.accuracy);
        const newAvg = Number(
          (((user.average_accuracy * user.completed_deals) + result.submission.accuracy) / completedCount).toFixed(1)
        );
        const bestRatingCount = result.submission.rating === "best" ? user.best_rating_count + 1 : user.best_rating_count;
        const streak = result.submission.rating === "best" ? user.streak + 1 : 0;

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
        updatedList.sort((a, b) => b.average_accuracy - a.average_accuracy || b.best_score - a.best_score);

        // Re-assign ranks
        return updatedList.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
      });

      setSaveMessage("Underwriting submitted successfully!");
      return { success: true, submission: result.submission };
    } catch (err: any) {
      console.error("Failed to submit underwriting via API:", err);
      return { success: false, errors: [err?.message || "Failed to submit underwriting to backend"] };
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 2500);
    }
  };

  const getSubmissionById = (id: string) => {
    return submissions.find((s) => s.id === id);
  };

  const loadSubmission = useCallback(async (id: string | number) => {
    const strId = String(id);
    const existing = submissions.find((s) => s.id === strId);
    if (existing) {
      setLatestSubmission(existing);
      return existing;
    }
    try {
      const fetched = await fetchSubmission(id);
      setSubmissions((prev) => [fetched, ...prev.filter((s) => s.id !== fetched.id)]);
      setLatestSubmission(fetched);
      return fetched;
    } catch (err) {
      console.error("Failed to fetch submission from backend:", err);
      return undefined;
    }
  }, [submissions]);

  return (
    <UnderwritingContext.Provider
      value={{
        markets,
        properties,
        dashboardSummary,
        isLoadingDashboard,
        isLoadingDraft,
        dashboardError,
        refreshDashboard,
        submissions,
        leaderboard,
        selectedPropertyZpid,
        activeDraft,
        latestSubmission,
        isSaving,
        saveMessage,
        isOpeningProperty,
        setIsOpeningProperty,
        startOpeningProperty,
        finishOpeningProperty,
        selectProperty,
        clearSelectedProperty,
        updateDraft,
        saveDraft,
        resetDraft,
        prefillFromReference,
        submitUnderwriting,
        getSubmissionById,
        loadSubmission,
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
