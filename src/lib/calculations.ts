import {
  CalculatedOutputs,
  CalculatedPurchaseDetails,
  CalculatedTaxes,
  ForecastedRevenueInput,
  OperatingExpense,
  OptimizationItem,
  PurchaseDetailsInput,
  ScenarioResult,
  TaxesInput,
} from "@/types";

export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "0.0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function calculatePurchaseDetails(
  input: PurchaseDetailsInput
): CalculatedPurchaseDetails {
  const price = Number(input.purchase_price) || 0;
  const downPct = Number(input.down_payment_pct) || 0;
  const closingPct = Number(input.closing_costs_pct) || 0;
  const rate = Number(input.interest_rate) || 0;
  const years = Number(input.mortgage_years) || 30;

  const down_payment_amount = round(price * downPct);
  const loan_amount = round(price - down_payment_amount);
  const closing_costs_amount = round(price * closingPct);

  // Monthly mortgage calculation
  let monthly_mortgage = 0;
  if (loan_amount > 0 && years > 0) {
    const n = years * 12;
    const r = rate / 12;
    if (r === 0) {
      monthly_mortgage = loan_amount / n;
    } else {
      const growth = Math.pow(1 + r, n);
      monthly_mortgage = (loan_amount * r * growth) / (growth - 1);
    }
  }
  monthly_mortgage = round(monthly_mortgage);
  const annual_debt_service = round(monthly_mortgage * 12);

  // Year 1 principal paydown
  let year_one_principal_paydown = 0;
  if (loan_amount > 0 && years > 0) {
    let balance = loan_amount;
    const r = rate / 12;
    for (let i = 0; i < 12; i++) {
      const interest = balance * r;
      const principal = monthly_mortgage - interest;
      year_one_principal_paydown += principal;
      balance -= principal;
    }
  }
  year_one_principal_paydown = round(year_one_principal_paydown);

  return {
    ...input,
    down_payment_amount,
    loan_amount,
    closing_costs_amount,
    monthly_mortgage,
    annual_debt_service,
    year_one_principal_paydown,
  };
}

export function calculateTaxes(
  taxes: TaxesInput,
  purchasePrice: number,
  optimizationTotal: number
): CalculatedTaxes {
  const landAssump = Number(taxes.land_assumptions_pct) || 0;
  const slaMultiplier = Number(taxes.sla_multiplier_pct) || 0;
  const bonusPct = Number(taxes.bonus_amount_pct) || 0;
  const taxRate = Number(taxes.tax_rate_pct) || 0;

  const improvement_basis = round(
    purchasePrice * (1 - landAssump) + optimizationTotal
  );
  const estimated_short_life_assets = round(improvement_basis * slaMultiplier);
  const y1_loss_from_depreciation = round(estimated_short_life_assets * bonusPct);
  const tax_savings = round(y1_loss_from_depreciation * taxRate);

  return {
    ...taxes,
    improvement_basis,
    estimated_short_life_assets,
    y1_loss_from_depreciation,
    tax_savings,
  };
}

export function calculateUnderwriting(
  purchaseDetailsInput: PurchaseDetailsInput,
  forecastedRevenueInput: ForecastedRevenueInput,
  taxesInput: TaxesInput,
  optimizationItems: OptimizationItem[],
  operatingExpenses: OperatingExpense[]
): CalculatedOutputs {
  const pd = calculatePurchaseDetails(purchaseDetailsInput);

  const optimization_total = round(
    optimizationItems.reduce(
      (sum, item) => sum + (Number(item.total_price) || 0),
      0
    )
  );

  const operating_expense_monthly_total = round(
    operatingExpenses.reduce(
      (sum, item) => sum + (Number(item.monthly_amount) || 0),
      0
    )
  );

  const operating_expense_annual_total = round(
    operating_expense_monthly_total * 12
  );

  const total_oop = round(
    pd.down_payment_amount + pd.closing_costs_amount + optimization_total
  );

  const taxes = calculateTaxes(taxesInput, pd.purchase_price, optimization_total);

  const annual_re_appreciation = round(
    pd.purchase_price * (Number(forecastedRevenueInput.annual_re_appreciation_pct) || 0)
  );

  const opexMultipliers = {
    low: 0.96,
    mid: 1.0,
    high: 1.04,
  };

  const revenueScenarios = {
    low: Number(forecastedRevenueInput.low_revenue) || 0,
    mid: Number(forecastedRevenueInput.mid_revenue) || 0,
    high: Number(forecastedRevenueInput.high_revenue) || 0,
  };

  const scenarios: { [key in "low" | "mid" | "high"]: ScenarioResult } = {
    low: {} as ScenarioResult,
    mid: {} as ScenarioResult,
    high: {} as ScenarioResult,
  };

  (["low", "mid", "high"] as const).forEach((scenarioKey) => {
    const revenue = revenueScenarios[scenarioKey];
    const multiplier = opexMultipliers[scenarioKey];
    const opex_annual = round(operating_expense_annual_total * multiplier);
    const co_hosting_fee = round(
      revenue * (Number(forecastedRevenueInput.co_hosting_fee_pct) || 0)
    );
    const net_operating_income = round(revenue - opex_annual - co_hosting_fee);
    const annual_free_cash_flow = round(
      net_operating_income - pd.annual_debt_service
    );

    const cash_on_cash_pct =
      total_oop > 0 ? annual_free_cash_flow / total_oop : 0;

    const annual_total_re_return_pct =
      total_oop > 0
        ? (annual_free_cash_flow +
            pd.year_one_principal_paydown +
            annual_re_appreciation) /
          total_oop
        : 0;

    const y1_coc_incl_tax_savings_pct =
      total_oop > 0
        ? (net_operating_income - pd.annual_debt_service + taxes.tax_savings) /
          total_oop
        : 0;

    scenarios[scenarioKey] = {
      forecasted_revenue: revenue,
      operating_expenses_annual: opex_annual,
      co_hosting_fee,
      net_operating_income,
      debt_service_annual: pd.annual_debt_service,
      annual_free_cash_flow,
      principal_pay_down: pd.year_one_principal_paydown,
      annual_re_appreciation,
      annual_total_re_return_pct: round(annual_total_re_return_pct, 4),
      cash_on_cash_pct: round(cash_on_cash_pct, 4),
      y1_coc_incl_tax_savings_pct: round(y1_coc_incl_tax_savings_pct, 4),
    };
  });

  const prr =
    pd.purchase_price > 0
      ? round(scenarios.mid.forecasted_revenue / pd.purchase_price, 4)
      : 0;

  const budget_to_pp =
    pd.purchase_price > 0 ? round(total_oop / pd.purchase_price, 4) : 0;

  return {
    purchase_details: pd,
    taxes,
    optimization_total,
    operating_expense_monthly_total,
    operating_expense_annual_total,
    total_oop,
    prr,
    budget_to_pp,
    scenarios,
  };
}
