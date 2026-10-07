import React from "react";

export const WorkspaceSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-card">
        {/* Top actions bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/50">
          <div className="w-32 h-4 rounded-md skeleton-wave" />
          <div className="flex items-center gap-2">
            <div className="w-36 h-7 rounded-lg skeleton-wave" />
            <div className="w-8 h-7 rounded-lg skeleton-wave" />
            <div className="w-24 h-7 rounded-lg skeleton-wave" />
          </div>
        </div>

        {/* Main property banner */}
        <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-56 h-36 rounded-xl skeleton-wave flex-shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-2">
              <div className="w-20 h-5 rounded-full skeleton-wave" />
              <div className="w-28 h-5 rounded-full skeleton-wave" />
            </div>
            <div className="w-3/4 h-6 rounded-md skeleton-wave" />
            <div className="w-1/2 h-4 rounded-md skeleton-wave" />
            <div className="flex gap-4 pt-2 border-t border-zinc-100">
              <div className="w-20 h-4 rounded skeleton-wave" />
              <div className="w-20 h-4 rounded skeleton-wave" />
              <div className="w-20 h-4 rounded skeleton-wave" />
              <div className="w-24 h-4 rounded skeleton-wave" />
            </div>
          </div>
          <div className="w-full md:w-44 text-right space-y-2">
            <div className="w-16 h-3 rounded skeleton-wave ml-auto" />
            <div className="w-28 h-7 rounded-md skeleton-wave ml-auto" />
          </div>
        </div>
      </div>

      {/* Tabs Bar Skeleton */}
      <div className="flex gap-2 border-b border-zinc-200 pb-2">
        <div className="w-36 h-10 rounded-xl skeleton-wave" />
        <div className="w-36 h-10 rounded-xl skeleton-wave" />
        <div className="w-36 h-10 rounded-xl skeleton-wave" />
        <div className="w-36 h-10 rounded-xl skeleton-wave" />
      </div>

      {/* Content Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <div className="w-48 h-5 rounded skeleton-wave" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 rounded-xl skeleton-wave" />
              <div className="h-12 rounded-xl skeleton-wave" />
              <div className="h-12 rounded-xl skeleton-wave" />
              <div className="h-12 rounded-xl skeleton-wave" />
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <div className="w-56 h-5 rounded skeleton-wave" />
            <div className="space-y-3">
              <div className="h-10 rounded-lg skeleton-wave" />
              <div className="h-10 rounded-lg skeleton-wave" />
              <div className="h-10 rounded-lg skeleton-wave" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
            <div className="w-36 h-5 rounded skeleton-wave" />
            <div className="space-y-3">
              <div className="h-8 rounded skeleton-wave" />
              <div className="h-8 rounded skeleton-wave" />
              <div className="h-8 rounded skeleton-wave" />
              <div className="h-12 rounded-xl skeleton-wave" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
