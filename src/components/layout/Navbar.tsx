"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnderwriting } from "@/lib/context";
import { CheckCircle2, ChevronDown, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    selectedPropertyZpid,
    properties,
    latestSubmission,
    saveMessage,
  } = useUnderwriting();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedProp = properties.find((p) => p.zpid === selectedPropertyZpid);

  const isDashboard = pathname === "/" || pathname === "/dashboard";
  const isWorkspace = pathname.startsWith("/workspace");
  const isEvaluation = pathname.startsWith("/evaluation");
  const isLeaderboard = pathname.startsWith("/leaderboard");

  const workspaceHref = selectedPropertyZpid
    ? `/workspace/${selectedPropertyZpid}`
    : "#";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-100/80">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between h-20">
          {/* Left Brand: Mint green circle emblem + STR Underwrite LabAnalyst */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#52A68B] text-white flex items-center justify-center font-bold text-base shadow-sm transition-transform group-hover:scale-105">
                S
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[#1E293B] group-hover:text-[#52A68B] transition-colors whitespace-nowrap">
                STR Underwrite LabAnalyst
              </span>
            </Link>
          </div>

          {/* Middle Navigation Links (Original options with links & logic) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {/* 1. Training Dashboard */}
            <Link
              id="nav-dashboard-tab"
              href="/"
              className="relative py-2 text-sm font-medium transition flex flex-col items-center group"
            >
              <span
                className={
                  isDashboard
                    ? "text-[#52A68B] font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }
              >
                Training Dashboard
              </span>
              {isDashboard && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#52A68B] mt-1 transition-all" />
              )}
            </Link>

            {/* 2. Workspace (Disabled if no property selected) */}
            {!selectedPropertyZpid ? (
              <div
                id="nav-workspace-tab"
                className="relative py-2 text-sm font-medium text-neutral-300 cursor-not-allowed flex flex-col items-center select-none group/nav"
              >
                <div className="flex items-center gap-1.5">
                  <span>Workspace</span>
                </div>
                {/* Instant Hover Tooltip (0ms delay) */}
                <div className="absolute top-full mt-2 hidden group-hover/nav:block bg-neutral-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                  Select a property below to enter workspace
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45" />
                </div>
              </div>
            ) : (
              <Link
                id="nav-workspace-tab"
                href={workspaceHref}
                className="relative py-2 text-sm font-medium transition flex flex-col items-center group cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      isWorkspace
                        ? "text-[#52A68B] font-semibold"
                        : "text-neutral-500 hover:text-neutral-800"
                    }
                  >
                    Workspace
                  </span>
                  {selectedProp && (
                    <span className="text-[11px] text-neutral-400 font-normal">
                      ({selectedProp.address_city})
                    </span>
                  )}
                </div>
                {isWorkspace && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52A68B] mt-1 transition-all" />
                )}
              </Link>
            )}

            {/* 3. Evaluation Results (Disabled if no submission yet) */}
            {!latestSubmission ? (
              <div
                id="nav-evaluation-tab"
                className="relative py-2 text-sm font-medium text-neutral-300 cursor-not-allowed flex flex-col items-center select-none group/nav"
              >
                <div className="flex items-center gap-1.5">
                  <span>Evaluation Results</span>
                </div>
                {/* Instant Hover Tooltip (0ms delay) */}
                <div className="absolute top-full mt-2 hidden group-hover/nav:block bg-neutral-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                  Submit an underwriting case to view evaluation results
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45" />
                </div>
              </div>
            ) : (
              <Link
                id="nav-evaluation-tab"
                href="/evaluation"
                className="relative py-2 text-sm font-medium transition flex flex-col items-center group cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      isEvaluation
                        ? "text-[#52A68B] font-semibold"
                        : "text-neutral-500 hover:text-neutral-800"
                    }
                  >
                    Evaluation Results
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-[#EBF5F1] text-[#52A68B] border border-[#52A68B]/30 shadow-2xs"
                  >
                    {latestSubmission.accuracy}
                  </span>
                </div>
                {isEvaluation && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52A68B] mt-1 transition-all" />
                )}
              </Link>
            )}

            {/* 4. Leaderboard */}
            <Link
              id="nav-leaderboard-tab"
              href="/leaderboard"
              className="relative py-2 text-sm font-medium transition flex flex-col items-center group"
            >
              <span
                className={
                  isLeaderboard
                    ? "text-[#52A68B] font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }
              >
                Leaderboard
              </span>
              {isLeaderboard && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#52A68B] mt-1 transition-all" />
              )}
            </Link>
          </nav>

          {/* Right Action: Auto-save status, Sign in, and Trainee Login */}
          <div className="flex items-center gap-5 sm:gap-6">
            {saveMessage && (
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-emerald-700 font-medium px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveMessage}</span>
              </div>
            )}

            {/* Login text button */}
            <button
              type="button"
              className="text-sm font-medium text-[#52A68B] hover:text-[#3f836d] transition cursor-pointer"
            >
              Login
            </button>

            {/* Signup button */}
            <button
              type="button"
              className="bg-[#52A68B] hover:bg-[#438a72] text-white px-6 sm:px-7 py-2.5 rounded-md text-sm font-medium transition shadow-sm hover:shadow cursor-pointer"
            >
              Sign up
            </button>

            {/* Mobile hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-100 py-4 px-2 space-y-2 animate-fadeIn">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-[#EBF5F1] hover:text-[#52A68B]"
            >
              Training Dashboard
            </Link>
            {!selectedPropertyZpid ? (
              <div
                title="Select a property below to enter workspace"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 cursor-not-allowed select-none"
              >
                Workspace
              </div>
            ) : (
              <Link
                href={workspaceHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-[#EBF5F1] hover:text-[#52A68B]"
              >
                Workspace {selectedProp && `(${selectedProp.address_city})`}
              </Link>
            )}

            {!latestSubmission ? (
              <div
                title="Complete and submit an underwriting case to view evaluation results"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-300 cursor-not-allowed select-none"
              >
                Evaluation Results
              </div>
            ) : (
              <Link
                href="/evaluation"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-[#EBF5F1] hover:text-[#52A68B]"
              >
                <span>Evaluation Results</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono bg-[#EBF5F1] text-[#52A68B] border border-[#52A68B]/30">
                  {latestSubmission.accuracy}
                </span>
              </Link>
            )}
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-[#EBF5F1] hover:text-[#52A68B]"
            >
              Leaderboard
            </Link>

            <div className="pt-3 border-t border-neutral-100 flex items-center gap-3 px-1">
              <button
                type="button"
                className="flex-1 py-2 text-center text-sm font-medium text-[#52A68B] border border-[#52A68B] rounded-md"
              >
                Login
              </button>
              <button
                type="button"
                className="flex-1 py-2 text-center text-sm font-medium text-white bg-[#52A68B] rounded-md"
              >
                Sign up
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

