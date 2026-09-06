export type ViewerRole = 'SCORER' | 'VIEWER';

export type MatchStatus =
  | 'INNINGS_1'
  | 'INNINGS_BREAK'
  | 'INNINGS_2'
  | 'COMPLETED';

export type EventType = 'RUN' | 'WICKET' | 'WIDE' | 'NO_BALL';

export interface InningsScore {
  score: number;
  wickets: number;
  overs: string;
}

export interface MatchResult {
  winner: string | null;
  type: 'RUNS' | 'CHASE' | 'TIE' | string;
  margin: number;
}

export interface Match {
  match_id: number;
  team_1: string;
  team_2: string;
  overs_per_innings: number;
  current_innings: number;
  status: MatchStatus;
  scorer_active: boolean;
  viewer_role: ViewerRole;
  innings_1: InningsScore;
  innings_2: InningsScore;
  result: MatchResult | null;
  recent_events?: string[];
}

export interface MatchCreateRequest {
  team_1: string;
  team_2: string;
  overs: number;
}

export interface MatchCreateResponse {
  match_id: number;
  status: string;
}

export interface ScoringEventRequest {
  type: EventType;
  runs?: number;
}
