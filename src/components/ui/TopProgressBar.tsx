"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUnderwriting } from "@/lib/context";

export const TopProgressBar: React.FC = () => {
  const { isOpeningProperty, finishOpeningProperty } = useUnderwriting();
  const pathname = usePathname();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "finishing">("idle");
  const [overlayVisible, setOverlayVisible] = useState(false);

  const prevPathnameRef = useRef(pathname);

  // When pathname changes while opening a property, conclude the loading
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (isOpeningProperty) {
        const timer = setTimeout(() => {
          finishOpeningProperty();
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isOpeningProperty, finishOpeningProperty]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let safetyTimer: NodeJS.Timeout | null = null;
    let finishTimer1: NodeJS.Timeout | null = null;
    let finishTimer2: NodeJS.Timeout | null = null;

    if (isOpeningProperty) {
      setStatus("loading");
      setOverlayVisible(true);
      setProgress(15);

      // Smooth trickle progress from 15% up to ~88%
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return prev;
          if (prev < 35) return prev + Math.floor(Math.random() * 8) + 6;
          if (prev < 65) return prev + Math.floor(Math.random() * 5) + 3;
          if (prev < 80) return prev + Math.floor(Math.random() * 3) + 1.5;
          return prev + 0.6;
        });
      }, 120);

      // Safety timeout: auto-finish if navigation takes longer than 5s
      safetyTimer = setTimeout(() => {
        finishOpeningProperty();
      }, 5000);
    } else {
      // Completed / Next page opened!
      setProgress((prev) => (prev > 0 ? 100 : 0));

      finishTimer1 = setTimeout(() => {
        setOverlayVisible(false);
      }, 220);

      finishTimer2 = setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 480);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (finishTimer1) clearTimeout(finishTimer1);
      if (finishTimer2) clearTimeout(finishTimer2);
    };
  }, [isOpeningProperty, finishOpeningProperty]);

  if (status === "idle" && !overlayVisible) {
    return null;
  }

  return (
    <>
      {/* Background dulling overlay: softens, dims and slightly desaturates background while loading */}
      <div
        id="property-opening-overlay"
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] transition-opacity duration-300 pointer-events-none ${
          overlayVisible
            ? "opacity-100 bg-neutral-900/18 backdrop-blur-[1.5px] backdrop-grayscale-[25%]"
            : "opacity-0"
        }`}
      />

      {/* Thin brand-green top progress bar fixed at the very top */}
      <div
        id="top-progress-bar-container"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none transition-opacity duration-200 ${
          overlayVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-full bg-[#52A68B] shadow-[0_0_12px_rgba(82,166,139,0.95),0_0_4px_rgba(82,166,139,0.7)] transition-all duration-200 ease-out relative"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Subtle glowing shimmer at leading edge */}
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/25 to-white/70 shadow-[0_0_8px_#52A68B]" />
        </div>
      </div>
    </>
  );
};
