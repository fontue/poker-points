import type { Player, Settings, Totals } from './types';

export function calculateTotals(players: Player[], settings: Settings): Totals {
  const totalBuyIns = players.reduce((sum, player) => sum + player.buyIns, 0);
  const paidEntries = players.reduce((sum, player) => sum + player.paidEntries, 0);
  const activePlayersCount = players.filter((player) => !player.isEliminated).length;
  const chipsInGame = totalBuyIns * settings.buyInChips;
  const pointsInGame = totalBuyIns * settings.buyInPoints;

  return {
    pointsInGame,
    pointsPaidByTokens: paidEntries * settings.buyInPoints,
    prizePoints: Math.max(0, pointsInGame - settings.prizeAdjustmentPoints),
    chipsInGame,
    activePlayersCount,
    averageStack: activePlayersCount > 0 ? Math.floor(chipsInGame / activePlayersCount) : 0
  };
}
