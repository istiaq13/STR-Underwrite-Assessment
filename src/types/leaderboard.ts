export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  role: string;
  avatar: string;
  completed_deals: number;
  best_score: number;
  average_accuracy: number;
  best_rating_count: number;
  streak: number;
  is_current_user?: boolean;
}
