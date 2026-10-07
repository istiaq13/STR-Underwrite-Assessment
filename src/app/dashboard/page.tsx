"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUnderwriting } from "@/lib/context";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  const router = useRouter();
  const { selectProperty } = useUnderwriting();

  const handleSelectProperty = (zpid: string) => {
    selectProperty(zpid);
    router.push(`/workspace/${zpid}`);
  };

  return (
    <DashboardView
      onSelectProperty={handleSelectProperty}
      onOpenLeaderboard={() => router.push("/leaderboard")}
    />
  );
}
