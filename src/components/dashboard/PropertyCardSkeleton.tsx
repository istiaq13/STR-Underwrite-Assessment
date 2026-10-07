import React from "react";

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-card flex flex-col justify-between">
      <div>
        {/* Image Placeholder with Wave */}
        <div className="relative aspect-[16/10] bg-slate-100 skeleton-wave overflow-hidden">
          {/* Top Left Badge Placeholder */}
          <div className="absolute top-3 left-3 w-28 h-5 rounded-full bg-white/70 backdrop-blur-sm" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Title & Price Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Street line */}
              <div className="h-4 w-3/4 rounded-md skeleton-wave" />
              {/* City, State line */}
              <div className="h-3 w-1/2 rounded-md skeleton-wave" />
            </div>
            {/* Price Tag */}
            <div className="w-20 h-6 rounded-md skeleton-wave" />
          </div>

          {/* Key Specs Row (3 blocks) */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-zinc-100">
            <div className="h-3.5 rounded skeleton-wave" />
            <div className="h-3.5 rounded skeleton-wave" />
            <div className="h-3.5 rounded skeleton-wave" />
          </div>

          {/* Performance & Status Row */}
          <div className="py-2.5 px-3 rounded-xl bg-neutral-50/90 border border-neutral-100 flex items-center justify-between gap-2 mt-1">
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-16 rounded skeleton-wave" />
              <div className="h-3.5 w-12 rounded skeleton-wave" />
            </div>
            <div className="h-4 w-16 rounded skeleton-wave" />
          </div>
        </div>
      </div>

      {/* Action Button Row */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
        <div className="w-full h-10 rounded-xl skeleton-wave" />
      </div>
    </div>
  );
};
