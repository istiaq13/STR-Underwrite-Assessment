import React from "react";
import { UnderwritingData } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { validateUnderwritingDraft } from "@/lib/schemas";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Building,
  DollarSign,
  Percent,
} from "lucide-react";

interface ReviewTabProps {
  draft: UnderwritingData;
  onSubmit: () => void;
  onPrefillReference?: () => void;
  isSubmitting?: boolean;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  draft,
  onSubmit,
  onPrefillReference,
  isSubmitting = false,
}) => {
  const pd = draft.purchase_details;
  const rev = draft.forecasted_revenue;
  const calc = draft.calculations;

  // Run real-time Zod schema validation
  const zodResult = validateUnderwritingDraft(draft);

  // Validation logic
  const validations = [
    {
      label: "Zod Schema & Data Integrity",
      valid: zodResult.success,
      message: zodResult.success
        ? "All fields pass strict Zod schema validation & type constraints"
        : zodResult.errors[0] || "Schema validation issues found",
      isPrimary: true,
    },
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
      valid: draft.taxes.tax_rate_pct > 0,
      message:
        draft.operating_expenses.length > 0
          ? `${draft.operating_expenses.length} operating expense items totaling ${formatCurrency(
              calc?.operating_expense_annual_total
            )}/yr`
          : `${(draft.taxes.tax_rate_pct * 100).toFixed(0)}% tax rate configured with baseline OPEX`,
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF5F1] text-[#3d7d69] border border-[#c2e4d8]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#52A68B]" />
                  Ready to Submit
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs">
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {invalidCount}
                  </span>
                  <span>{invalidCount === 1 ? "Issue" : "Issues"} to Resolve</span>
                </span>
              )}
            </div>
          }
        />
        <CardContent>
          <div className="divide-y divide-zinc-100">
            {validations.map((v, i) => (
              <div
                key={i}
                className={`py-3 flex items-start justify-between gap-3 ${
                  !v.valid ? "bg-rose-50/50 px-3.5 py-2.5 rounded-xl my-1 border border-rose-200/80" : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {v.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-[#52A68B] mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span
                      className={`text-xs ${
                        v.valid ? "font-semibold text-zinc-900" : "font-bold text-rose-900"
                      }`}
                    >
                      {v.label}
                    </span>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        v.valid ? "text-zinc-500" : "text-rose-700"
                      }`}
                    >
                      {v.message}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      v.valid
                        ? "bg-[#EBF5F1] text-[#3d7d69] border border-[#c2e4d8]"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {v.valid ? "PASS" : "REQUIRED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Executive Deal Summary Card */}
      <Card id="card-deal-summary-audit">
        <CardHeader
          title="Executive Underwriting Summary"
          subtitle="Final review of your financial model prior to blind scoring against the senior analyst."
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-zinc-50/80 border border-zinc-200/90 mb-6 shadow-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                Purchase Price
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-zinc-900">
                {formatCurrency(pd.purchase_price)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                Total Out of Pocket
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-zinc-900">
                {formatCurrency(calc?.total_oop)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#52A68B] font-bold block mb-1">
                Mid Revenue Forecast
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#52A68B]">
                {formatCurrency(rev.mid_revenue)}
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                Expected Cash-on-Cash
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-zinc-900">
                {formatPercent(calc?.scenarios.mid.cash_on_cash_pct)}
              </span>
            </div>
          </div>

          {/* Quick stats checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-xs">
              <span className="font-semibold text-zinc-900 flex items-center gap-1.5 mb-2">
                <Building className="w-3.5 h-3.5 text-[#52A68B]" />
                Debt Structure
              </span>
              <div className="space-y-1.5 text-zinc-600 font-mono text-[11px]">
                <div>Down: {formatCurrency(calc?.purchase_details.down_payment_amount)} ({(pd.down_payment_pct * 100).toFixed(0)}%)</div>
                <div>Loan: {formatCurrency(calc?.purchase_details.loan_amount)}</div>
                <div>Mortgage: {formatCurrency(calc?.purchase_details.monthly_mortgage)}/mo</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-xs">
              <span className="font-semibold text-zinc-900 flex items-center gap-1.5 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-[#52A68B]" />
                Upfront & OPEX
              </span>
              <div className="space-y-1.5 text-zinc-600 font-mono text-[11px]">
                <div>Setup: {formatCurrency(calc?.optimization_total)}</div>
                <div>Monthly OPEX: {formatCurrency(calc?.operating_expense_monthly_total)}/mo</div>
                <div>Annual OPEX: {formatCurrency(calc?.operating_expense_annual_total)}/yr</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-xs">
              <span className="font-semibold text-zinc-900 flex items-center gap-1.5 mb-2">
                <Percent className="w-3.5 h-3.5 text-[#52A68B]" />
                Tax Shield & Yield
              </span>
              <div className="space-y-1.5 text-zinc-600 font-mono text-[11px]">
                <div>Y1 Tax Savings: {formatCurrency(calc?.taxes.tax_savings)}</div>
                <div>PRR: {formatPercent(calc?.prr)}</div>
                <div>Y1 CoC w/ Tax: {formatPercent(calc?.scenarios.mid.y1_coc_incl_tax_savings_pct)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Submission Action Row */}
      <div className="pt-6 border-t border-zinc-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
          Ready to submit your completed underwriting?
        </h3>

        <div className="flex flex-col items-stretch sm:items-end flex-shrink-0">
          <button
            id="btn-submit-underwriting"
            onClick={onSubmit}
            disabled={!allValid || isSubmitting}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
              allValid && !isSubmitting
                ? "bg-[#52A68B] hover:bg-[#438a73] text-white shadow-sm shadow-[#52A68B]/30 hover:scale-[1.01] cursor-pointer"
                : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-[#52A68B] border-t-transparent rounded-full animate-spin" />
                <span>Submitting & Grading...</span>
              </>
            ) : (
              <>
                <span>Submit for Grading</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
          {!allValid && (
            <p className="text-xs text-rose-600 mt-1.5 text-center sm:text-right font-medium">
              Fix {invalidCount} required items above to submit
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
