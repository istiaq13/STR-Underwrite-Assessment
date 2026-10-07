import { Property, UnderwritingData } from "@/types";
import { REFERENCE_UNDERWRITINGS, createDraftUnderwriting } from "@/lib/mockData";
import { calculateUnderwriting } from "@/lib/calculations";

export class UnderwritingService {
  static createDraft(property: Property): UnderwritingData {
    return createDraftUnderwriting(property);
  }

  static getReference(zpid: string): UnderwritingData | undefined {
    return REFERENCE_UNDERWRITINGS[zpid];
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
