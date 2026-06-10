import { normalizeCounter } from './invariants';
import { normalizePrizeDistribution, normalizePrizeRoundingStep } from './prizes';
import type { Settings } from './types';

type SettingsInput = Partial<Record<keyof Settings, unknown>> & {
  commission?: unknown;
};

export const defaultSettings: Settings = {
  buyInPoints: 1000,
  buyInChips: 20000,
  prizeAdjustmentPoints: 0,
  prizePlaces: 3,
  prizeDistribution: [50, 30, 20],
  prizeRoundingStep: 100
};

function normalizeSignedInteger(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.floor(num) : fallback;
}

export function normalizeSettings(settings: SettingsInput = {}): Settings {
  const prizePlaces = Math.max(1, normalizeCounter(settings.prizePlaces ?? defaultSettings.prizePlaces));
  const rawPrizeAdjustment = settings.prizeAdjustmentPoints ?? settings.commission;

  return {
    buyInPoints: Math.max(1, normalizeCounter(settings.buyInPoints ?? defaultSettings.buyInPoints)),
    buyInChips: Math.max(1, normalizeCounter(settings.buyInChips ?? defaultSettings.buyInChips)),
    prizeAdjustmentPoints: normalizeSignedInteger(rawPrizeAdjustment, defaultSettings.prizeAdjustmentPoints),
    prizePlaces,
    prizeDistribution: normalizePrizeDistribution(settings.prizeDistribution, prizePlaces),
    prizeRoundingStep: normalizePrizeRoundingStep(settings.prizeRoundingStep ?? defaultSettings.prizeRoundingStep)
  };
}
