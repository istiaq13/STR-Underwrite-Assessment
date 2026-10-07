import { Property, UnderwritingData } from "@/types";
import { calculateUnderwriting } from "@/lib/calculations";
import { createUnderwriting, fetchUnderwriting } from "@/lib/api";

export class UnderwritingService {
  static async createDraft(property: Property): Promise<UnderwritingData> {
    return createUnderwriting(property.zpid);
  }

  static async getReference(referenceUnderwritingId: number | string): Promise<UnderwritingData> {
    return fetchUnderwriting(referenceUnderwritingId);
  }

  static recalculate(draft: UnderwritingData): UnderwritingData {
    return {
      ...draft,
      updated_at: new Date().toISOString(),
      calculations: calculateUnderwriting(
        draft.purchase_details,
        draft.forecasted_revenue,
        draft.taxes,
        draft.optimization_items,
        draft.operating_expenses
      ),
    };
  }
}
