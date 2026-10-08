import { z } from "zod";
import { UnderwritingData } from "@/types";

/**
 * 1. Purchase Details Schema
 */
export const PurchaseDetailsSchema = z.object({
  purchase_price: z.coerce
    .number()
    .positive("Purchase price must be greater than $0"),
  down_payment_pct: z.coerce
    .number()
    .min(0, "Down payment cannot be negative")
    .max(1, "Down payment cannot exceed 100%"),
  interest_rate: z.coerce
    .number()
    .positive("Interest rate must be greater than 0%")
    .max(0.3, "Interest rate cannot exceed 30%"),
  mortgage_years: z.coerce
    .number()
    .int("Mortgage term must be in whole years")
    .min(1, "Mortgage term must be at least 1 year")
    .max(50, "Mortgage term cannot exceed 50 years"),
  closing_costs_pct: z.coerce
    .number()
    .min(0, "Closing costs percentage cannot be negative")
    .max(0.15, "Closing costs cannot exceed 15%"),
});

/**
 * 2. Forecasted Revenue Schema with Scenario Hierarchy Verification
 */
export const ForecastedRevenueSchema = z
  .object({
    co_hosting_fee_pct: z.coerce
      .number()
      .min(0, "Co-hosting fee cannot be negative")
      .max(0.5, "Co-hosting fee cannot exceed 50%"),
    annual_re_appreciation_pct: z.coerce
      .number()
      .min(-0.2, "Annual appreciation rate cannot be lower than -20%")
      .max(0.3, "Annual appreciation rate cannot exceed 30%"),
    low_revenue: z.coerce
      .number()
      .min(0, "Low revenue forecast cannot be negative"),
    mid_revenue: z.coerce
      .number()
      .positive("Mid revenue forecast is required for analyst scoring and must be greater than $0"),
    high_revenue: z.coerce
      .number()
      .min(0, "High revenue forecast cannot be negative"),
  })
  .refine(
    (data) => data.low_revenue <= data.mid_revenue,
    {
      message: "Revenue forecast hierarchy invalid: Low revenue must be ≤ Mid revenue",
      path: ["low_revenue"],
    }
  )
  .refine(
    (data) => data.mid_revenue <= data.high_revenue,
    {
      message: "Revenue forecast hierarchy invalid: Mid revenue must be ≤ High revenue",
      path: ["high_revenue"],
    }
  );

/**
 * 3. Taxes & Depreciation Schema
 */
export const TaxesSchema = z.object({
  land_assumptions_pct: z.coerce
    .number()
    .min(0, "Land assumption cannot be negative")
    .max(1, "Land assumption cannot exceed 100%"),
  sla_multiplier_pct: z.coerce
    .number()
    .min(0, "Short-life asset multiplier cannot be negative")
    .max(1, "Short-life asset multiplier cannot exceed 100%"),
  bonus_amount_pct: z.coerce
    .number()
    .min(0, "Bonus depreciation cannot be negative")
    .max(1, "Bonus depreciation cannot exceed 100%"),
  tax_rate_pct: z.coerce
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(0.6, "Tax rate cannot exceed 60%"),
});

/**
 * 4. Optimization Item Schema
 */
export const OptimizationItemSchema = z.object({
  id: z.string(),
  category: z.string().min(1, "Category is required"),
  total_price: z.coerce.number().min(0, "Item cost cannot be negative"),
  notes: z.string().optional(),
});

/**
 * 5. Operating Expense Schema
 */
export const OperatingExpenseSchema = z.object({
  id: z.string(),
  expense_name: z.string().min(1, "Expense item name is required"),
  monthly_amount: z.coerce.number().min(0, "Expense amount cannot be negative"),
});

/**
 * Strict URL validator enforcing https:// or http:// only (blocks javascript:, data:, etc.)
 */
export const SafeUrlSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      try {
        const parsed = new URL(val.trim());
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Listing URL must be a valid URL starting with http:// or https://" }
  );

/**
 * 6. Comparable Properties Schema
 */
export const CompItemSchema = z.object({
  id: z.string(),
  listing_url: SafeUrlSchema,
  revenue: z.coerce.number().min(0, "Comp revenue cannot be negative"),
  bedrooms: z.coerce.number().min(0, "Comp bedrooms cannot be negative"),
  sleeps: z.coerce.number().min(0, "Comp sleeps cannot be negative"),
  is_favourite: z.boolean().optional(),
});

/**
 * 7. Deal Tags Schema
 */
export const DealTagsSchema = z.object({
  turnkey: z.boolean(),
  furnished: z.boolean(),
  luxury: z.boolean(),
  tax_efficient: z.boolean(),
  new_construction: z.boolean(),
  existing_airbnb: z.boolean(),
  arv: z.boolean(),
  high_cash_on_cash: z.boolean(),
  low_cash_on_cash: z.boolean(),
  add_inground_pool: z.boolean(),
  waterfront: z.boolean(),
  remote: z.boolean(),
  can_support_cohost: z.boolean(),
  renovation_level: z.coerce.number().min(0).max(5),
  deal_complexity: z.coerce.number().min(0).max(5),
});

/**
 * 8. Comprehensive Underwriting Model Schema
 */
export const UnderwritingDataSchema = z
  .object({
    id: z.string(),
    zpid: z.string().min(1, "Zillow Property ID (ZPID) is required"),
    updated_at: z.string().optional(),
    bedrooms: z.coerce.number().min(0, "Bedrooms cannot be negative"),
    bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative"),
    sleep_count_low: z.coerce.number().min(0, "Sleep count low cannot be negative"),
    sleep_count_high: z.coerce.number().min(0, "Sleep count high cannot be negative"),
    purchase_details: PurchaseDetailsSchema,
    forecasted_revenue: ForecastedRevenueSchema,
    taxes: TaxesSchema,
    optimization_items: z.array(OptimizationItemSchema),
    operating_expenses: z.array(OperatingExpenseSchema),
    comp_set: z.array(CompItemSchema),
    tags: DealTagsSchema,
    deal_pitch: z.string().optional(),
    analyst_notes: z.string().optional(),
  })
  .refine(
    (data) => data.sleep_count_low <= data.sleep_count_high,
    {
      message: "Sleep capacity hierarchy invalid: Low capacity must be ≤ High capacity",
      path: ["sleep_count_high"],
    }
  );

/**
 * Validates an underwriting draft against the Zod schema.
 * Returns a typed result with sanitized error messages.
 */
export function validateUnderwritingDraft(data: unknown): {
  success: boolean;
  data?: UnderwritingData;
  errors: string[];
  fieldErrors: Record<string, string[]>;
} {
  const result = UnderwritingDataSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data as unknown as UnderwritingData,
      errors: [],
      fieldErrors: {},
    };
  }

  const flattened = result.error.flatten();
  const fieldErrors = flattened.fieldErrors as Record<string, string[]>;

  // Collect all unique user-friendly error messages with field paths
  const errorMessages: string[] = result.error.issues.map((issue) => {
    const pathStr = issue.path.join(".");
    return pathStr ? `${pathStr}: ${issue.message}` : issue.message;
  });

  return {
    success: false,
    errors: Array.from(new Set(errorMessages)),
    fieldErrors,
  };
}
