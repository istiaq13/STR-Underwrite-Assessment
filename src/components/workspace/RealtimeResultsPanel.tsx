"use client";

import React from "react";
import { UnderwritingData } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Info,
  Sparkles,
  Layers,
  Building,
  Target,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";

interface RealtimeResultsPanelProps {
  draft: UnderwritingData;
}

export const RealtimeResultsPanel: React.FC<RealtimeResultsPanelProps> = ({ draft }) => {
  const calc = draft.calculations;
  const calcPd = calc?.purchase_details;
  const scenarios = calc?.scenarios;
  const pd = draft.purchase_details;

  return (
    <div className="space-y-5">
      {/* Panel Title */}
      <div className="pb-3 border-b border-zinc-200">
        <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
          Calculations & Results
        </h3>
      </div>

      {/* 1. Headline KPI Metrics Ribbon (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Total Out of Pocket */}
        <div className="bg-white rounded-xl border border-zinc-200 p-2.5 sm:p-3.5 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block truncate">
            Total Out of Pocket
          </span>
          <div className="mt-1 text-base sm:text-lg lg:text-xl font-bold font-mono text-zinc-900 truncate">
            {formatCurrency(calc?.total_oop)}
          </div>
          <p className="mt-1 text-[10px] text-zinc-500 truncate">
            Down ({formatCurrency(calcPd?.down_payment_amount)}) + Closing + Setup
          </p>
        </div>

        {/* Expected Cash-on-Cash Return */}
        <div className="bg-white rounded-xl border border-zinc-200 p-2.5 sm:p-3.5 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block truncate">
            Expected Cash-on-Cash
          </span>
          <div className="mt-1 text-base sm:text-lg lg:text-xl font-bold font-mono text-[#52A68B] truncate">
            {formatPercent(scenarios?.mid.cash_on_cash_pct)}
          </div>
          <p className="mt-1 text-[10px] text-zinc-500 truncate">
            Mid Free Cash Flow ÷ Total OOP
          </p>
        </div>

        {/* Net Operating Income */}
        <div className="bg-white rounded-xl border border-zinc-200 p-2.5 sm:p-3.5 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block truncate">
            Net Operating Income
          </span>
          <div className="mt-1 text-base sm:text-lg lg:text-xl font-bold font-mono text-zinc-900 truncate">
            {formatCurrency(scenarios?.mid.net_operating_income)}
          </div>
          <p className="mt-1 text-[10px] text-zinc-500 truncate">
            Gross Rev − OPEX − Taxes
          </p>
        </div>

        {/* Free Cash Flow */}
        <div className="bg-white rounded-xl border border-zinc-200 p-2.5 sm:p-3.5 shadow-xs min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block truncate">
            Free Cash Flow (FCF)
          </span>
          <div className="mt-1 text-base sm:text-lg lg:text-xl font-bold font-mono text-zinc-900 truncate">
            {formatCurrency(scenarios?.mid.annual_free_cash_flow)}
          </div>
          <p className="mt-1 text-[10px] text-zinc-500 truncate">
            Net cash flow after debt service
          </p>
        </div>
      </div>

      {/* 2. Comprehensive Underwriting Waterfall Analysis Table */}
      <Card id="card-scenarios-breakdown">
        <CardHeader
          title="Return & Cash Flow Breakdown Across Scenarios"
          subtitle="Live financial model deriving NOI, Free Cash Flow, and total returns based on your inputs."
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 pr-2 w-2/5">Metric</th>
                  <th className="py-2.5 px-3 text-right font-mono">Low</th>
                  <th className="py-2.5 px-3 text-right bg-emerald-50/70 border-x border-t border-emerald-100 rounded-t-md font-bold text-zinc-900 font-mono">
                    Mid (Base)
                  </th>
                  <th className="py-2.5 pl-3 pr-1 text-right font-mono">High</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                {/* Revenue */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2 pr-2 font-sans font-medium text-zinc-800">Gross Forecasted Revenue</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(scenarios?.low.forecasted_revenue)}</td>
                  <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 font-bold text-zinc-900">
                    {formatCurrency(scenarios?.mid.forecasted_revenue)}
                  </td>
                  <td className="py-2 pl-3 pr-1 text-right">{formatCurrency(scenarios?.high.forecasted_revenue)}</td>
                </tr>

                {/* Operating Expenses */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2 pr-2 font-sans text-zinc-600">
                    Operating Expenses (OPEX)
                  </td>
                  <td className="py-2 px-3 text-right text-rose-600">
                    -{formatCurrency(scenarios?.low.operating_expenses_annual)}
                  </td>
                  <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 text-rose-600 font-semibold">
                    -{formatCurrency(scenarios?.mid.operating_expenses_annual)}
                  </td>
                  <td className="py-2 pl-3 pr-1 text-right text-rose-600">
                    -{formatCurrency(scenarios?.high.operating_expenses_annual)}
                  </td>
                </tr>

                {/* Co-hosting */}
                {draft.forecasted_revenue.co_hosting_fee_pct > 0 && (
                  <tr className="hover:bg-zinc-50/50">
                    <td className="py-2 pr-2 font-sans text-zinc-600">
                      Co-Hosting Fee ({formatPercent(draft.forecasted_revenue.co_hosting_fee_pct)})
                    </td>
                    <td className="py-2 px-3 text-right text-rose-600">
                      -{formatCurrency(scenarios?.low.co_hosting_fee)}
                    </td>
                    <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 text-rose-600 font-semibold">
                      -{formatCurrency(scenarios?.mid.co_hosting_fee)}
                    </td>
                    <td className="py-2 pl-3 pr-1 text-right text-rose-600">
                      -{formatCurrency(scenarios?.high.co_hosting_fee)}
                    </td>
                  </tr>
                )}

                {/* Net Operating Income (NOI) */}
                <tr className="hover:bg-zinc-50/50 font-semibold">
                  <td className="py-2 pr-2 font-sans text-zinc-900">Net Operating Income (NOI)</td>
                  <td className="py-2 px-3 text-right text-zinc-900">
                    {formatCurrency(scenarios?.low.net_operating_income)}
                  </td>
                  <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 text-zinc-900 font-bold">
                    {formatCurrency(scenarios?.mid.net_operating_income)}
                  </td>
                  <td className="py-2 pl-3 pr-1 text-right text-zinc-900">
                    {formatCurrency(scenarios?.high.net_operating_income)}
                  </td>
                </tr>

                {/* Debt Service */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2 pr-2 font-sans text-zinc-600">Annual Debt Service (P&I)</td>
                  <td className="py-2 px-3 text-right text-rose-600">
                    -{formatCurrency(scenarios?.low.debt_service_annual)}
                  </td>
                  <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 text-rose-600 font-semibold">
                    -{formatCurrency(scenarios?.mid.debt_service_annual)}
                  </td>
                  <td className="py-2 pl-3 pr-1 text-right text-rose-600">
                    -{formatCurrency(scenarios?.high.debt_service_annual)}
                  </td>
                </tr>

                {/* Annual Free Cash Flow */}
                <tr className="border-t-2 border-zinc-200 font-bold hover:bg-zinc-50/50">
                  <td className="py-2.5 pr-2 font-sans text-zinc-900 text-xs">Annual Free Cash Flow</td>
                  <td className="py-2.5 px-3 text-right text-xs text-zinc-900">
                    {formatCurrency(scenarios?.low.annual_free_cash_flow)}
                  </td>
                  <td className="py-2.5 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 text-xs text-[#52A68B] font-extrabold">
                    {formatCurrency(scenarios?.mid.annual_free_cash_flow)}
                  </td>
                  <td className="py-2.5 pl-3 pr-1 text-right text-xs text-zinc-900">
                    {formatCurrency(scenarios?.high.annual_free_cash_flow)}
                  </td>
                </tr>

                {/* Cash-on-Cash Return */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2 pr-2 font-sans font-semibold text-zinc-800">
                    Cash-on-Cash Return (CoC)
                  </td>
                  <td className="py-2 px-3 text-right">
                    {formatPercent(scenarios?.low.cash_on_cash_pct)}
                  </td>
                  <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-emerald-100 font-bold text-[#52A68B]">
                    {formatPercent(scenarios?.mid.cash_on_cash_pct)}
                  </td>
                  <td className="py-2 pl-3 pr-1 text-right">
                    {formatPercent(scenarios?.high.cash_on_cash_pct)}
                  </td>
                </tr>

                {/* Year 1 CoC including Tax Savings */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2 pr-2 font-sans font-semibold text-zinc-800">
                    Y1 CoC w/ Tax Depreciation
                  </td>
                  <td className="py-2 px-3 text-right text-zinc-700">
                    {formatPercent(scenarios?.low.y1_coc_incl_tax_savings_pct)}
                  </td>
                  <td className="py-2 px-3 text-right bg-emerald-50/70 border-x border-b border-emerald-100 rounded-b-md font-bold text-[#52A68B]">
                    {formatPercent(scenarios?.mid.y1_coc_incl_tax_savings_pct)}
                  </td>
                  <td className="py-2 pl-3 pr-1 text-right text-zinc-700">
                    {formatPercent(scenarios?.high.y1_coc_incl_tax_savings_pct)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. Capital Stack & Financing Breakdown */}
      <Card id="card-capital-stack">
        <CardHeader
          title="Capital Stack & Financing Breakdown"
          subtitle="Real-time debt structure, cash needed to close, and amortization."
        />
        <CardContent>
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600 font-sans">Financed Loan Amount:</span>
              <span className="font-semibold text-zinc-900">
                {formatCurrency(calcPd?.loan_amount)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600 font-sans">Down Payment Amount:</span>
              <span className="font-semibold text-zinc-900">
                {formatCurrency(calcPd?.down_payment_amount)} ({formatPercent(pd.down_payment_pct)})
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600 font-sans">Estimated Closing Costs:</span>
              <span className="font-semibold text-zinc-900">
                {formatCurrency(calcPd?.closing_costs_amount)} ({formatPercent(pd.closing_costs_pct)})
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600 font-sans">Upfront Setup Budget:</span>
              <span className="font-semibold text-zinc-900">
                {formatCurrency(calc?.optimization_total)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600 font-sans">Monthly Mortgage (P&I):</span>
              <span className="font-bold text-zinc-900">
                {formatCurrency(calcPd?.monthly_mortgage)} / mo
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-zinc-100">
              <span className="text-zinc-600 font-sans">Annual Debt Service:</span>
              <span className="font-bold text-zinc-900">
                {formatCurrency(calcPd?.annual_debt_service)} / yr
              </span>
            </div>

            <div className="flex justify-between py-1.5 pt-2">
              <span className="text-zinc-900 font-sans font-bold">
                Total Cash to Close (Down + Closing + Setup):
              </span>
              <span className="text-sm font-bold text-[#52A68B]">
                {formatCurrency(calc?.total_oop)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
