import {
  DashboardApiResponse,
  Property,
  DashboardSummary,
  UnderwritingStatus,
  Market,
  MarketListResult,
  UnderwritingData,
  PurchaseDetailsInput,
  ForecastedRevenueInput,
  TaxesInput,
  OptimizationItem,
  OperatingExpense,
  CompItem,
  DealTags,
  ScoreBreakdown,
  SubmissionRecord,
  PropertyRead,
} from "@/types";
import { calculateUnderwriting } from "./calculations";
import { secureFetch } from "./security";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

/**
 * Maps a property returned from FastAPI backend (GET /api/dashboard)
 * to the frontend Property model.
 */
export function mapBackendProperty(raw: DashboardApiResponse["properties"][number]): Property {
  const addressStr = raw.address || "";
  const addressParts = addressStr.split(",").map((s) => s.trim());
  const street = addressParts[0] || raw.address || "Unknown Street";

  return {
    zpid: raw.zpid,
    market_id: raw.market_id ?? 1,
    market_name: raw.market_name ?? "Market",
    address: addressStr || `${street}, ${raw.city || ""}, ${raw.state || ""}`,
    address_street: street,
    address_city: raw.city || (addressParts[1] ?? ""),
    address_state: raw.state || (addressParts[2]?.split(" ")[0] ?? ""),
    address_zipcode: raw.zipcode || (addressParts[2]?.split(" ")[1] ?? ""),
    price: raw.price || "$0",
    unformatted_price:
      typeof raw.unformatted_price === "string"
        ? parseFloat(raw.unformatted_price) || 0
        : raw.unformatted_price ?? 0,
    beds: raw.beds ?? 0,
    baths: raw.baths ?? 0,
    area: raw.area ?? 0,
    latitude: 0,
    longitude: 0,
    home_type: raw.home_type || "SINGLE_FAMILY",
    home_status: "FOR_SALE",
    time_on_zillow: "Recently listed",
    img_src: raw.img_src || "https://picsum.photos/seed/brokenbow/640/420",
    detail_url: raw.detail_url || "",
    status: (raw.status as UnderwritingStatus) || "not_started",
    attempts: raw.attempts ?? 0,
    latest_accuracy: raw.latest_accuracy !== null ? Number(raw.latest_accuracy) : null,
    latest_rating: raw.latest_rating,
    best_accuracy: raw.best_accuracy !== null ? Number(raw.best_accuracy) : null,
    best_rating: raw.best_rating,
    active_underwriting_id: raw.active_underwriting_id ? String(raw.active_underwriting_id) : null,
    latest_submission_id: raw.latest_submission_id ? String(raw.latest_submission_id) : null,
  };
}

/**
 * Calls GET /api/dashboard to fetch live training cases and trainee progress summary.
 */
export async function fetchDashboard(): Promise<{
  summary: DashboardSummary;
  properties: Property[];
}> {
  const res = await secureFetch(`${API_BASE_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard (HTTP ${res.status}): ${res.statusText}`);
  }

  const data: DashboardApiResponse = await res.json();

  const properties = data.properties.map(mapBackendProperty);
  const summary: DashboardSummary = {
    total_properties: data.summary.total_properties,
    submitted: data.summary.submitted,
    in_progress: data.summary.in_progress,
    not_started: data.summary.not_started,
    average_accuracy:
      data.summary.average_accuracy !== null ? Number(data.summary.average_accuracy) : null,
  };

  return { summary, properties };
}

/**
 * Calls GET /api/markets to fetch all active markets with property counts.
 */
