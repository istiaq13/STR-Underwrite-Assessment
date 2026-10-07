export type Rating = "best" | "medium" | "low";
export type UnderwritingStatus = "not_started" | "in_progress" | "submitted";

export interface Property {
  zpid: string;
  market_id: number;
  market_name: string;
  address: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  price: string;
  unformatted_price: number;
  beds: number;
  baths: number;
  area: number;
  latitude: number;
  longitude: number;
  home_type: string;
  home_status: string;
  time_on_zillow: string;
  img_src: string;
  detail_url: string;
  status: UnderwritingStatus;
  attempts: number;
  latest_accuracy: number | null;
  latest_rating: Rating | null;
  best_accuracy: number | null;
  best_rating: Rating | null;
  active_underwriting_id: string | null;
  latest_submission_id: string | null;
}
