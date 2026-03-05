export type MatchStatus = "PENDING" | "LIVE" | "FINISHED";

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeCountryCode?: string;  // ISO 3166-1 alpha-2 for flags (flagcdn.com)
  awayCountryCode?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  kickoff: string;
  league: string;
  leagueLogo?: string;
}

export type ManagerId =
  | "ruggeri"
  | "bilardo"
  | "mourinho"
  | "guardiola"
  | "alfaro"
  | "scaloni"
  | "cristiano"
  | "piojo";

export interface Manager {
  id: ManagerId;
  name: string;
  shortName: string;
  /** Path to avatar image in /avatars/ (e.g. /avatars/ruggeri.png), or emoji fallback */
  avatar: string;
  color: string;
  quote: string;
}

export interface Prediction {
  homeScore: number;
  awayScore: number;
  phrase: string;
  managerId: ManagerId;
}

export interface UserPrediction {
  matchId: string;
  managerId: ManagerId;
  followedManager: boolean;
  homeScore: number;
  awayScore: number;
  savedAt: string;
}
