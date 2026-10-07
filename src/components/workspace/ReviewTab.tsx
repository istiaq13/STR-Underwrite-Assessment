import React from "react";
import { UnderwritingData } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Building,
  DollarSign,
  Percent,
} from "lucide-react";

interface ReviewTabProps {
  draft: UnderwritingData;
  onSubmit: () => void;
  onPrefillReference: () => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  draft,
  onSubmit,
  onPrefillReference,
}) => {
  const pd = draft.purchase_details;
  const rev = draft.forecasted_revenue;
  const calc = draft.calculations;

  // Validation logic
  const validations = [
    {
      label: "Purchase details valid",
      valid: pd.purchase_price > 0 && pd.interest_rate > 0 && pd.down_payment_pct > 0,
      message:
        pd.purchase_price > 0
          ? `${formatCurrency(pd.purchase_price)} at ${(pd.interest_rate * 100).toFixed(2)}% interest`
          : "Purchase price or interest rate missing",
    },
    {
      label: "Mid revenue forecast specified (Graded Metric)",
      valid: rev.mid_revenue > 0,
      message:
        rev.mid_revenue > 0
          ? `Mid forecast set to ${formatCurrency(rev.mid_revenue)}`
          : "Required for scoring! Please enter a Mid revenue estimate in the Analysis tab.",
      isPrimary: true,
    },
    {
      label: "Revenue hierarchy (Low ≤ Mid ≤ High)",
      valid:
        rev.low_revenue <= rev.mid_revenue &&
        rev.mid_revenue <= rev.high_revenue &&
        rev.low_revenue >= 0,
      message:
        rev.low_revenue <= rev.mid_revenue && rev.mid_revenue <= rev.high_revenue
          ? `${formatCurrency(rev.low_revenue)} ≤ ${formatCurrency(rev.mid_revenue)} ≤ ${formatCurrency(rev.high_revenue)}`
          : "Revenue forecasts must follow Low ≤ Mid ≤ High order",
    },
    {
      label: "Total Out of Pocket positive",
      valid: Boolean(calc && calc.total_oop > 0),
      message:
        calc && calc.total_oop > 0
          ? `${formatCurrency(calc.total_oop)} total initial capital required`
          : "Out of pocket must be positive",
    },
    {
      label: "Operating expenses and taxes configured",
      valid:
        draft.operating_expenses.length > 0 &&
        draft.taxes.tax_rate_pct > 0,
      message: `${draft.operating_expenses.length} operating expense items totaling ${formatCurrency(
        calc?.operating_expense_annual_total
      )}/yr`,
    },
  ];

  const allValid = validations.every((v) => v.valid);
  const invalidCount = validations.filter((v) => !v.valid).length;

  return (
    <div className="space-y-6">
      {/* 1. Pre-Submission Readiness Checklist */}
      <Card id="card-validation-checklist">
        <CardHeader
          title="Pre-Submission Audit & Field Validation"
          subtitle="Verifies all required model assumptions are complete and mathematically sound before submitting to the scoring engine."
          action={
            <div className="flex items-center gap-1.5">
              {allValid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to Submit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {invalidCount} {invalidCount === 1 ? "Issue" : "Issues"} to Resolve
                </span>
              )}
            </div>
          }
        />
        <CardContent>
          <div className="divide-y divide-slate-100">
            {validations.map((v, i) => (
              <div
                key={i}
                className={`py-3 flex items-start justify-between gap-3 ${
                  !v.valid ? "bg-rose-50/40 px-3 rounded-lg my-1 border border-rose-100" : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {v.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span
                      className={`text-xs font-semibold ${
                        v.valid ? "text-slate-800" : "text-rose-900 font-bold"
                      }`}
                    >
                      {v.label}
                    </span>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        v.valid ? "text-slate-500" : "text-rose-700"
                      }`}
                    >
                      {v.message}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      v.valid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {v.valid ? "PASS" : "REQUIRED"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!allValid && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <span>
                Want to quickly test with senior analyst benchmark data?
              </span>
              <button
                onClick={onPrefillReference}
                className="font-bold underline text-amber-900 hover:text-amber-950 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill with Benchmark
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Executive Deal Summary Card */}
      <Card id="card-deal-summary-audit">
        <CardHeader
          title="Executive Underwriting Summary"
          subtitle="Final review of your financial model prior to blind scoring against the senior analyst."
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                Purchase Price
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(pd.purchase_price)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                Total Out of Pocket
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(calc?.total_oop)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold text-slate-900">
                Mid Revenue Forecast
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(rev.mid_revenue)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                Expected Cash-on-Cash
              </span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatPercent(calc?.scenarios.mid.cash_on_cash_pct)}
              </span>
            </div>
          </div>

          {/* Quick stats checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800 block mb-1">Debt Structure</span>
              <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                <div>Down: {formatCurrency(calc?.purchase_details.down_payment_amount)} ({(pd.down_payment_pct * 100).toFixed(0)}%)</div>
                <div>Loan: {formatCurrency(calc?.purchase_details.loan_amount)}</div>
                <div>Mortgage: {formatCurrency(calc?.purchase_details.monthly_mortgage)}/mo</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800 block mb-1">Upfront & OPEX</span>
              <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                <div>Setup: {formatCurrency(calc?.optimization_total)}</div>
                <div>Monthly OPEX: {formatCurrency(calc?.operating_expense_monthly_total)}/mo</div>
                <div>Annual OPEX: {formatCurrency(calc?.operating_expense_annual_total)}/yr</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800 block mb-1">Tax Shield & Yield</span>
              <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                <div>Y1 Tax Savings: {formatCurrency(calc?.taxes.tax_savings)}</div>
                <div>PRR: {formatPercent(calc?.prr)}</div>
                <div>Y1 CoC w/ Tax: {formatPercent(calc?.scenarios.mid.y1_coc_incl_tax_savings_pct)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Big Submission Action Box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Deterministic Grading System
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            Ready to submit your completed underwriting?
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            Upon submitting, your Mid revenue forecast is graded against the senior analyst reference.
            You will receive your score (100 / 70 / 40), target band breakdown, and updated leaderboard standing.
          </p>
        </div>

        <div className="w-full md:w-auto flex-shrink-0">
          <button
            id="btn-submit-underwriting"
            onClick={onSubmit}
            disabled={!allValid}
            className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition ${
              allValid
                ? "bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            }`}
          >
            <span>Submit for Grading</span>
            <Send className="w-4 h-4" />
          </button>
          {!allValid && (
            <p className="text-[11px] text-rose-400 mt-2 text-center md:text-right">
              Fix {invalidCount} required items above to submit
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