export async function fetchMarkets(isActive: boolean = true): Promise<Market[]> {
  const url = isActive
    ? `${API_BASE_URL}/markets?is_active=true`
    : `${API_BASE_URL}/markets`;

  const res = await secureFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch markets (HTTP ${res.status}): ${res.statusText}`);
  }

  const data: MarketListResult = await res.json();
  return data.items;
}

export interface BackendUnderwritingRead {
  id: number;
  zpid: string;
  market_id: number | null;
  is_reference: boolean;
  deal_status: string | null;
  deal_submitted: string | null;
  property_address: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: string | number | null;
  sleep_count_low: number | null;
  sleep_count_high: number | null;
  purchase_price: string | number | null;
  total_oop: string | number | null;
  prr: string | number | null;
  budget_to_pp: string | number | null;
  low_gross_revenue: string | number | null;
  mid_gross_revenue: string | number | null;
  high_gross_revenue: string | number | null;
  l_cash_on_cash: string | number | null;
  m_cash_on_cash: string | number | null;
  h_cash_on_cash: string | number | null;
  optimization_total: string | number | null;
  operating_expense_total: string | number | null;
  turnkey: boolean | null;
  furnished: boolean | null;
  luxury: boolean | null;
  tax_efficient: boolean | null;
  new_construction: boolean | null;
  existing_airbnb: boolean | null;
  arv: boolean | null;
  high_cash_on_cash: boolean | null;
  low_cash_on_cash: boolean | null;
  add_inground_pool: boolean | null;
  waterfront: boolean | null;
  remote: boolean | null;
  can_support_cohost: boolean | null;
  renovation_level: number | null;
  deal_complexity: number | null;
  listing_url: string | null;
  deal_pitch: string | null;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
  detail: {
    purchase_details?: any;
    y1_coc_incl_tax_savings?: any;
    forecasted_revenue?: any;
    zillow_property?: any;
    analyst_notes?: string | null;
  } | null;
  taxes: any | null;
  optimization_items: any[];
  operating_expenses: any[];
  comp_set: any[];
}

/**
 * Maps a backend UnderwritingRead DTO into the frontend UnderwritingData model.
 */
export function mapBackendUnderwriting(raw: BackendUnderwritingRead): UnderwritingData {
  const purchasePrice = raw.purchase_price
    ? Number(raw.purchase_price)
    : raw.detail?.zillow_property?.price
      ? parseFloat(String(raw.detail.zillow_property.price).replace(/[^0-9.]/g, ""))
      : 500000;

  const purchaseDetails: PurchaseDetailsInput = {
    purchase_price: purchasePrice,
    down_payment_pct: raw.detail?.purchase_details?.down_payment_pct ?? 0.2,
    interest_rate: raw.detail?.purchase_details?.interest_rate ?? 0.0699,
    mortgage_years: raw.detail?.purchase_details?.mortgage_years ?? 30,
    closing_costs_pct: raw.detail?.purchase_details?.closing_costs_pct ?? 0.03,
  };

  const forecastedRevenue: ForecastedRevenueInput = {
    co_hosting_fee_pct: raw.detail?.forecasted_revenue?.co_hosting_fee_pct ?? 0,
    annual_re_appreciation_pct: raw.detail?.forecasted_revenue?.annual_re_appreciation_pct ?? 0.03,
    low_revenue: raw.low_gross_revenue ? Number(raw.low_gross_revenue) : 0,
    mid_revenue: raw.mid_gross_revenue ? Number(raw.mid_gross_revenue) : 0,
    high_revenue: raw.high_gross_revenue ? Number(raw.high_gross_revenue) : 0,
  };

  const taxes: TaxesInput = {
    land_assumptions_pct: raw.taxes?.land_assumptions_pct ? Number(raw.taxes.land_assumptions_pct) : 0.2,
    sla_multiplier_pct: raw.taxes?.sla_multiplier_pct ? Number(raw.taxes.sla_multiplier_pct) : 0.25,
    bonus_amount_pct: raw.taxes?.bonus_amount_pct ? Number(raw.taxes.bonus_amount_pct) : 0.6,
    tax_rate_pct: raw.taxes?.tax_rate_pct ? Number(raw.taxes.tax_rate_pct) : 0.37,
  };

  const optimizationItems: OptimizationItem[] = (raw.optimization_items || []).map((item, index) => ({
    id: String(item.id ?? `opt-${index}`),
    category: item.category ?? "General",
    total_price: Number(item.total_price ?? 0),
    notes: item.notes ?? "",
  }));

  const operatingExpenses: OperatingExpense[] = (raw.operating_expenses || []).map((item, index) => ({
    id: String(item.id ?? `opex-${index}`),
    expense_name: item.expense_name ?? "Expense",
    monthly_amount: Number(item.monthly_amount ?? 0),
  }));

  const compSet: CompItem[] = (raw.comp_set || []).map((item, index) => ({
    id: String(item.id ?? `comp-${index}`),
    listing_url: item.listing_url ?? "",
    revenue: Number(item.revenue ?? 0),
    bedrooms: Number(item.bedrooms ?? raw.bedrooms ?? 0),
    sleeps: Number(item.sleeps ?? 0),
    is_favourite: !!item.is_favourite,
  }));

  const tags: DealTags = {
    turnkey: !!raw.turnkey,
    furnished: !!raw.furnished,
    luxury: !!raw.luxury,
    tax_efficient: !!raw.tax_efficient,
    new_construction: !!raw.new_construction,
    existing_airbnb: !!raw.existing_airbnb,
    arv: !!raw.arv,
    high_cash_on_cash: !!raw.high_cash_on_cash,
    low_cash_on_cash: !!raw.low_cash_on_cash,
    add_inground_pool: !!raw.add_inground_pool,
    waterfront: !!raw.waterfront,
    remote: !!raw.remote,
    can_support_cohost: !!raw.can_support_cohost,
    renovation_level: raw.renovation_level ?? 1,
    deal_complexity: raw.deal_complexity ?? 1,
  };

  const underwritingData: UnderwritingData = {
    id: String(raw.id),
    zpid: raw.zpid,
    updated_at: raw.updated_at || new Date().toISOString(),
    bedrooms: raw.bedrooms ?? 0,
    bathrooms: raw.bathrooms ? Number(raw.bathrooms) : 0,
    sleep_count_low: raw.sleep_count_low ?? (raw.bedrooms ? raw.bedrooms * 2 : 4),
    sleep_count_high: raw.sleep_count_high ?? (raw.bedrooms ? raw.bedrooms * 2 + 2 : 6),
    purchase_details: purchaseDetails,
    forecasted_revenue: forecastedRevenue,
    taxes: taxes,
    optimization_items: optimizationItems,
    operating_expenses: operatingExpenses,
    comp_set: compSet,
    tags: tags,
    deal_pitch: raw.deal_pitch || "",
    analyst_notes: raw.detail?.analyst_notes || raw.note || "",
  };

  underwritingData.calculations = calculateUnderwriting(
    underwritingData.purchase_details,
    underwritingData.forecasted_revenue,
    underwritingData.taxes,
    underwritingData.optimization_items,
    underwritingData.operating_expenses
  );

  return underwritingData;
}

/**
 * Calls POST /api/underwritings with { zpid } to create a new draft in PostgreSQL.
 */
export async function createUnderwriting(zpid: string): Promise<UnderwritingData> {
  const res = await secureFetch(`${API_BASE_URL}/underwritings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ zpid }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create underwriting (HTTP ${res.status}): ${res.statusText}`);
  }

  const raw: BackendUnderwritingRead = await res.json();
  return mapBackendUnderwriting(raw);
}

/**
 * Calls GET /api/underwritings/{underwriting_id} to load a draft from PostgreSQL.
 */
export async function fetchUnderwriting(underwritingId: number | string): Promise<UnderwritingData> {
  const res = await secureFetch(`${API_BASE_URL}/underwritings/${underwritingId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load underwriting ${underwritingId} (HTTP ${res.status}): ${res.statusText}`);
  }

  const raw: BackendUnderwritingRead = await res.json();
  return mapBackendUnderwriting(raw);
}

/**
 * Helper to build the SaveUnderwritingPayload expected by the backend.
 */
export function buildUnderwritingPayload(draft: UnderwritingData) {
  return {
    bedrooms: draft.bedrooms,
    bathrooms: draft.bathrooms,
    sleep_count_low: draft.sleep_count_low,
    sleep_count_high: draft.sleep_count_high,
    deal_pitch: draft.deal_pitch,
    analyst_notes: draft.analyst_notes,
    purchase_details: {
      purchase_price: draft.purchase_details.purchase_price,
      down_payment_pct: draft.purchase_details.down_payment_pct,
      interest_rate: draft.purchase_details.interest_rate,
      mortgage_years: draft.purchase_details.mortgage_years,
      closing_costs_pct: draft.purchase_details.closing_costs_pct,
    },
    forecasted_revenue: {
      co_hosting_fee_pct: draft.forecasted_revenue.co_hosting_fee_pct,
      annual_re_appreciation_pct: draft.forecasted_revenue.annual_re_appreciation_pct,
      scenarios: {
        low: { forecasted_revenue: draft.forecasted_revenue.low_revenue || 0 },
        mid: { forecasted_revenue: draft.forecasted_revenue.mid_revenue || 0 },
        high: { forecasted_revenue: draft.forecasted_revenue.high_revenue || 0 },
      },
    },
    taxes: {
      land_assumptions_pct: draft.taxes.land_assumptions_pct,
      sla_multiplier_pct: draft.taxes.sla_multiplier_pct,
      bonus_amount_pct: draft.taxes.bonus_amount_pct,
      tax_rate_pct: draft.taxes.tax_rate_pct,
    },
    optimization_items: (draft.optimization_items || []).map((item) => ({
      category: item.category || "General",
      total_price: item.total_price || 0,
      notes: item.notes || null,
    })),
    operating_expenses: (draft.operating_expenses || []).map((item) => ({
      expense_name: item.expense_name || "Expense",
      monthly_amount: item.monthly_amount || 0,
    })),
    comp_set: (draft.comp_set || []).map((item) => ({
      listing_url: item.listing_url || "",
      revenue: item.revenue || 0,
      bedrooms: item.bedrooms || 0,
      sleeps: item.sleeps || 0,
      is_favourite: !!item.is_favourite,
    })),
    tags: {
      turnkey: draft.tags.turnkey,
      furnished: draft.tags.furnished,
      luxury: draft.tags.luxury,
      tax_efficient: draft.tags.tax_efficient,
      new_construction: draft.tags.new_construction,
      existing_airbnb: draft.tags.existing_airbnb,
      arv: draft.tags.arv,
      high_cash_on_cash: draft.tags.high_cash_on_cash,
      low_cash_on_cash: draft.tags.low_cash_on_cash,
      add_inground_pool: draft.tags.add_inground_pool,
      waterfront: draft.tags.waterfront,
      remote: draft.tags.remote,
      can_support_cohost: draft.tags.can_support_cohost,
      renovation_level: draft.tags.renovation_level,
      deal_complexity: draft.tags.deal_complexity,
    },
  };
}

/**
 * Calls PUT /api/underwritings/{underwriting_id} to save draft changes back to PostgreSQL.
 */
export async function saveUnderwriting(
  underwritingId: number | string,
  draft: UnderwritingData
): Promise<UnderwritingData> {
  const payload = buildUnderwritingPayload(draft);

  const res = await secureFetch(`${API_BASE_URL}/underwritings/${underwritingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save underwriting ${underwritingId} (HTTP ${res.status}): ${res.statusText}`);
  }

  const raw: BackendUnderwritingRead = await res.json();
  return mapBackendUnderwriting(raw);
}

export interface SubmitUnderwritingResultData {
  submission: SubmissionRecord;
  underwriting: UnderwritingData;
  dashboard: {
    summary: DashboardSummary;
    properties: Property[];
  };
}

/**
 * Calls POST /api/underwritings/{underwriting_id}/submit to persist, score, and grade a deal against benchmark in PostgreSQL.
 */
export async function submitUnderwritingApi(
  underwritingId: number | string,
  draft?: UnderwritingData
): Promise<SubmitUnderwritingResultData> {
  const payload = draft ? buildUnderwritingPayload(draft) : undefined;

  const res = await secureFetch(`${API_BASE_URL}/underwritings/${underwritingId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.detail || `Failed to submit underwriting ${underwritingId} (HTTP ${res.status}): ${res.statusText}`
    );
  }

  const raw = await res.json();
  const mappedUnderwriting = mapBackendUnderwriting(raw.underwriting);

  // Fetch reference underwriting if present from backend
  let referenceUnderwriting: UnderwritingData = mappedUnderwriting;
  if (raw.submission.reference_underwriting_id) {
    try {
      referenceUnderwriting = await fetchUnderwriting(raw.submission.reference_underwriting_id);
    } catch (refErr) {
      console.warn("Could not fetch reference underwriting:", refErr);
    }
  }

  const submissionRecord = await mapBackendSubmission(
    raw.submission,
    mappedUnderwriting,
    referenceUnderwriting
  );

  const mappedProperties: Property[] = (raw.dashboard?.properties || []).map(mapBackendProperty);
  const mappedSummary: DashboardSummary = {
    total_properties: raw.dashboard?.summary?.total_properties ?? mappedProperties.length,
    submitted: raw.dashboard?.summary?.submitted ?? 0,
    in_progress: raw.dashboard?.summary?.in_progress ?? 0,
    not_started: raw.dashboard?.summary?.not_started ?? 0,
    average_accuracy: raw.dashboard?.summary?.average_accuracy
      ? Number(raw.dashboard.summary.average_accuracy)
      : null,
  };

  return {
    submission: submissionRecord,
    underwriting: mappedUnderwriting,
    dashboard: {
      summary: mappedSummary,
      properties: mappedProperties,
    },
  };
}

