import { normalizeCounter } from './invariants';
import type { ColorUpChipValue, Settings, TimerLevel, TournamentTimer } from './types';

export const colorUpChipValues = [50, 100, 500, 1000] as const satisfies readonly ColorUpChipValue[];

export const colorUpChipTones: Record<ColorUpChipValue, string> = {
  50: 'bg-blue-500 text-white',
  100: 'bg-white text-zinc-950',
  500: 'bg-violet-500 text-white',
  1000: 'bg-yellow-300 text-zinc-950'
};

export const defaultTimerLevels: TimerLevel[] = [
  { smallBlind: 100, bigBlind: 200, ante: 200, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 150, bigBlind: 250, ante: 250, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 150, bigBlind: 300, ante: 300, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 200, bigBlind: 400, ante: 400, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 250, bigBlind: 500, ante: 500, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 300, bigBlind: 600, ante: 600, durationMinutes: 15, colorUpChip: 50 },
  { smallBlind: 400, bigBlind: 800, ante: 800, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 500, bigBlind: 1000, ante: 1000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 600, bigBlind: 1200, ante: 1200, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 800, bigBlind: 1600, ante: 1600, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 1000, bigBlind: 2000, ante: 2000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 1200, bigBlind: 2400, ante: 2400, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 1500, bigBlind: 3000, ante: 3000, durationMinutes: 15, colorUpChip: 100 },
  { smallBlind: 2000, bigBlind: 4000, ante: 4000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 2500, bigBlind: 5000, ante: 5000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 3000, bigBlind: 6000, ante: 6000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 4000, bigBlind: 8000, ante: 8000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 5000, bigBlind: 10000, ante: 10000, durationMinutes: 15, colorUpChip: null },
  { smallBlind: 6000, bigBlind: 12000, ante: 12000, durationMinutes: 15, colorUpChip: 500 },
  { smallBlind: 8000, bigBlind: 16000, ante: 16000, durationMinutes: 15, colorUpChip: null }
];

function normalizeColorUpChip(value: unknown): ColorUpChipValue | null {
  if (value === true) return 50;
  if (value === false || value === null || value === undefined) return null;

  const numericValue = Number(value);
  return colorUpChipValues.includes(numericValue as ColorUpChipValue) ? (numericValue as ColorUpChipValue) : null;
}

export function getLevelDurationSeconds(level: TimerLevel) {
  return Math.max(1, normalizeCounter(level.durationMinutes)) * 60;
}

export function normalizeTimerLevels(levels: unknown): TimerLevel[] {
  const rawLevels = Array.isArray(levels) ? levels : defaultTimerLevels;
  const normalized = rawLevels
    .map((level) => {
      const rawLevel = level && typeof level === 'object' ? (level as Record<string, unknown>) : {};

      return {
        smallBlind: Math.max(1, normalizeCounter(rawLevel.smallBlind)),
        bigBlind: Math.max(1, normalizeCounter(rawLevel.bigBlind)),
        ante: normalizeCounter(rawLevel.ante),
        durationMinutes: Math.max(1, normalizeCounter(rawLevel.durationMinutes)),
        colorUpChip: normalizeColorUpChip(rawLevel.colorUpChip ?? rawLevel.colorUp)
      };
    })
    .filter((level) => level.smallBlind > 0 && level.bigBlind > 0 && level.durationMinutes > 0);

  return normalized.length > 0 ? normalized : defaultTimerLevels;
}

export function createDefaultTimer(settings: Settings): TournamentTimer {
  return {
    currentLevelIndex: 0,
    remainingSeconds: getLevelDurationSeconds(settings.timerLevels[0]),
    isRunning: false,
    levelStartedAt: null,
    endsAt: null,
    lastCompletedLevelIndex: null
  };
}

export function advanceTimerToTime(timer: TournamentTimer, settings: Settings, now: number): TournamentTimer {
  if (!timer.isRunning || !timer.endsAt || !timer.levelStartedAt) return timer;

  let currentLevelIndex = timer.currentLevelIndex;
  let levelStartedAt = timer.levelStartedAt;
  let endsAt = timer.endsAt;
  let lastCompletedLevelIndex: number | null = null;
  const lastLevelIndex = Math.max(0, settings.timerLevels.length - 1);

  while (now >= endsAt && currentLevelIndex < lastLevelIndex) {
    lastCompletedLevelIndex = currentLevelIndex;
    currentLevelIndex += 1;
    levelStartedAt = endsAt;
    endsAt = levelStartedAt + getLevelDurationSeconds(settings.timerLevels[currentLevelIndex]) * 1000;
  }

  const remainingSeconds = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const isRunning = remainingSeconds > 0;

  return {
    currentLevelIndex,
    remainingSeconds,
    isRunning,
    levelStartedAt: isRunning ? levelStartedAt : null,
    endsAt: isRunning ? endsAt : null,
    lastCompletedLevelIndex
  };
}

export function normalizeTimer(timer: unknown, settings: Settings): TournamentTimer {
  const rawTimer = timer && typeof timer === 'object' ? (timer as Record<string, unknown>) : {};
  const lastLevelIndex = Math.max(0, settings.timerLevels.length - 1);
  const currentLevelIndex = Math.min(lastLevelIndex, normalizeCounter(rawTimer.currentLevelIndex));
  const defaultRemainingSeconds = getLevelDurationSeconds(settings.timerLevels[currentLevelIndex]);
  const remainingSeconds = Math.max(0, normalizeCounter(rawTimer.remainingSeconds ?? defaultRemainingSeconds));
  const levelStartedAt = Number(rawTimer.levelStartedAt);
  const endsAt = Number(rawTimer.endsAt);
  const lastCompletedLevelIndex = Number(rawTimer.lastCompletedLevelIndex);
  const normalizedTimer = {
    currentLevelIndex,
    remainingSeconds,
    isRunning: Boolean(rawTimer.isRunning),
    levelStartedAt: Number.isFinite(levelStartedAt) && levelStartedAt > 0 ? levelStartedAt : null,
    endsAt: Number.isFinite(endsAt) && endsAt > 0 ? endsAt : null,
    lastCompletedLevelIndex: Number.isFinite(lastCompletedLevelIndex) && lastCompletedLevelIndex >= 0 ? lastCompletedLevelIndex : null
  };

  return advanceTimerToTime(normalizedTimer, settings, Date.now());
}

export function syncTimerWithSettings(timer: TournamentTimer, settings: Settings): TournamentTimer {
  const lastLevelIndex = Math.max(0, settings.timerLevels.length - 1);
  const currentLevelIndex = Math.min(timer.currentLevelIndex, lastLevelIndex);
  const levelDurationSeconds = getLevelDurationSeconds(settings.timerLevels[currentLevelIndex]);
  const remainingSeconds = Math.min(timer.remainingSeconds ?? levelDurationSeconds, levelDurationSeconds);
  const now = Date.now();

  return {
    ...timer,
    currentLevelIndex,
    remainingSeconds,
    levelStartedAt: timer.isRunning ? now : null,
    endsAt: timer.isRunning ? now + remainingSeconds * 1000 : null,
    lastCompletedLevelIndex: null
  };
}

export function getNextColorUpLevelIndex(levels: TimerLevel[], fromLevelIndex: number) {
  const index = levels.findIndex((level, levelIndex) => levelIndex >= fromLevelIndex && level.colorUpChip);
  return index === -1 ? null : index;
}
