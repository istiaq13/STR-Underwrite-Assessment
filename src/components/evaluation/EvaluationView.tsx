"use client";

import React from "react";
import { useUnderwriting } from "@/lib/context";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { RatingBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  Trophy,
  ArrowRight,
  RotateCcw,
  Target,
  Award,
  TrendingUp,
  History,
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
  const { latestSubmission, leaderboard, submissions, setLatestSubmission } = useUnderwriting();

  if (!latestSubmission) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200/90 shadow-card p-8">
        <p className="text-base font-semibold text-zinc-800">No evaluation results found</p>
        <p className="text-xs text-zinc-500 mt-1">Please submit an underwriting to see your grade and score breakdown.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 shadow-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { breakdown, trainee_underwriting: trainee, reference_underwriting: ref } = latestSubmission;
  const userRank = leaderboard.find((e) => e.is_current_user)?.rank || 3;

  const traineeCalc = trainee.calculations;
  const refCalc = ref.calculations;

  // Calculate percentage position of trainee guess within spectrum [0.70 * ref, 1.30 * ref]
  const spectrumMin = breakdown.reference * 0.7;
  const spectrumMax = breakdown.reference * 1.3;
  const rawPosition = ((breakdown.candidate - spectrumMin) / (spectrumMax - spectrumMin)) * 100;
  const clampedPosition = Math.min(Math.max(rawPosition, 5), 95);

  const propertySubmissions = submissions.filter((s) => s.zpid === latestSubmission.zpid);

  return (
    <div className="space-y-6">
      {/* 1. Main Score Header Card */}
      <div
        id="card-evaluation-score"
        className={`rounded-2xl border p-6 sm:p-8 text-center relative overflow-hidden transition-all shadow-card ${
          latestSubmission.rating === "best"
            ? "bg-emerald-50/50 border-emerald-300"
            : latestSubmission.rating === "medium"
            ? "bg-amber-50/50 border-amber-300"
            : "bg-rose-50/50 border-rose-300"
        }`}
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm border border-zinc-200">
            <Award className="w-3.5 h-3.5 text-zinc-700" />
            Graded Submission Result
          </div>

          <div className="flex items-center justify-center gap-3">
            <span
              id="score-accuracy-display"
              className={`text-6xl sm:text-7xl font-black font-mono tracking-tight tabular-nums ${
                latestSubmission.rating === "best"
                  ? "text-[#52A68B]"
                  : latestSubmission.rating === "medium"
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {latestSubmission.accuracy}
            </span>
            <div className="text-left">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block">
                Points Awarded
              </span>
              <RatingBadge rating={latestSubmission.rating} />
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
            {latestSubmission.property_address}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-700 max-w-xl mx-auto leading-relaxed">
            {breakdown.feedback}
          </p>

          {/* Quick Explanation Banner */}
          <div className="mt-4 p-3.5 bg-white/90 rounded-xl border border-zinc-200/80 inline-block text-xs text-zinc-700 shadow-sm backdrop-blur-sm">
            <span className="font-semibold text-zinc-900">Score Explanation: </span>
            Your Mid forecast of <strong>{formatCurrency(breakdown.candidate)}</strong> was{" "}
            <strong>
              {breakdown.difference_amount > 0 ? "+" : ""}
              {breakdown.deviation_percentage}%
            </strong>{" "}
            ({breakdown.difference_amount > 0 ? "above" : breakdown.difference_amount < 0 ? "below" : "matching"}{" "}
            the analyst reference of <strong>{formatCurrency(breakdown.reference)}</strong>).
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
            <div className="relative pt-6 pb-2">
              {/* Pin Indicator */}
              <div
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${clampedPosition}%` }}
              >
                <div className="bg-zinc-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  You: {formatCurrency(breakdown.candidate)}
                </div>
                <div className="w-1.5 h-1.5 bg-zinc-900 rotate-45 -mt-0.5"></div>
              </div>

              {/* Spectrum Track */}
              <div className="h-4 rounded-full overflow-hidden flex w-full shadow-inner bg-zinc-100 border border-zinc-200">
                {/* Low Left */}
                <div className="w-[15%] bg-rose-200/80 border-r border-white/50" title="Low Band (< 25% deviation)"></div>
                {/* Medium Left */}
                <div className="w-[20%] bg-amber-200/80 border-r border-white/50" title="Medium Band (-25% to -10%)"></div>
                {/* Best Center */}
                <div className="w-[30%] bg-emerald-400 border-r border-white/50 relative" title="Best Band (±10%)">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-950 font-sans tracking-wide">
                      Target Band
                    </span>
                  </div>
                </div>
                {/* Medium Right */}
                <div className="w-[20%] bg-amber-200/80 border-r border-white/50" title="Medium Band (+10% to +25%)"></div>
                {/* Low Right */}
                <div className="w-[15%] bg-rose-200/80" title="Low Band (> 25% deviation)"></div>
              </div>
            </div>

            {/* Spectrum Labels */}
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-1">
              <span>{formatCurrency(spectrumMin)}</span>
              <span className="text-amber-700 font-semibold">{formatCurrency(breakdown.medium_min)} (-25%)</span>
              <span className="text-emerald-700 font-bold">{formatCurrency(breakdown.best_min)} (-10%)</span>
              <span className="text-zinc-900 font-bold underline">Ref: {formatCurrency(breakdown.reference)}</span>
              <span className="text-emerald-700 font-bold">{formatCurrency(breakdown.best_max)} (+10%)</span>
              <span className="text-amber-700 font-semibold">{formatCurrency(breakdown.medium_max)} (+25%)</span>
              <span>{formatCurrency(spectrumMax)}</span>
            </div>
          </div>

          {/* Cards for Bands */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs mt-4">
            <div
              className={`p-3.5 rounded-xl border ${
                latestSubmission.rating === "best"
                  ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-zinc-50/60 border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 font-sans">Best Band (100 pts)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  ±10%
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(breakdown.best_min)} – {formatCurrency(breakdown.best_max)}
              </div>
              <p className="mt-1 text-[11px] font-sans text-zinc-500">
                Top-decile precision matching senior underwriting expectations.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                latestSubmission.rating === "medium"
                  ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20"
                  : "bg-zinc-50/60 border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 font-sans">Medium Band (70 pts)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                  ±25%
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(breakdown.medium_min)} – {formatCurrency(breakdown.medium_max)}
              </div>
              <p className="mt-1 text-[11px] font-sans text-zinc-500">
                Solid directional accuracy; fine-tune comps and seasonality to reach the top tier.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                latestSubmission.rating === "low"
                  ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20"
                  : "bg-zinc-50/60 border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-800 font-sans">Low Band (40 pts)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                  &gt; 25%
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-zinc-900 tabular-nums">
                &lt; {formatCurrency(breakdown.medium_min)} or &gt; {formatCurrency(breakdown.medium_max)}
              </div>
              <p className="mt-1 text-[11px] font-sans text-zinc-500">
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
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-1/3">Underwriting Parameter</th>
                  <th className="pb-3 text-right">Your Submission</th>
                  <th className="pb-3 text-right font-bold text-zinc-900">Analyst Reference</th>
                  <th className="pb-3 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono tabular-nums">
                {/* Mid Forecast (Graded) */}
                <tr className="bg-zinc-50/80 font-bold">
                  <td className="py-3 font-sans text-zinc-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-zinc-900" />
                    Mid Revenue Forecast (Graded)
                  </td>
                  <td className="py-3 text-right text-zinc-900">
                    {formatCurrency(trainee.forecasted_revenue.mid_revenue)}
                  </td>
                  <td className="py-3 text-right text-zinc-900">
                    {formatCurrency(ref.forecasted_revenue.mid_revenue)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        latestSubmission.rating === "best"
                          ? "bg-emerald-100 text-emerald-800"
                          : latestSubmission.rating === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
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
                  <td className="py-2.5 text-right">{formatCurrency(trainee.purchase_details.purchase_price)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(ref.purchase_details.purchase_price)}</td>
                  <td className="py-2.5 text-right text-zinc-500">
                    {formatCurrency(
                      trainee.purchase_details.purchase_price - ref.purchase_details.purchase_price
                    )}
                  </td>
                </tr>

                {/* Optimization / Setup Budget */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Capital Setup Budget</td>
                  <td className="py-2.5 text-right">{formatCurrency(traineeCalc?.optimization_total)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(refCalc?.optimization_total)}</td>
                  <td className="py-2.5 text-right text-zinc-500">
                    {formatCurrency(
                      (traineeCalc?.optimization_total || 0) - (refCalc?.optimization_total || 0)
                    )}
                  </td>
                </tr>

                {/* Operating Expenses Annual */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Annual OPEX (Base Mid)</td>
                  <td className="py-2.5 text-right">{formatCurrency(traineeCalc?.operating_expense_annual_total)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(refCalc?.operating_expense_annual_total)}</td>
                  <td className="py-2.5 text-right text-zinc-500">
                    {formatCurrency(
                      (traineeCalc?.operating_expense_annual_total || 0) -
                        (refCalc?.operating_expense_annual_total || 0)
                    )}
                  </td>
                </tr>

                {/* Total OOP */}
                <tr className="hover:bg-zinc-50/50 font-semibold">
                  <td className="py-2.5 font-sans text-zinc-800">Total Out of Pocket Cash</td>
                  <td className="py-2.5 text-right">{formatCurrency(traineeCalc?.total_oop)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(refCalc?.total_oop)}</td>
                  <td className="py-2.5 text-right text-zinc-500">
                    {formatCurrency(
                      (traineeCalc?.total_oop || 0) - (refCalc?.total_oop || 0)
                    )}
                  </td>
                </tr>

                {/* Net Operating Income (NOI) */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 font-sans text-zinc-700">Net Operating Income (Mid NOI)</td>
                  <td className="py-2.5 text-right">
                    {formatCurrency(traineeCalc?.scenarios.mid.net_operating_income)}
                  </td>
                  <td className="py-2.5 text-right">
                    {formatCurrency(refCalc?.scenarios.mid.net_operating_income)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500">
                    {formatCurrency(
                      (traineeCalc?.scenarios.mid.net_operating_income || 0) -
                        (refCalc?.scenarios.mid.net_operating_income || 0)
                    )}
                  </td>
                </tr>

                {/* Annual Free Cash Flow */}
                <tr className="hover:bg-zinc-50/50 font-semibold">
                  <td className="py-2.5 font-sans text-zinc-800">Annual Free Cash Flow (Mid)</td>
                  <td className="py-2.5 text-right">
                    {formatCurrency(traineeCalc?.scenarios.mid.annual_free_cash_flow)}
                  </td>
                  <td className="py-2.5 text-right">
                    {formatCurrency(refCalc?.scenarios.mid.annual_free_cash_flow)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500">
                    {formatCurrency(
                      (traineeCalc?.scenarios.mid.annual_free_cash_flow || 0) -
                        (refCalc?.scenarios.mid.annual_free_cash_flow || 0)
                    )}
                  </td>
                </tr>

                {/* Cash on Cash % */}
                <tr className="hover:bg-zinc-50/50 font-bold">
                  <td className="py-2.5 font-sans text-zinc-900">Cash-on-Cash Return %</td>
                  <td className="py-2.5 text-right">
                    {formatPercent(traineeCalc?.scenarios.mid.cash_on_cash_pct)}
                  </td>
                  <td className="py-2.5 text-right">
                    {formatPercent(refCalc?.scenarios.mid.cash_on_cash_pct)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500">
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
                  <td className="py-2.5 text-right">{formatCurrency(traineeCalc?.taxes.tax_savings)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(refCalc?.taxes.tax_savings)}</td>
                  <td className="py-2.5 text-right text-zinc-500">
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
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Attempt</th>
                    <th className="pb-3">Submitted At</th>
                    <th className="pb-3 text-right">Mid Revenue</th>
                    <th className="pb-3 text-right">Accuracy</th>
                    <th className="pb-3 text-center">Rating</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono tabular-nums">
                  {propertySubmissions.map((sub, index) => {
                    const isCurrent = sub.id === latestSubmission.id;
                    const attemptNumber = propertySubmissions.length - index;
                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-zinc-50/50 transition ${isCurrent ? "bg-amber-50/30 font-semibold" : ""}`}
                      >
                        <td className="py-2.5 font-sans text-zinc-900">
                          <span className="inline-flex items-center gap-1.5">
                            Attempt #{attemptNumber}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-white font-bold">
                                Active
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 font-sans text-zinc-600">
                          {new Date(sub.submitted_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          {formatCurrency(sub.breakdown.candidate)}
                        </td>
                        <td className="py-2.5 text-right font-bold text-zinc-900">
                          {sub.accuracy}%
                        </td>
                        <td className="py-2.5 text-center font-sans">
                          <RatingBadge rating={sub.rating} />
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          {isCurrent ? (
                            <span className="text-zinc-400 text-[11px] font-medium">Viewing</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLatestSubmission(sub)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition shadow-sm cursor-pointer"
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
          </CardContent>
        </Card>
      )}

      {/* 5. Leaderboard & Next Steps Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900">
              Current Standing: Rank #{userRank} on Trainee Leaderboard
            </div>
            <p className="text-[11px] text-zinc-500">
              Keep underwrite accuracy above 90% across all 6 cases to unlock Senior Analyst certification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onReattempt(latestSubmission.zpid)}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-attempt Deal</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>View Leaderboard</span>
          </button>

          <button
            id="btn-return-dashboard"
            onClick={onBackToDashboard}
            className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Next Property</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
