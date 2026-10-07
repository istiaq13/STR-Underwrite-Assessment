import { Rating, ScoreBreakdown } from "@/types";
import { formatCurrency, round } from "@/lib/calculations";

export class ScoringService {
  static readonly BEST_THRESHOLD = 0.1; // 10%
  static readonly MEDIUM_THRESHOLD = 0.25; // 25%

  static evaluateSubmission(candidateMid: number, referenceMid: number): ScoreBreakdown {
    const bestMin = round(referenceMid * (1 - this.BEST_THRESHOLD));
    const bestMax = round(referenceMid * (1 + this.BEST_THRESHOLD));
    const mediumMin = round(referenceMid * (1 - this.MEDIUM_THRESHOLD));
    const mediumMax = round(referenceMid * (1 + this.MEDIUM_THRESHOLD));

    if (!candidateMid || candidateMid <= 0 || referenceMid <= 0) {
      return {
        rating: "low",
        accuracy: 40,
        metric: "mid_gross_revenue",
        label: "Mid Revenue Forecast",
        candidate: candidateMid || 0,
        reference: referenceMid,
        deviation: 1.0,
        deviation_percentage: 100,
        difference_amount: referenceMid,
        best_threshold: this.BEST_THRESHOLD,
        medium_threshold: this.MEDIUM_THRESHOLD,
        best_min: bestMin,
        best_max: bestMax,
        medium_min: mediumMin,
        medium_max: mediumMax,
        feedback: "No valid mid revenue forecast provided. A forecast is required for analyst grading.",
      };
    }

    const deviation = Math.abs(candidateMid - referenceMid) / referenceMid;
    const deviationPercentage = round(deviation * 100, 2);
    const differenceAmount = round(candidateMid - referenceMid);

    let rating: Rating = "low";
    let accuracy = 40;
    let feedback = "";

    const directionText =
      differenceAmount > 0
        ? `${deviationPercentage}% above the analyst's reference`
        : differenceAmount < 0
        ? `${deviationPercentage}% below the analyst's reference`
        : "exact match with the analyst's reference";

    if (deviation <= this.BEST_THRESHOLD + 0.000001) {
      rating = "best";
      accuracy = 100;
      feedback = `Exceptional accuracy! Your mid forecast of ${formatCurrency(
        candidateMid
      )} is ${directionText} (within the ±10% target band). Outstanding underwriting intuition!`;
    } else if (deviation <= this.MEDIUM_THRESHOLD + 0.000001) {
      rating = "medium";
      accuracy = 70;
      feedback = `Solid effort. Your mid forecast of ${formatCurrency(
        candidateMid
      )} is ${directionText} (within the ±25% target band). Fine-tune comps and seasonality to reach the top tier.`;
    } else {
      rating = "low";
      accuracy = 40;
      feedback = `Out of range. Your mid forecast of ${formatCurrency(
        candidateMid
      )} is ${directionText}, exceeding the 25% deviation threshold. Re-examine comparable properties and market rates.`;
    }

    return {
      rating,
      accuracy,
      metric: "mid_gross_revenue",
      label: "Mid Revenue Forecast",
      candidate: candidateMid,
      reference: referenceMid,
      deviation: round(deviation, 4),
      deviation_percentage: deviationPercentage,
      difference_amount: differenceAmount,
      best_threshold: this.BEST_THRESHOLD,
      medium_threshold: this.MEDIUM_THRESHOLD,
      best_min: bestMin,
      best_max: bestMax,
      medium_min: mediumMin,
      medium_max: mediumMax,
      feedback,
    };
  }
}