export interface BackendSubmissionRead {
  id: number;
  underwriting_id: number;
  reference_underwriting_id: number | null;
  zpid: string;
  rating: string;
  accuracy: string | number;
  breakdown: {
    metric: string;
    label: string;
    candidate: string | number | null;
    reference: string | number | null;
    deviation: string | number;
    best_threshold: string | number;
    medium_threshold: string | number;
  };
  submitted_at: string;
}

/**
 * Maps a backend SubmissionRead into the frontend SubmissionRecord model.
 */
export async function mapBackendSubmission(
  raw: BackendSubmissionRead,
  preloadedTrainee?: UnderwritingData,
  preloadedRef?: UnderwritingData
): Promise<SubmissionRecord> {
  const trainee = preloadedTrainee || (await fetchUnderwriting(raw.underwriting_id));
  const ref =
    preloadedRef ||
    (raw.reference_underwriting_id ? await fetchUnderwriting(raw.reference_underwriting_id) : trainee);

  const candidate = Number(raw.breakdown?.candidate ?? trainee.forecasted_revenue.mid_revenue ?? 0);
  const reference = Number(raw.breakdown?.reference ?? ref.forecasted_revenue.mid_revenue ?? 0);
  const deviation = Number(raw.breakdown?.deviation ?? 0);
  const bestThreshold = Number(raw.breakdown?.best_threshold ?? 0.05);
  const mediumThreshold = Number(raw.breakdown?.medium_threshold ?? 0.15);
  const rating = (raw.rating || "medium") as "best" | "medium" | "low";
  const diffPct = (deviation * 100).toFixed(1);

  const feedback =
    rating === "best"
      ? `Outstanding work! Your estimate is within ${diffPct}% of the Senior Underwriter benchmark.`
      : rating === "medium"
      ? `Good effort. Your estimate is within ${diffPct}% of the benchmark. Room for fine-tuning comps.`
      : `Variance is high (${diffPct}%). Review nearby comparable properties and seasonal ADR trends.`;

  const scoreBreakdown: ScoreBreakdown = {
    rating,
    accuracy: Number(raw.accuracy),
    metric: raw.breakdown?.metric || "mid_gross_revenue",
    label: raw.breakdown?.label || "Mid Gross Revenue",
    candidate,
    reference,
    deviation,
    deviation_percentage: deviation * 100,
    difference_amount: Math.abs(candidate - reference),
    best_threshold: bestThreshold,
    medium_threshold: mediumThreshold,
    best_min: reference * (1 - bestThreshold),
    best_max: reference * (1 + bestThreshold),
    medium_min: reference * (1 - mediumThreshold),
    medium_max: reference * (1 + mediumThreshold),
    feedback,
  };

  const propertyAddress =
    (trainee as any).property_address ||
    trainee.deal_pitch ||
    "Property";

  return {
    id: String(raw.id),
    underwriting_id: String(raw.underwriting_id),
    zpid: raw.zpid,
    property_address: propertyAddress,
    rating,
    accuracy: Number(raw.accuracy),
    breakdown: scoreBreakdown,
    submitted_at: raw.submitted_at || new Date().toISOString(),
    trainee_underwriting: trainee,
    reference_underwriting: ref,
  };
}

