export interface PurchaseDetailsInput {
  purchase_price: number;
  down_payment_pct: number;
  interest_rate: number;
  mortgage_years: number;
  closing_costs_pct: number;
}

export interface CalculatedPurchaseDetails extends PurchaseDetailsInput {
  down_payment_amount: number;
  loan_amount: number;
  closing_costs_amount: number;
  monthly_mortgage: number;
  annual_debt_service: number;
  year_one_principal_paydown: number;
}

export interface OptimizationItem {
  id: string;
  category: string;
  total_price: number;
  notes?: string;
}

export interface OperatingExpense {
  id: string;
  expense_name: string;
  monthly_amount: number;
}

export interface CompItem {
  id: string;
  listing_url: string;
  revenue: number;
  bedrooms: number;
  sleeps: number;
  is_favourite?: boolean;
}

export interface TaxesInput {
  land_assumptions_pct: number;
  sla_multiplier_pct: number;
  bonus_amount_pct: number;
  tax_rate_pct: number;
}

export interface CalculatedTaxes extends TaxesInput {
  improvement_basis: number;
  estimated_short_life_assets: number;
  y1_loss_from_depreciation: number;
  tax_savings: number;
}

export interface ForecastedRevenueInput {
  co_hosting_fee_pct: number;
  annual_re_appreciation_pct: number;
  low_revenue: number;
  mid_revenue: number;
  high_revenue: number;
}

export interface ScenarioResult {
  forecasted_revenue: number;
  operating_expenses_annual: number;
  co_hosting_fee: number;
  net_operating_income: number;
  debt_service_annual: number;
  annual_free_cash_flow: number;
  principal_pay_down: number;
  annual_re_appreciation: number;
  annual_total_re_return_pct: number;
  cash_on_cash_pct: number;
  y1_coc_incl_tax_savings_pct: number;
}

export interface DealTags {
  turnkey: boolean;
  furnished: boolean;
  luxury: boolean;
  tax_efficient: boolean;
  new_construction: boolean;
  existing_airbnb: boolean;
  arv: boolean;
  high_cash_on_cash: boolean;
  low_cash_on_cash: boolean;
  add_inground_pool: boolean;
  waterfront: boolean;
  remote: boolean;
  can_support_cohost: boolean;
  renovation_level: number;
  deal_complexity: number;
}

export interface CalculatedOutputs {
  purchase_details: CalculatedPurchaseDetails;
  taxes: CalculatedTaxes;
  optimization_total: number;
  operating_expense_monthly_total: number;
  operating_expense_annual_total: number;
  total_oop: number;
  prr: number;
  budget_to_pp: number;
  scenarios: {
    low: ScenarioResult;
    mid: ScenarioResult;
    high: ScenarioResult;
  };
}

export interface UnderwritingData {
  id: string;
  zpid: string;
  updated_at: string;
  bedrooms: number;
  bathrooms: number;
  sleep_count_low: number;
  sleep_count_high: number;
  purchase_details: PurchaseDetailsInput;
  forecasted_revenue: ForecastedRevenueInput;
  taxes: TaxesInput;
  optimization_items: OptimizationItem[];
  operating_expenses: OperatingExpense[];
  comp_set: CompItem[];
  tags: DealTags;
  deal_pitch: string;
  analyst_notes?: string;
  calculations?: CalculatedOutputs;
}
