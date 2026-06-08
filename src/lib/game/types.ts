export type PlayerCounterField = 'buyIns' | 'paidToken';

export type Settings = {
  buyInPoints: number;
  buyInChips: number;
  commission: number;
};

export type Player = {
  id: string;
  name: string;
  buyIns: number;
  paidToken: number;
  isEliminated: boolean;
  eliminatedAt: number | null;
};

export type TournamentState = {
  settings: Settings;
  players: Player[];
};

export type Totals = {
  pointsInGame: number;
  pointsPaidByTokens: number;
  prizePoints: number;
  chipsInGame: number;
  activePlayersCount: number;
  averageStack: number;
};
