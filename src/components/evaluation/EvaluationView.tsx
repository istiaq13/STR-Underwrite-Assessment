"use client";

import React from "react";
import { useUnderwriting } from "@/lib/context";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { RatingBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  RotateCcw,
  Target,
  Award,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Calendar,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface EvaluationViewProps {
  onBackToDashboard: () => void;
  onReattempt: (zpid: string) => void;
  onOpenLeaderboard: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  onBackToDashboard,
  onReattempt,
  onOpenLeaderboard,
}) => {
  const { latestSubmission, submissions, setLatestSubmission } = useUnderwriting();
  const [visibleAttemptsCount, setVisibleAttemptsCount] = React.useState<number>(10);

  React.useEffect(() => {
    setVisibleAttemptsCount(10);
  }, [latestSubmission?.zpid]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.body.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      const anchor = document.getElementById("evaluation-top-anchor");
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleViewScorecard = (sub: (typeof submissions)[0]) => {
    setLatestSubmission(sub);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("id", String(sub.id));
        window.history.replaceState(null, "", url.toString());
      } catch {
        // ignore url errors
      }
    }
    scrollToTop();
  };

  if (!latestSubmission) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200/90 shadow-card p-8">
        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
          <Award className="w-6 h-6" />
        </div>
        <p className="text-base font-semibold text-zinc-800">No evaluation results found</p>
        <p className="text-xs text-zinc-500 mt-1">Please submit an underwriting to see your grade and score breakdown.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-[#52A68B] hover:bg-[#438a72] rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { breakdown, trainee_underwriting: trainee, reference_underwriting: ref } = latestSubmission;

  const traineeCalc = trainee.calculations;
  const refCalc = ref.calculations;

  // Calculate percentage position of trainee guess within spectrum [0.70 * ref, 1.30 * ref]
  const spectrumMin = breakdown.reference * 0.7;
  const spectrumMax = breakdown.reference * 1.3;
  const rawPosition = ((breakdown.candidate - spectrumMin) / (spectrumMax - spectrumMin)) * 100;
  const clampedPosition = Math.min(Math.max(rawPosition, 8), 92);

  const propertySubmissions = submissions.filter((s) => s.zpid === latestSubmission.zpid);
  const visibleSubmissions = propertySubmissions.slice(0, visibleAttemptsCount);
  const hasMoreAttempts = propertySubmissions.length > visibleAttemptsCount;

  const isBest = latestSubmission.rating === "best";
  const isMedium = latestSubmission.rating === "medium";

  return (
    <div className="space-y-6">
      <div id="evaluation-top-anchor" className="h-0 w-0 pointer-events-none" />
      {/* Top Action & Navigation Row */}
      <div className="flex items-center justify-start">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-[#204e40] bg-white hover:bg-[#EBF5F1]/40 border border-zinc-200 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#52A68B]" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* 1. Main Score Header Card */}
      <div
        id="card-evaluation-score"
        className={`rounded-2xl border p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all shadow-card ${isBest
            ? "bg-gradient-to-br from-white via-[#FAFDFB] to-[#EBF5F1]/60 border-[#52A68B]/40 ring-1 ring-[#52A68B]/20"
            : isMedium
              ? "bg-gradient-to-br from-white via-[#FFFDF9] to-amber-50/50 border-amber-300 ring-1 ring-amber-200/50"
              : "bg-gradient-to-br from-white via-[#FFF9F9] to-rose-50/50 border-rose-300 ring-1 ring-rose-200/50"
          }`}
      >
        {/* Subtle Ambient Decorative Glow */}
        <div
          className={`absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isBest ? "bg-[#52A68B]/15" : isMedium ? "bg-amber-400/15" : "bg-rose-400/15"
            }`}
        />

        <div className="relative max-w-3xl mx-auto text-center space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white shadow-xs border border-zinc-200/80 text-zinc-600">
            Graded Submission Result
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span
              id="score-accuracy-display"
              className={`text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight tabular-nums ${isBest ? "text-[#52A68B]" : isMedium ? "text-amber-600" : "text-rose-600"
                }`}
            >
              {latestSubmission.accuracy}
            </span>
            <div className="text-left">
              <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest block">
                Points Awarded
              </span>
              <div className="mt-1">
                <RatingBadge rating={latestSubmission.rating} />
              </div>
            </div>
          </div>

          <div className="px-2">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-zinc-900 tracking-tight break-words">
              {latestSubmission.property_address}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed mt-1">
              {breakdown.feedback}
            </p>
          </div>

          {/* Quick Explanation Banner */}
          <div className="w-full max-w-xl mx-auto p-3 sm:p-3.5 bg-white/95 rounded-xl border border-zinc-200/90 text-xs text-zinc-700 shadow-xs backdrop-blur-sm text-left sm:text-center leading-relaxed">
            <span className="font-semibold text-zinc-900">Score Breakdown: </span>
            Your Mid forecast of <strong>{formatCurrency(breakdown.candidate)}</strong> was{" "}
            <strong className={isBest ? "text-[#204e40]" : isMedium ? "text-amber-700" : "text-rose-700"}>
              {breakdown.difference_amount > 0 ? "+" : ""}
              {breakdown.deviation_percentage}%
            </strong>{" "}
            ({breakdown.difference_amount > 0 ? "above" : breakdown.difference_amount < 0 ? "below" : "matching"}{" "}
            the analyst reference of <strong>{formatCurrency(breakdown.reference)}</strong>).
          </div>

          {/* 4 Quick Key Metrics Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 pt-1 sm:pt-2 text-left">
            <div className="p-2.5 sm:p-3 bg-white/90 rounded-xl border border-zinc-200/80 shadow-2xs">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 block tracking-wider truncate">
                Your Mid Forecast
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 mt-0.5 block truncate">
                {formatCurrency(breakdown.candidate)}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-white/90 rounded-xl border border-zinc-200/80 shadow-2xs">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 block tracking-wider truncate">
                Analyst Benchmark
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#52A68B] mt-0.5 block truncate">
                {formatCurrency(breakdown.reference)}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-white/90 rounded-xl border border-zinc-200/80 shadow-2xs">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 block tracking-wider truncate">
                Variance ($)
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 mt-0.5 block truncate">
                {breakdown.difference_amount >= 0 ? "+" : ""}
                {formatCurrency(breakdown.difference_amount)}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 bg-white/90 rounded-xl border border-zinc-200/80 shadow-2xs">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 block tracking-wider truncate">
                Accuracy Band
              </span>
              <span
                className={`font-sans text-[11px] sm:text-xs font-bold mt-1 block truncate ${isBest ? "text-[#204e40]" : isMedium ? "text-amber-800" : "text-rose-800"
                  }`}
              >
                {isBest ? "Best Band (±10%)" : isMedium ? "Medium Band (±25%)" : "Low Band (>25%)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Target Band Spectrum Gauge */}
      <Card id="card-target-bands">
        <CardHeader
          title="Target Band Spectrum & Visual Benchmark"
          subtitle="Real-time calibration showing where your Mid forecast landed relative to the ±10% Best and ±25% Medium bands."
        />
        <CardContent>
          {/* Visual Spectrum Bar */}
          <div className="py-4 px-2">
            <div className="relative pt-7 pb-2">
              {/* Pin Indicator */}
              <div
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${clampedPosition}%` }}
              >
                <div className="bg-zinc-900 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg shadow-md whitespace-nowrap border border-zinc-700">
                  You: {formatCurrency(breakdown.candidate)}
                </div>
                <div className="w-2 h-2 bg-zinc-900 rotate-45 -mt-1"></div>
              </div>

              {/* Spectrum Track */}
              <div className="h-4 rounded-full overflow-hidden flex w-full shadow-inner bg-zinc-100 border border-zinc-200/90">
                {/* Low Left */}
                <div className="w-[15%] bg-rose-200/80 border-r border-white/60" title="Low Band (< 25% deviation)"></div>
                {/* Medium Left */}
                <div className="w-[20%] bg-amber-200/80 border-r border-white/60" title="Medium Band (-25% to -10%)"></div>
                {/* Best Center */}
                <div className="w-[30%] bg-[#52A68B] border-r border-white/60 relative" title="Best Band (±10%)">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white font-sans tracking-wide">
                      Target Band
                    </span>
                  </div>
                </div>
                {/* Medium Right */}
                <div className="w-[20%] bg-amber-200/80 border-r border-white/60" title="Medium Band (+10% to +25%)"></div>
                {/* Low Right */}
                <div className="w-[15%] bg-rose-200/80" title="Low Band (> 25% deviation)"></div>
              </div>
            </div>

            {/* Spectrum Labels */}
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-zinc-500 mt-2.5 overflow-x-auto no-scrollbar gap-1 py-1">
              <span className="whitespace-nowrap">{formatCurrency(spectrumMin)}</span>
              <span className="text-amber-700 font-semibold whitespace-nowrap hidden sm:inline">{formatCurrency(breakdown.medium_min)} (-25%)</span>
              <span className="text-[#204e40] font-bold whitespace-nowrap">{formatCurrency(breakdown.best_min)} (-10%)</span>
              <span className="text-zinc-900 font-bold underline whitespace-nowrap">Ref: {formatCurrency(breakdown.reference)}</span>
              <span className="text-[#204e40] font-bold whitespace-nowrap">{formatCurrency(breakdown.best_max)} (+10%)</span>
              <span className="text-amber-700 font-semibold whitespace-nowrap hidden sm:inline">{formatCurrency(breakdown.medium_max)} (+25%)</span>
              <span className="whitespace-nowrap">{formatCurrency(spectrumMax)}</span>
            </div>
          </div>

          {/* Cards for Bands */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5 font-mono text-xs mt-4">
            <div
              className={`p-4 rounded-xl border transition-all ${isBest
                  ? "bg-[#EBF5F1]/80 border-[#c2e4d8] ring-2 ring-[#52A68B]/30 shadow-xs"
                  : "bg-zinc-50/60 border-zinc-200"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#204e40] font-sans">Best Band (100 pts)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5F1] text-[#204e40] font-semibold border border-[#c2e4d8]">
                  ±10%
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(breakdown.best_min)} – {formatCurrency(breakdown.best_max)}
              </div>
              <p className="mt-1.5 text-[11px] font-sans text-zinc-500 leading-normal">
                Top-decile precision matching senior underwriting expectations.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all ${isMedium
                  ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
                  : "bg-zinc-50/60 border-zinc-200"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 font-sans">Medium Band (70 pts)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  ±25%
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(breakdown.medium_min)} – {formatCurrency(breakdown.medium_max)}
              </div>
              <p className="mt-1.5 text-[11px] font-sans text-zinc-500 leading-normal">
                Solid directional accuracy; fine-tune comps and seasonality to reach the top tier.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all ${latestSubmission.rating === "low"
                  ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-xs"
                  : "bg-zinc-50/60 border-zinc-200"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 font-sans">Low Band (40 pts)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                  &gt; 25%
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 tabular-nums">
                &lt; {formatCurrency(breakdown.medium_min)} or &gt; {formatCurrency(breakdown.medium_max)}
              </div>
              <p className="mt-1.5 text-[11px] font-sans text-zinc-500 leading-normal">
                Forecast deviates significantly from market comparables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Trainee vs Analyst Reference Full Comparison Table */}
      <Card id="card-comparison-table">
        <CardHeader
          title="Side-by-Side Underwriting Breakdown"
          subtitle="Compare your financial model line-by-line with the senior analyst's reference assumptions."
        />
        <CardContent className="p-3 sm:p-6">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-2/5 whitespace-nowrap">Underwriting Parameter</th>
                  <th className="pb-3 text-right whitespace-nowrap">Your Submission</th>
                  <th className="pb-3 text-right font-bold text-zinc-900 whitespace-nowrap">Analyst Reference</th>
                  <th className="pb-3 text-right whitespace-nowrap">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono tabular-nums">
                {/* Mid Forecast (Graded) */}
                <tr className="bg-[#EBF5F1]/30 font-bold">
                  <td className="py-3 font-sans text-zinc-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#52A68B] flex-shrink-0" />
                    <span>Mid Revenue Forecast (Graded)</span>
                  </td>
                  <td className="py-3 text-right text-zinc-900 whitespace-nowrap">
                    {formatCurrency(trainee.forecasted_revenue.mid_revenue)}
                  </td>
                  <td className="py-3 text-right text-zinc-900 font-bold whitespace-nowrap">
                    {formatCurrency(ref.forecasted_revenue.mid_revenue)}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${isBest
                          ? "bg-[#EBF5F1] text-[#204e40] border border-[#c2e4d8]"
                          : isMedium
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                    >
                      {breakdown.difference_amount > 0 ? "+" : ""}
                      {breakdown.deviation_percentage}%
                    </span>
                  </td>
                </tr>

                {/* Purchase Price */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Purchase Offer Price</td>
                  <td className="py-2.5 text-right whitespace-nowrap">{formatCurrency(trainee.purchase_details.purchase_price)}</td>
                  <td className="py-2.5 text-right font-semibold text-zinc-800 whitespace-nowrap">{formatCurrency(ref.purchase_details.purchase_price)}</td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      trainee.purchase_details.purchase_price - ref.purchase_details.purchase_price
                    )}
                  </td>
                </tr>

                {/* Optimization / Setup Budget */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Capital Setup Budget</td>
                  <td className="py-2.5 text-right whitespace-nowrap">{formatCurrency(traineeCalc?.optimization_total)}</td>
                  <td className="py-2.5 text-right font-semibold text-zinc-800 whitespace-nowrap">{formatCurrency(refCalc?.optimization_total)}</td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      (traineeCalc?.optimization_total || 0) - (refCalc?.optimization_total || 0)
                    )}
                  </td>
                </tr>

                {/* Operating Expenses Annual */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Annual OPEX (Base Mid)</td>
                  <td className="py-2.5 text-right whitespace-nowrap">{formatCurrency(traineeCalc?.operating_expense_annual_total)}</td>
                  <td className="py-2.5 text-right font-semibold text-zinc-800 whitespace-nowrap">{formatCurrency(refCalc?.operating_expense_annual_total)}</td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      (traineeCalc?.operating_expense_annual_total || 0) -
                      (refCalc?.operating_expense_annual_total || 0)
                    )}
                  </td>
                </tr>

                {/* Total OOP */}
                <tr className="hover:bg-zinc-50/50 font-semibold">
                  <td className="py-2.5 font-sans text-zinc-800">Total Out of Pocket Cash</td>
                  <td className="py-2.5 text-right whitespace-nowrap">{formatCurrency(traineeCalc?.total_oop)}</td>
                  <td className="py-2.5 text-right font-bold text-zinc-900 whitespace-nowrap">{formatCurrency(refCalc?.total_oop)}</td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      (traineeCalc?.total_oop || 0) - (refCalc?.total_oop || 0)
                    )}
                  </td>
                </tr>

                {/* Net Operating Income (NOI) */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Net Operating Income (Mid NOI)</td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    {formatCurrency(traineeCalc?.scenarios.mid.net_operating_income)}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-zinc-800 whitespace-nowrap">
                    {formatCurrency(refCalc?.scenarios.mid.net_operating_income)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      (traineeCalc?.scenarios.mid.net_operating_income || 0) -
                      (refCalc?.scenarios.mid.net_operating_income || 0)
                    )}
                  </td>
                </tr>

                {/* Annual Free Cash Flow */}
                <tr className="hover:bg-zinc-50/50 font-semibold">
                  <td className="py-2.5 font-sans text-zinc-800">Annual Free Cash Flow (Mid)</td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    {formatCurrency(traineeCalc?.scenarios.mid.annual_free_cash_flow)}
                  </td>
                  <td className="py-2.5 text-right font-bold text-zinc-900 whitespace-nowrap">
                    {formatCurrency(refCalc?.scenarios.mid.annual_free_cash_flow)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      (traineeCalc?.scenarios.mid.annual_free_cash_flow || 0) -
                      (refCalc?.scenarios.mid.annual_free_cash_flow || 0)
                    )}
                  </td>
                </tr>

                {/* Cash on Cash % */}
                <tr className="hover:bg-zinc-50/50 font-bold">
                  <td className="py-2.5 font-sans text-zinc-900">Cash-on-Cash Return %</td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    {formatPercent(traineeCalc?.scenarios.mid.cash_on_cash_pct)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-900 whitespace-nowrap">
                    {formatPercent(refCalc?.scenarios.mid.cash_on_cash_pct)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {(
                      ((traineeCalc?.scenarios.mid.cash_on_cash_pct || 0) -
                        (refCalc?.scenarios.mid.cash_on_cash_pct || 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>

                {/* Year 1 Tax Savings */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Y1 Depreciation Tax Savings</td>
                  <td className="py-2.5 text-right whitespace-nowrap">{formatCurrency(traineeCalc?.taxes.tax_savings)}</td>
                  <td className="py-2.5 text-right font-semibold text-zinc-800 whitespace-nowrap">{formatCurrency(refCalc?.taxes.tax_savings)}</td>
                  <td className="py-2.5 text-right text-zinc-500 whitespace-nowrap">
                    {formatCurrency(
                      (traineeCalc?.taxes.tax_savings || 0) - (refCalc?.taxes.tax_savings || 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 4. Historical Attempts per Property */}
      {propertySubmissions.length > 0 && (
        <Card id="card-attempt-history">
          <CardHeader
            title="Attempt History for this Property"
            subtitle={`${propertySubmissions.length} graded attempt${propertySubmissions.length > 1 ? "s" : ""} recorded in PostgreSQL for this property.`}
          />
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3 whitespace-nowrap">Attempt</th>
                    <th className="pb-3 whitespace-nowrap">Submitted At</th>
                    <th className="pb-3 text-right whitespace-nowrap">Mid Revenue</th>
                    <th className="pb-3 text-right whitespace-nowrap">Accuracy</th>
                    <th className="pb-3 text-center whitespace-nowrap">Rating</th>
                    <th className="pb-3 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono tabular-nums">
                  {visibleSubmissions.map((sub, index) => {
                    const isCurrent = sub.id === latestSubmission.id;
                    const attemptNumber = propertySubmissions.length - index;
                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-zinc-50/50 transition ${isCurrent ? "bg-[#EBF5F1]/30 font-semibold" : ""}`}
                      >
                        <td className="py-2.5 font-sans text-zinc-900 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            Attempt #{attemptNumber}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#52A68B] text-white font-bold shadow-2xs">
                                Active
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 font-sans text-zinc-600 whitespace-nowrap">
                          {new Date(sub.submitted_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 text-right font-sans whitespace-nowrap">
                          {formatCurrency(sub.breakdown.candidate)}
                        </td>
                        <td className="py-2.5 text-right font-bold text-zinc-900 whitespace-nowrap">
                          {sub.accuracy}%
                        </td>
                        <td className="py-2.5 text-center font-sans whitespace-nowrap">
                          <RatingBadge rating={sub.rating} />
                        </td>
                        <td className="py-2.5 text-right font-sans whitespace-nowrap">
                          {isCurrent ? (
                            <button
                              type="button"
                              onClick={scrollToTop}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#204e40] bg-[#EBF5F1] hover:bg-[#d8efe5] border border-[#c2e4d8] rounded-lg transition shadow-2xs cursor-pointer"
                              title="Click to go to top of page"
                            >
                              <ArrowUp className="w-3 h-3 text-[#52A68B]" />
                              <span>Viewing</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleViewScorecard(sub)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition shadow-xs cursor-pointer"
                            >
                              View Scorecard
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Load More Button (10 more items per click) */}
            {hasMoreAttempts && (
              <div className="pt-3.5 mt-2 border-t border-zinc-100 flex items-center justify-center">
                <button
                  type="button"
                  id="btn-load-more-attempts"
                  onClick={() => setVisibleAttemptsCount((prev) => prev + 10)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-[#204e40] bg-white hover:bg-[#EBF5F1]/50 border border-zinc-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Load More</span>
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Return & Next Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 md:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-card">
        <div className="w-full md:w-auto">
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900">
            Next Steps & Actions
          </h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Re-attempt this deal to calibrate assumptions, or proceed to evaluate the next property.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onReattempt(latestSubmission.zpid)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Re-attempt Deal</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-[#EBF5F1]/40 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>View Leaderboard</span>
          </button>

          <button
            type="button"
            id="btn-return-dashboard"
            onClick={onBackToDashboard}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#52A68B] hover:bg-[#438a72] rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-[#52A68B]/25 cursor-pointer"
          >
            <span>Next Property</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
