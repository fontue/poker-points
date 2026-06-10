export type PlayerCounterField = 'buyIns' | 'paidEntries';

export interface Settings {
  buyInPoints: number;
  buyInChips: number;
  prizeAdjustmentPoints: number;
  prizePlaces: number;
  prizeDistribution: number[];
  prizeRoundingStep: number;
}

export interface Player {
  id: string;
  name: string;
  buyIns: number;
  paidEntries: number;
  isEliminated: boolean;
  eliminatedAt: number | null;
}

export interface TournamentState {
  settings: Settings;
  players: Player[];
}

export interface Totals {
  pointsInGame: number;
  pointsPaidByTokens: number;
  prizePoints: number;
  chipsInGame: number;
  activePlayersCount: number;
  averageStack: number;
}

export interface PrizePayout {
  place: number;
  percent: number;
  effectivePercent: number;
  amount: number;
  playerName: string | null;
}
