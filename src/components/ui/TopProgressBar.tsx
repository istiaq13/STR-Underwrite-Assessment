"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUnderwriting } from "@/lib/context";

const TopProgressBarInner: React.FC = () => {
  const { isOpeningProperty, finishOpeningProperty } = useUnderwriting();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const prevPathRef = useRef(`${pathname}?${searchParams?.toString() || ""}`);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Starts the progress bar and begins trickling
  const startProgress = useCallback(() => {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setIsFinishing(false);
    setVisible(true);
    setProgress((prev) => (prev > 0 ? prev : 18));

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        if (prev < 40) return prev + Math.floor(Math.random() * 8) + 6;
        if (prev < 70) return prev + Math.floor(Math.random() * 5) + 3;
        if (prev < 85) return prev + Math.floor(Math.random() * 2) + 1.2;
        return prev + 0.4;
      });
    }, 100);

    // Safety timeout in case navigation takes longer than 6s
    safetyTimeoutRef.current = setTimeout(() => {
      completeProgress();
    }, 6000);
  }, []);

  // Completes the progress bar: shoots to 100% and smoothly fades out
  const completeProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    setIsFinishing(true);
    setProgress(100);

    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      finishOpeningProperty();
      finishTimeoutRef.current = setTimeout(() => {
        setProgress(0);
        setIsFinishing(false);
      }, 300);
    }, 220);
  }, [finishOpeningProperty]);

  // Trigger when context's isOpeningProperty changes
  useEffect(() => {
    if (isOpeningProperty) {
      startProgress();
    }
  }, [isOpeningProperty, startProgress]);

  // When pathname or searchParams change (navigation finished!), complete the progress bar
  useEffect(() => {
    const currentPath = `${pathname}?${searchParams?.toString() || ""}`;
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;
      completeProgress();
    }
  }, [pathname, searchParams, completeProgress]);

  // Intercept all route navigation triggers (clicks, popstate, pushState, replaceState)
  useEffect(() => {
    // 1. Browser Back / Forward buttons (popstate)
    const handlePopState = () => {
      startProgress();
    };

    // 2. Global clicks on links leading to different internal pages
    const handleLinkClick = (event: MouseEvent) => {
      // Ignore modified clicks (cmd, ctrl, shift, middle click)
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Check if same origin and actually navigating to a different path or query
        if (targetUrl.origin === currentUrl.origin) {
          if (
            targetUrl.pathname !== currentUrl.pathname ||
            targetUrl.search !== currentUrl.search
          ) {
            startProgress();
          }
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    // 3. Programmatic router.push and router.replace via history monkey-patching
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const url = args[2];
      if (url && typeof url === "string") {
        try {
          const targetUrl = new URL(url, window.location.href);
          const currentUrl = new URL(window.location.href);
          if (
            targetUrl.pathname !== currentUrl.pathname ||
            targetUrl.search !== currentUrl.search
          ) {
            startProgress();
          }
        } catch {
          startProgress();
        }
      }
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick, true);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;

      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [startProgress]);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <>
      {/* Background dulling overlay: dims and subtly blurs background during any route transition */}
      <div
        id="route-transition-overlay"
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] transition-opacity duration-300 pointer-events-none ${
          visible && !isFinishing
            ? "opacity-100 bg-neutral-900/18 backdrop-blur-[1.5px] backdrop-grayscale-[20%]"
            : "opacity-0"
        }`}
      />

      {/* Top brand-green progress bar fixed at the very top */}
      <div
        id="top-progress-bar-container"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-full bg-[#52A68B] shadow-[0_0_12px_rgba(82,166,139,0.95),0_0_4px_rgba(82,166,139,0.7)] transition-all duration-200 ease-out relative"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Subtle glowing shimmer at leading edge */}
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-white/80 shadow-[0_0_8px_#52A68B]" />
        </div>
      </div>
    </>
  );
};

export const TopProgressBar: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <TopProgressBarInner />
    </Suspense>
  );
};
