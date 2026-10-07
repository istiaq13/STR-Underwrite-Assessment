"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUnderwriting } from "@/lib/context";
import { EvaluationView } from "@/components/evaluation/EvaluationView";

export default function EvaluationPage() {
  const router = useRouter();
  const { selectProperty } = useUnderwriting();

  const handleBackToDashboard = () => {
    router.push("/");
  };

  const handleReattempt = (zpid: string) => {
    selectProperty(zpid);
    router.push(`/workspace/${zpid}`);
  };

  const handleOpenLeaderboard = () => {
    router.push("/leaderboard");
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8">
      <EvaluationView
        onBackToDashboard={handleBackToDashboard}
        onReattempt={handleReattempt}
        onOpenLeaderboard={handleOpenLeaderboard}
      />
    </div>
  );
}
