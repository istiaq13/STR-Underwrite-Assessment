"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUnderwriting } from "@/lib/context";
import { EvaluationView } from "@/components/evaluation/EvaluationView";

function EvaluationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const {
    latestSubmission,
    submissions,
    isLoadingDashboard,
    loadSubmission,
    setLatestSubmission,
    selectProperty,
    startOpeningProperty,
    finishOpeningProperty,
  } = useUnderwriting();

  const [isLoading, setIsLoading] = useState(false);
  const loadedIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (submissionId) {
      if (loadedIdRef.current !== submissionId) {
        loadedIdRef.current = submissionId;
        setIsLoading(true);
        loadSubmission(submissionId)
          .finally(() => {
            setIsLoading(false);
            finishOpeningProperty();
          });
      }
    } else {
      if (!latestSubmission && submissions.length > 0) {
        setLatestSubmission(submissions[0]);
      }
      finishOpeningProperty();
    }
  }, [submissionId, submissions, loadSubmission, setLatestSubmission, finishOpeningProperty]);

  const handleBackToDashboard = () => {
    router.push("/");
  };

  const handleReattempt = (zpid: string) => {
    startOpeningProperty(zpid);
    selectProperty(zpid);
    router.push(`/workspace/${zpid}`);
  };

  const handleOpenLeaderboard = () => {
    router.push("/leaderboard");
  };

  if (isLoading || (isLoadingDashboard && !latestSubmission)) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-2xl skeleton-wave" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 rounded-2xl skeleton-wave" />
          <div className="h-32 rounded-2xl skeleton-wave" />
          <div className="h-32 rounded-2xl skeleton-wave" />
        </div>
        <div className="h-64 rounded-2xl skeleton-wave" />
      </div>
    );
  }

  return (
    <EvaluationView
      onBackToDashboard={handleBackToDashboard}
      onReattempt={handleReattempt}
      onOpenLeaderboard={handleOpenLeaderboard}
    />
  );
}

export default function EvaluationPage() {
  return (
    <div className="max-w-[1440px] w-full mx-auto px-3.5 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-4 sm:py-6 lg:py-8">
      <Suspense fallback={<div className="h-64 rounded-2xl skeleton-wave" />}>
        <EvaluationContent />
      </Suspense>
    </div>
  );
}
