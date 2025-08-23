export interface Player {
  id: number;
  name: string;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
  team: string;
}

export interface GameweekHistory {
  gameweek: number;
  points: number;
  totalPoints: number;
}

export interface Team {
  id: number;
  teamName: string;
  managerName: string;
  players: Player[];
  gameweekHistory: GameweekHistory[];
  liveGwPoints?: number;
  liveCaptain?: { name: string; points: number; captainedPoints: number; };
  liveBenchPoints?: number;
}

export interface AiAnalysisResult {
  score: number;
  justification: string;
}

export enum View {
  Dashboard = 'dashboard',
  Chart = 'chart',
  Rankings = 'rankings',
}

export interface KeyMatch {
    match: string;
    justification: string;
}

export interface PredictedStanding {
  rank: number;
  teamName: string;
  justification: string;
}

export interface PlayerOwnership {
  id: number;
  name: string;
  count: number;
  percentage: number;
}

// FPL API Response Types
export interface FplLeague {
  league: {
    id: number;
    name: string;
  };
  standings: {
    results: FplStanding[];
  };
}

export interface FplStanding {
  entry: number;
  player_name: string;
  entry_name: string;
  total: number;
}

export interface FplHistory {
    current: FplGameweekHistory[];
}

export interface FplGameweekHistory {
    event: number;
    points: number;
    total_points: number;
}

export interface FplPicks {
    picks: FplPick[];
}

export interface FplPick {
    element: number; // player id
    position: number; // 1-15
    is_captain: boolean;
    multiplier: number;
}

export interface FplBootstrap {
    events: { id: number; is_current: boolean, is_next: boolean }[];
    elements: FplPlayer[];
    teams: FplTeamInfo[];
    element_types: FplPosition[];
}

export interface FplPlayer {
    id: number;
    first_name: string;
    second_name: string;
    team: number; // team id
    element_type: number; // position id
}

export interface FplTeamInfo {
    id: number;
    name: string;
}

export interface FplPosition {
    id: number;
    singular_name_short: 'GKP' | 'DEF' | 'MID' | 'FWD';
}

export interface FplFixture {
  id: number;
  kickoff_time: string;
  team_h: number;
  team_a: number;
}

export interface FplLiveElement {
    id: number;
    stats: {
        total_points: number;
    };
}

export interface FplLiveGameweek {
    elements: FplLiveElement[];
}