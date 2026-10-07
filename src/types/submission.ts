import { Rating } from "./property";
import { UnderwritingData } from "./underwriting";

export interface ScoreBreakdown {
  rating: Rating;
  accuracy: number;
  metric: string;
  label: string;
  candidate: number;
  reference: number;
  deviation: number;
  deviation_percentage: number;
  difference_amount: number;
  best_threshold: number;
  medium_threshold: number;
  best_min: number;
  best_max: number;
  medium_min: number;
  medium_max: number;
  feedback: string;
}

export interface SubmissionRecord {
  id: string;
  underwriting_id: string;
  zpid: string;
  property_address: string;
  rating: Rating;
  accuracy: number;
  breakdown: ScoreBreakdown;
  submitted_at: string;
  trainee_underwriting: UnderwritingData;
  reference_underwriting: UnderwritingData;
}