/**
 * Calls GET /api/submissions to fetch all past submissions from PostgreSQL.
 */
export async function fetchSubmissions(zpid?: string): Promise<SubmissionRecord[]> {
  const url = zpid ? `${API_BASE_URL}/submissions?zpid=${encodeURIComponent(zpid)}` : `${API_BASE_URL}/submissions`;
  const res = await secureFetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch submissions (HTTP ${res.status}): ${res.statusText}`);
  }

  const rawList: BackendSubmissionRead[] = await res.json();
  return Promise.all(rawList.map((raw) => mapBackendSubmission(raw)));
}

/**
 * Calls GET /api/submissions/{submission_id} to fetch a specific submission from PostgreSQL.
 */
export async function fetchSubmission(submissionId: number | string): Promise<SubmissionRecord> {
  const res = await secureFetch(`${API_BASE_URL}/submissions/${submissionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch submission ${submissionId} (HTTP ${res.status}): ${res.statusText}`);
  }

  const raw: BackendSubmissionRead = await res.json();
  return mapBackendSubmission(raw);
}

/**
 * Calls GET /api/properties to query property catalog directly with text search and/or market filter.
 */
export async function fetchProperties(search?: string, marketId?: number): Promise<PropertyRead[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) params.append("search", search.trim());
  if (marketId !== undefined && marketId !== null) params.append("market_id", String(marketId));
  const queryStr = params.toString() ? `?${params.toString()}` : "";

  const res = await secureFetch(`${API_BASE_URL}/properties${queryStr}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch properties (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return data.items;
}

/**
 * Calls GET /api/properties/{zpid} to fetch individual property details for workspace header.
 */
export async function fetchPropertyByZpid(zpid: string): Promise<PropertyRead> {
  const res = await secureFetch(`${API_BASE_URL}/properties/${encodeURIComponent(zpid)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch property ${zpid} (HTTP ${res.status}): ${res.statusText}`);
  }

  return res.json();
}





