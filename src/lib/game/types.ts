export type PlayerCounterField = 'buyIns' | 'paidEntries';
export type ColorUpChipValue = 50 | 100 | 500 | 1000;

export interface TimerLevel {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationMinutes: number;
  colorUpChip: ColorUpChipValue | null;
}

export interface Settings {
  buyInPoints: number;
  buyInChips: number;
  prizeAdjustmentPoints: number;
  prizePlaces: number;
  prizeDistribution: number[];
  prizeRoundingStep: number;
  timerLevels: TimerLevel[];
}

export interface TournamentTimer {
  currentLevelIndex: number;
  remainingSeconds: number;
  isRunning: boolean;
  levelStartedAt: number | null;
  endsAt: number | null;
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
  timer: TournamentTimer;
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
