export interface Market {
  id: number;
  slug: string;
  name: string;
  state: string | null;
  region: string | null;
  country?: string;
  timezone: string | null;
  description: string | null;
  is_active?: boolean;
  property_count: number;
  created_at?: string | null;
}

export interface MarketListResult {
  items: Market[];
  total: number;
}

