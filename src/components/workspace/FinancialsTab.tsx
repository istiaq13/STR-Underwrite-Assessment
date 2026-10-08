import React from "react";
import { UnderwritingData } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { PercentageSliderInput } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Plus, Trash2, Info } from "lucide-react";

interface FinancialsTabProps {
  draft: UnderwritingData;
  onUpdate: (updater: (prev: UnderwritingData) => UnderwritingData) => void;
}

const COMMON_OPT_CATEGORIES = [
  "Furniture & design",
  "Hot tub",
  "Game room",
  "Private pool",
  "Themed bedrooms",
  "Fire pit & deck",
  "Pool heater & screen",
  "Golf cart",
  "Smart locks & security",
  "EV Charger",
  "Landscaping & signage",
];

const COMMON_OPEX_NAMES = [
  "Utilities",
  "Internet & WiFi",
  "Insurance (STR)",
  "Property Taxes",
  "Lawn & Grounds Care",
  "Guest Supplies & Consumables",
  "Software & PMS",
  "Maintenance Reserve",
  "Pool & Spa Service",
  "HOA Dues",
  "Trash & Pest Control",
];

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ draft, onUpdate }) => {
  const pd = draft.purchase_details;
  const calcPd = draft.calculations?.purchase_details;
  const calcTaxes = draft.calculations?.taxes;

  // Handle Purchase Details Change
  const updatePurchase = (field: keyof typeof pd, val: number) => {
    onUpdate((prev) => ({
      ...prev,
      purchase_details: {
        ...prev.purchase_details,
        [field]: val,
      },
    }));
  };

  // Handle Taxes Change
  const updateTaxes = (field: keyof typeof draft.taxes, val: number) => {
    onUpdate((prev) => ({
      ...prev,
      taxes: {
        ...prev.taxes,
        [field]: val,
      },
    }));
  };

  // Optimization Items Handlers
  const addOptimizationItem = () => {
    onUpdate((prev) => ({
      ...prev,
      optimization_items: [
        ...prev.optimization_items,
        {
          id: `opt-${Date.now()}`,
          category: "",
          total_price: 0,
        },
      ],
    }));
  };

  const updateOptimizationItem = (
    id: string,
    field: "category" | "total_price",
    value: any
  ) => {
    onUpdate((prev) => ({
      ...prev,
      optimization_items: prev.optimization_items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeOptimizationItem = (id: string) => {
    onUpdate((prev) => ({
      ...prev,
      optimization_items: prev.optimization_items.filter((item) => item.id !== id),
    }));
  };

  // Operating Expenses Handlers
  const addOperatingExpense = () => {
    onUpdate((prev) => ({
      ...prev,
      operating_expenses: [
        ...prev.operating_expenses,
        {
          id: `opex-${Date.now()}`,
          expense_name: "",
          monthly_amount: 0,
        },
      ],
    }));
  };

  const updateOperatingExpense = (
    id: string,
    field: "expense_name" | "monthly_amount",
    value: any
  ) => {
    onUpdate((prev) => ({
      ...prev,
      operating_expenses: prev.operating_expenses.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeOperatingExpense = (id: string) => {
    onUpdate((prev) => ({
      ...prev,
      operating_expenses: prev.operating_expenses.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Purchase & Financing */}
      <Card id="card-purchase-financing">
        <CardHeader
          title="1. Purchase & Financing"
          subtitle="Works out the initial debt structure, monthly mortgage payments, and cash needed at closing."
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Purchase Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-mono text-sm">$</span>
                <input
                  id="input-purchase-price"
                  type="number"
                  value={pd.purchase_price || ""}
                  onChange={(e) => updatePurchase("purchase_price", Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
                  placeholder="Enter purchase price"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">Prefilled from listing; adjust for offer price.</p>
            </div>

            <PercentageSliderInput
              id="slider-down-payment"
              label="Down Payment %"
              value={pd.down_payment_pct}
              onChange={(val) => updatePurchase("down_payment_pct", val)}
              min={0}
              max={50}
              step={1}
            />

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Interest Rate %
              </label>
              <div className="relative">
                <input
                  id="input-interest-rate"
                  type="number"
                  step="0.01"
                  value={Number((pd.interest_rate * 100).toFixed(2)) || ""}
                  onChange={(e) => updatePurchase("interest_rate", Number(e.target.value) / 100)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
                  placeholder="Enter interest rate"
                />
                <span className="absolute right-3 top-2.5 text-zinc-400 text-xs">%</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">e.g. 6.99%</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Loan Term (Years)
              </label>
              <input
                id="input-mortgage-years"
                type="number"
                value={pd.mortgage_years || 30}
                onChange={(e) => updatePurchase("mortgage_years", Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
                placeholder="Enter loan term"
              />
              <p className="mt-1 text-[11px] text-zinc-500">Standard 30-yr fixed</p>
            </div>

            <div className="sm:col-span-2">
              <PercentageSliderInput
                id="slider-closing-costs"
                label="Closing Costs %"
                value={pd.closing_costs_pct}
                onChange={(val) => updatePurchase("closing_costs_pct", val)}
                min={0}
                max={10}
                step={0.5}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Optimization List */}
      <Card id="card-optimization-list">
        <CardHeader
          title="2. Optimization List (Upfront Setup Budget)"
          subtitle="One-time capital setup costs incurred before the first guest arrives (furniture, hot tub, game room, etc.). Adds to Total Out of Pocket."
          action={
            <button
              id="btn-add-opt-item"
              onClick={addOptimizationItem}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#52A68B] hover:bg-[#438a73] shadow-sm shadow-[#52A68B]/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-2">Category / Item</th>
                  <th className="pb-2 w-48 text-right">Amount ($)</th>
                  <th className="pb-2 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draft.optimization_items && draft.optimization_items.length > 0 ? (
                  draft.optimization_items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            list={`opt-categories-${idx}`}
                            value={item.category}
                            onChange={(e) => updateOptimizationItem(item.id, "category", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                            placeholder="Enter category or item"
                          />
                          <datalist id={`opt-categories-${idx}`}>
                            {COMMON_OPT_CATEGORIES.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <div className="relative inline-block w-40">
                          <span className="absolute left-2.5 top-1.5 text-zinc-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            value={item.total_price || ""}
                            onChange={(e) =>
                              updateOptimizationItem(item.id, "total_price", Number(e.target.value))
                            }
                            className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono text-right rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                            placeholder="Enter amount"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => removeOptimizationItem(item.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-zinc-400 italic">
                      No setup budget items attached. Click &quot;Add Item&quot; to calibrate setup assumptions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Total items: {draft.optimization_items.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700">Total Setup Budget:</span>
              <span className="text-sm font-bold font-mono text-zinc-900">
                {formatCurrency(draft.calculations?.optimization_total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Operating Expenses (OPEX) */}
      <Card id="card-operating-expenses">
        <CardHeader
          title="3. Operating Expenses (OPEX)"
          subtitle="Recurring monthly costs subtracted from revenue. The Low and High scenarios nudge this slightly."
          action={
            <button
              id="btn-add-opex-item"
              onClick={addOperatingExpense}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#52A68B] hover:bg-[#438a73] shadow-sm shadow-[#52A68B]/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          }
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-2">Expense Name</th>
                  <th className="pb-2 w-48 text-right">Monthly Amount ($)</th>
                  <th className="pb-2 w-40 text-right">Annualized ($)</th>
                  <th className="pb-2 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {draft.operating_expenses && draft.operating_expenses.length > 0 ? (
                  draft.operating_expenses.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 pr-3">
                        <input
                          type="text"
                          list={`opex-names-${idx}`}
                          value={item.expense_name}
                          onChange={(e) => updateOperatingExpense(item.id, "expense_name", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                          placeholder="Enter expense name"
                        />
                        <datalist id={`opex-names-${idx}`}>
                          {COMMON_OPEX_NAMES.map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <div className="relative inline-block w-36">
                          <span className="absolute left-2.5 top-1.5 text-zinc-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            value={item.monthly_amount || ""}
                            onChange={(e) =>
                              updateOperatingExpense(item.id, "monthly_amount", Number(e.target.value))
                            }
                            className="w-full pl-6 pr-2.5 py-1.5 text-xs font-mono text-right rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#52A68B] focus:border-[#52A68B] transition-colors"
                            placeholder="Enter amount"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600">
                        {formatCurrency((item.monthly_amount || 0) * 12)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => removeOperatingExpense(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                          title="Remove expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400 italic">
                      No operating expenses attached. Click &quot;Add Expense&quot; to calibrate operational cost assumptions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Scenario adjustments: Low (0.96× ={" "}
              {formatCurrency((draft.calculations?.operating_expense_annual_total || 0) * 0.96)}), High (1.04× ={" "}
              {formatCurrency((draft.calculations?.operating_expense_annual_total || 0) * 1.04)})
            </span>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Monthly Total:</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {formatCurrency(draft.calculations?.operating_expense_monthly_total)} / mo
                </span>
              </div>
              <div className="text-right pl-4 border-l border-slate-200">
                <span className="text-xs text-slate-500 block">Annual Base Total:</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {formatCurrency(draft.calculations?.operating_expense_annual_total)} / yr
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Taxes & Depreciation */}
      <Card id="card-taxes-depreciation">
        <CardHeader
          title="4. Taxes & Cost Segregation Depreciation"
          subtitle="Estimates the first-year tax savings from accelerated bonus depreciation on short-life improvements."
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <PercentageSliderInput
                id="slider-land-assumption"
                label="Land Assumption %"
                value={draft.taxes.land_assumptions_pct}
                onChange={(val) => updateTaxes("land_assumptions_pct", val)}
                min={10}
                max={50}
                step={1}
                helperText="Portion of purchase allocated to non-depreciable land (standard 20%)."
              />

              <PercentageSliderInput
                id="slider-sla-multiplier"
                label="Short-Life Asset Multiplier %"
                value={draft.taxes.sla_multiplier_pct}
                onChange={(val) => updateTaxes("sla_multiplier_pct", val)}
                min={10}
                max={40}
                step={1}
                helperText="Portion of building basis qualifying for 5/15-yr depreciation (standard 25%)."
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Bonus Depreciation %
                  </label>
                  <div className="relative">
                    <input
                      id="input-bonus-amount"
                      type="number"
                      step="1"
                      value={Number((draft.taxes.bonus_amount_pct * 100).toFixed(0)) || ""}
                      onChange={(e) => updateTaxes("bonus_amount_pct", Number(e.target.value) / 100)}
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
                      placeholder="Enter bonus %"
                    />
                    <span className="absolute right-3 top-2.5 text-zinc-400 text-xs">%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">Standard 60%</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                    Investor Tax Rate %
                  </label>
                  <div className="relative">
                    <input
                      id="input-tax-rate"
                      type="number"
                      step="1"
                      value={Number((draft.taxes.tax_rate_pct * 100).toFixed(0)) || ""}
                      onChange={(e) => updateTaxes("tax_rate_pct", Number(e.target.value) / 100)}
                      className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#52A68B]/30 focus:border-[#52A68B] transition-colors"
                      placeholder="Enter tax rate"
                    />
                    <span className="absolute right-3 top-2.5 text-zinc-400 text-xs">%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">Standard 37% top bracket</p>
                </div>
              </div>
            </div>

            {/* Derived Tax Breakdown Panel */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  Depreciation & Tax Benefit Results
                </h4>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600 font-sans">Improvement Basis:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(calcTaxes?.improvement_basis)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600 font-sans">Est. Short-Life Assets:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(calcTaxes?.estimated_short_life_assets)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600 font-sans">Year 1 Paper Loss:</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(calcTaxes?.y1_loss_from_depreciation)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 bg-emerald-50/60 px-2 rounded border border-emerald-100">
                    <span className="text-emerald-900 font-sans font-semibold">
                      Year 1 Estimated Tax Savings:
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatCurrency(calcTaxes?.tax_savings)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed font-sans">
                Tax savings directly enhance first-year Cash-on-Cash yield by offsetting investor income.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
