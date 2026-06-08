import type { Player, Settings, Totals } from './types';

export function calculateTotals(players: Player[], settings: Settings): Totals {
  const totalBuyIns = players.reduce((sum, player) => sum + player.buyIns, 0);
  const paidTokens = players.reduce((sum, player) => sum + player.paidToken, 0);
  const activePlayersCount = players.filter((player) => !player.isEliminated).length;
  const chipsInGame = totalBuyIns * settings.buyInChips;
  const pointsInGame = totalBuyIns * settings.buyInPoints;

  return {
    pointsInGame,
    pointsPaidByTokens: paidTokens * settings.buyInPoints,
    prizePoints: Math.max(0, pointsInGame - settings.commission),
    chipsInGame,
    activePlayersCount,
    averageStack: activePlayersCount > 0 ? Math.floor(chipsInGame / activePlayersCount) : 0
  };
}
