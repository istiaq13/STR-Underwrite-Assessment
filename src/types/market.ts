export interface Market {
  id: number;
  slug: string;
  name: string;
  state: string | null;
  region: string;
  timezone: string;
  description: string;
  property_count: number;
}
