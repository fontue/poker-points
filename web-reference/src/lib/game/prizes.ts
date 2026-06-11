import type { Player, PrizePayout, Settings } from './types';
import { normalizeCounter } from './invariants';

export function createEqualPrizeDistribution(prizePlaces: number): number[] {
  const places = Math.max(1, normalizeCounter(prizePlaces));
  const basePercent = Math.floor(100 / places);
  const distribution = Array.from({ length: places }, () => basePercent);
  distribution[0] += 100 - basePercent * places;
  return distribution;
}

export function normalizePrizeDistribution(distribution: unknown, prizePlaces: number): number[] {
  const places = Math.max(1, normalizeCounter(prizePlaces));
  const rawDistribution = Array.isArray(distribution) ? distribution : [];
  const normalized = rawDistribution.slice(0, places).map(normalizeCounter);

  if (normalized.length < places) {
    const fallback = createEqualPrizeDistribution(places);
    return [...normalized, ...fallback.slice(normalized.length)];
  }

  return normalized;
}

export function normalizePrizeRoundingStep(value: unknown): number {
  return Math.max(1, normalizeCounter(value));
}

export function getNormalizedPrizeShares(settings: Settings): number[] {
  const distribution = normalizePrizeDistribution(settings.prizeDistribution, settings.prizePlaces);
  const totalPercent = distribution.reduce((sum, percent) => sum + percent, 0);
  if (totalPercent > 0) return distribution.map((percent) => percent / totalPercent);

  const equalDistribution = createEqualPrizeDistribution(settings.prizePlaces);
  return equalDistribution.map((percent) => percent / 100);
}

export function calculatePrizeAmounts(prizePoolPoints: number, settings: Settings): number[] {
  const percentages = getNormalizedPrizeShares(settings);
  const step = normalizePrizeRoundingStep(settings.prizeRoundingStep);
  const rawAmounts = percentages.map((percent) => prizePoolPoints * percent);
  const amounts = rawAmounts.map((amount) => Math.floor(amount / step) * step);
  let remaining = prizePoolPoints - amounts.reduce((sum, amount) => sum + amount, 0);

  const remainderOrder = rawAmounts
    .map((amount, index) => ({ index, remainder: amount - amounts[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  while (remaining >= step && remainderOrder.length > 0) {
    for (const { index } of remainderOrder) {
      if (remaining < step) break;
      amounts[index] += step;
      remaining -= step;
    }
  }

  return amounts;
}

export function calculateEffectivePrizePercent(amount: number, prizePoolPoints: number): number {
  return prizePoolPoints > 0 ? (amount / prizePoolPoints) * 100 : 0;
}

export function getPlayerByPrizePlace(players: Player[], eliminatedPlaces: Map<string, number>, place: number): Player | null {
  return players.find((player) => eliminatedPlaces.get(player.id) === place) || null;
}

export function calculatePrizePayouts(
  prizePoolPoints: number,
  settings: Settings,
  players: Player[],
  eliminatedPlaces: Map<string, number>
): PrizePayout[] {
  const prizePlaces = Math.max(1, normalizeCounter(settings.prizePlaces));
  const amounts = calculatePrizeAmounts(prizePoolPoints, settings);
  const distribution = normalizePrizeDistribution(settings.prizeDistribution, prizePlaces);

  return Array.from({ length: prizePlaces }, (_, index) => {
    const place = index + 1;
    const player = getPlayerByPrizePlace(players, eliminatedPlaces, place);

    return {
      place,
      percent: distribution[index] || 0,
      amount: amounts[index] || 0,
      effectivePercent: calculateEffectivePrizePercent(amounts[index] || 0, prizePoolPoints),
      playerName: player?.name || null
    };
  });
}
