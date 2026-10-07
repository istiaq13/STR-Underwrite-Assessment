import React from "react";
import { UnderwritingData } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PercentageSliderInput } from "@/components/ui/Input";
import { TrendingUp, Target, DollarSign, Percent, BarChart3, HelpCircle } from "lucide-react";

interface AnalysisTabProps {
  draft: UnderwritingData;
  onUpdate: (updater: (prev: UnderwritingData) => UnderwritingData) => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ draft, onUpdate }) => {
  const rev = draft.forecasted_revenue;
  const calc = draft.calculations;

  const updateRevenue = (field: keyof typeof rev, val: number) => {
    onUpdate((prev) => ({
      ...prev,
      forecasted_revenue: {
        ...prev.forecasted_revenue,
        [field]: val,
      },
    }));
  };

  const scenarios = calc?.scenarios;

  return (
    <div className="space-y-6">
      {/* 1. Revenue Forecasts */}
      <Card id="card-revenue-scenarios">
        <CardHeader
          title="1. Revenue Scenarios & Operational Assumptions"
          subtitle="Enter Low, Mid, and High annual gross revenue projections. Note: Your Mid forecast is what the grading algorithm evaluates."
        />
        <CardContent>
          {/* Revenue Scenarios Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Low Scenario */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Low Scenario (Cautious)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                  OPEX × 0.96
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Off-peak weather, higher vacancy, market headwinds.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  id="input-low-revenue"
                  type="number"
                  value={rev.low_revenue || ""}
                  onChange={(e) => updateRevenue("low_revenue", Number(e.target.value))}
                  placeholder="105,000"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Mid Scenario - Highlighted */}
            <div className="p-4 rounded-xl border-2 border-slate-900 bg-slate-900/5 relative shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-slate-900" />
                  Mid Scenario (Expected)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white font-bold tracking-wide uppercase">
                  Graded Metric
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Base expected performance. Scored directly against senior analyst benchmark.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm font-bold">$</span>
                <input
                  id="input-mid-revenue"
                  type="number"
                  value={rev.mid_revenue || ""}
                  onChange={(e) => updateRevenue("mid_revenue", Number(e.target.value))}
                  placeholder="125,000"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold text-slate-900 rounded-lg border-2 border-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* High Scenario */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  High Scenario (Bullish)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                  OPEX × 1.04
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Strong event calendar, peak ADR, Superhost status.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  id="input-high-revenue"
                  type="number"
                  value={rev.high_revenue || ""}
                  onChange={(e) => updateRevenue("high_revenue", Number(e.target.value))}
                  placeholder="142,000"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Operational Overheads & Appreciation */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <PercentageSliderInput
              id="slider-cohost-fee"
              label="Co-Hosting Management Fee %"
              value={rev.co_hosting_fee_pct}
              onChange={(val) => updateRevenue("co_hosting_fee_pct", val)}
              min={0}
              max={30}
              step={1}
              helperText="Set to 0% if self-managing. Standard co-host management is 10%–20%."
            />

            <PercentageSliderInput
              id="slider-re-appreciation"
              label="Annual Real Estate Appreciation %"
              value={rev.annual_re_appreciation_pct}
              onChange={(val) => updateRevenue("annual_re_appreciation_pct", val)}
              min={0}
              max={8}
              step={0.5}
              helperText="Expected annual property value appreciation (standard 3.0%)."
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Key Headline Deal Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Total Out of Pocket
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-slate-900">
            {formatCurrency(calc?.total_oop)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Down + Closing + Setup</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Expected Cash-on-Cash
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-slate-900">
            {formatPercent(scenarios?.mid.cash_on_cash_pct)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Mid Free Cash Flow ÷ Total OOP</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            PRR (Price-to-Revenue)
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-slate-900">
            {formatPercent(calc?.prr)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Mid Revenue ÷ Purchase Price</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Y1 CoC w/ Tax Savings
          </span>
          <div className="mt-1.5 text-xl font-bold font-mono text-emerald-700">
            {formatPercent(scenarios?.mid.y1_coc_incl_tax_savings_pct)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Yield including cost-seg bonus</p>
        </div>
      </div>

      {/* 3. Comprehensive Underwriting Waterfall Analysis Table */}
      <Card id="card-scenarios-breakdown">
        <CardHeader
          title="3. Return & Cash Flow Breakdown Across Scenarios"
          subtitle="Live financial model deriving NOI, Free Cash Flow, and total returns based on your inputs."
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-1/3">Financial Metric</th>
                  <th className="pb-3 text-right">Low Scenario</th>
                  <th className="pb-3 text-right bg-slate-50/80 px-2 rounded-t font-bold text-slate-900">
                    Mid Scenario (Base)
                  </th>
                  <th className="pb-3 text-right">High Scenario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Revenue */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-sans font-medium text-slate-800">Gross Forecasted Revenue</td>
                  <td className="py-2.5 text-right">{formatCurrency(scenarios?.low.forecasted_revenue)}</td>
                  <td className="py-2.5 text-right bg-slate-50/80 px-2 font-bold text-slate-900">
                    {formatCurrency(scenarios?.mid.forecasted_revenue)}
                  </td>
                  <td className="py-2.5 text-right">{formatCurrency(scenarios?.high.forecasted_revenue)}</td>
                </tr>

                {/* Operating Expenses */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-sans text-slate-600">
                    Operating Expenses (OPEX)
                    <span className="font-mono text-[10px] text-slate-400 block">
                      Low: ×0.96 | Mid: ×1.00 | High: ×1.04
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-rose-600">
                    -{formatCurrency(scenarios?.low.operating_expenses_annual)}
                  </td>
                  <td className="py-2.5 text-right bg-slate-50/80 px-2 text-rose-600">
                    -{formatCurrency(scenarios?.mid.operating_expenses_annual)}
                  </td>
                  <td className="py-2.5 text-right text-rose-600">
                    -{formatCurrency(scenarios?.high.operating_expenses_annual)}
                  </td>
                </tr>

                {/* Co-hosting */}
                {draft.forecasted_revenue.co_hosting_fee_pct > 0 && (
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-sans text-slate-600">
                      Co-Hosting Fee ({formatPercent(draft.forecasted_revenue.co_hosting_fee_pct)})
                    </td>
                    <td className="py-2.5 text-right text-rose-600">
                      -{formatCurrency(scenarios?.low.co_hosting_fee)}
                    </td>
                    <td className="py-2.5 text-right bg-slate-50/80 px-2 text-rose-600">
                      -{formatCurrency(scenarios?.mid.co_hosting_fee)}
                    </td>
                    <td className="py-2.5 text-right text-rose-600">
                      -{formatCurrency(scenarios?.high.co_hosting_fee)}
                    </td>
                  </tr>
                )}

                {/* Net Operating Income (NOI) */}
                <tr className="hover:bg-slate-50/50 bg-slate-50/30 font-semibold">
                  <td className="py-2.5 font-sans text-slate-900">Net Operating Income (NOI)</td>
                  <td className="py-2.5 text-right text-slate-900">
                    {formatCurrency(scenarios?.low.net_operating_income)}
                  </td>
                  <td className="py-2.5 text-right bg-slate-50 px-2 text-slate-900 font-bold">
                    {formatCurrency(scenarios?.mid.net_operating_income)}
                  </td>
                  <td className="py-2.5 text-right text-slate-900">
                    {formatCurrency(scenarios?.high.net_operating_income)}
                  </td>
                </tr>

                {/* Debt Service */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-sans text-slate-600">Annual Debt Service (Mortgage P&I)</td>
                  <td className="py-2.5 text-right text-rose-600">
                    -{formatCurrency(scenarios?.low.debt_service_annual)}
                  </td>
                  <td className="py-2.5 text-right bg-slate-50/80 px-2 text-rose-600">
                    -{formatCurrency(scenarios?.mid.debt_service_annual)}
                  </td>
                  <td className="py-2.5 text-right text-rose-600">
                    -{formatCurrency(scenarios?.high.debt_service_annual)}
                  </td>
                </tr>

                {/* Annual Free Cash Flow */}
                <tr className="border-t-2 border-slate-200 font-bold">
                  <td className="py-3 font-sans text-slate-900 text-sm">Annual Free Cash Flow</td>
                  <td className="py-3 text-right text-sm">
                    {formatCurrency(scenarios?.low.annual_free_cash_flow)}
                  </td>
                  <td className="py-3 text-right bg-slate-50/80 px-2 text-sm text-slate-900 font-extrabold">
                    {formatCurrency(scenarios?.mid.annual_free_cash_flow)}
                  </td>
                  <td className="py-3 text-right text-sm">
                    {formatCurrency(scenarios?.high.annual_free_cash_flow)}
                  </td>
                </tr>

                {/* Cash-on-Cash Return */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-sans font-semibold text-slate-800">
                    Cash-on-Cash Return (CoC)
                  </td>
                  <td className="py-2.5 text-right">
                    {formatPercent(scenarios?.low.cash_on_cash_pct)}
                  </td>
                  <td className="py-2.5 text-right bg-slate-50/80 px-2 font-bold text-slate-900">
                    {formatPercent(scenarios?.mid.cash_on_cash_pct)}
                  </td>
                  <td className="py-2.5 text-right">
                    {formatPercent(scenarios?.high.cash_on_cash_pct)}
                  </td>
                </tr>

                {/* Year 1 CoC including Tax Savings */}
                <tr className="hover:bg-slate-50/50 bg-emerald-50/40">
                  <td className="py-2.5 font-sans font-semibold text-emerald-900">
                    Year 1 CoC (incl. Tax Savings)
                  </td>
                  <td className="py-2.5 text-right text-emerald-800">
                    {formatPercent(scenarios?.low.y1_coc_incl_tax_savings_pct)}
                  </td>
                  <td className="py-2.5 text-right bg-emerald-100/50 px-2 font-bold text-emerald-900">
                    {formatPercent(scenarios?.mid.y1_coc_incl_tax_savings_pct)}
                  </td>
                  <td className="py-2.5 text-right text-emerald-800">
                    {formatPercent(scenarios?.high.y1_coc_incl_tax_savings_pct)}
                  </td>
                </tr>

                {/* Annual Total Return */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-sans text-slate-600">
                    Total RE Return % (Cash Flow + Principal + Appreciation)
                  </td>
                  <td className="py-2.5 text-right">
                    {formatPercent(scenarios?.low.annual_total_re_return_pct)}
                  </td>
                  <td className="py-2.5 text-right bg-slate-50/80 px-2 font-bold text-slate-800">
                    {formatPercent(scenarios?.mid.annual_total_re_return_pct)}
                  </td>
                  <td className="py-2.5 text-right">
                    {formatPercent(scenarios?.high.annual_total_re_return_pct)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
