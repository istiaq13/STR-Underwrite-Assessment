"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8">
      <LeaderboardView
        onBackToDashboard={() => router.push("/")}
      />
    </div>
  );
}
