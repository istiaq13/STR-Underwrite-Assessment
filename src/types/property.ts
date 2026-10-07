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
  submission_count?: number;
}

export interface DashboardSummary {
  total_properties: number;
  submitted: number;
  in_progress: number;
  not_started: number;
  average_accuracy: number | null;
}

export interface BackendDashboardProperty {
  zpid: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  price: string | null;
  unformatted_price: string | number | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  img_src: string | null;
  detail_url: string | null;
  home_type: string | null;
  market_id: number | null;
  market_name: string | null;
  status: string;
  attempts: number;
  latest_accuracy: number | null;
  latest_rating: Rating | null;
  best_accuracy: number | null;
  best_rating: Rating | null;
  active_underwriting_id: number | null;
  latest_submission_id: number | null;
}

export interface DashboardApiResponse {
  summary: DashboardSummary;
  properties: BackendDashboardProperty[];
}

export interface PropertyRead {
  zpid: string;
  img_src?: string | null;
  detail_url?: string | null;
  price?: string | null;
  unformatted_price?: string | null;
  address?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zipcode?: string | null;
  beds?: number | null;
  baths?: number | null;
  area?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  home_type?: string | null;
  home_status?: string | null;
  time_on_zillow?: string | null;
  flex_text?: string | null;
  market_id?: number | null;
  market?: { id: number; name: string; slug?: string } | null;
  created_at?: string | null;
}

