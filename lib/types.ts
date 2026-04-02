export type UserRole = "admin" | "player";
export type Handedness = "right" | "left" | "ambidextrous";
export type MatchStatus = "completed" | "incomplete" | "canceled";
export type MatchType = "singles";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  playerId: string | null;
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  email: string;
  handedness: Handedness;
  active: boolean;
}

export interface Match {
  id: string;
  playerOneId: string;
  playerTwoId: string;
  winnerId: string;
  matchType: MatchType;
  status: MatchStatus;
  playedAt: string;
  createdByUserId: string;
  notes: string;
}

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  playerOneGames: number;
  playerTwoGames: number;
}

export interface AppStore {
  users: User[];
  players: Player[];
  matches: Match[];
  matchSets: MatchSet[];
}

export interface MatchSetInput {
  playerOneGames: number;
  playerTwoGames: number;
}

export interface CreateMatchInput {
  playerOneId: string;
  playerTwoId: string;
  playedAt: string;
  status: MatchStatus;
  matchType: MatchType;
  sets: MatchSetInput[];
  winnerId: string;
  createdByUserId: string;
  notes?: string;
}

export interface LeaderboardRow {
  playerId: string;
  playerName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  winPercentage: number;
  setsWon: number;
  setsLost: number;
  setDifferential: number;
}

export interface HeadToHeadSummary {
  players: [Player, Player];
  totalMeetings: number;
  wins: Record<string, number>;
  setsWon: Record<string, number>;
  recentMatches: Array<{
    id: string;
    playedAt: string;
    winnerId: string;
    scoreline: string;
    notes: string;
  }>;
}
