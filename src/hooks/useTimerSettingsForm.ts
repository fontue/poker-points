import { useState } from 'react';
import { normalizeNumberInput } from '@/lib/format';
import { defaultTimerLevels } from '@/lib/game';
import type { ColorUpChipValue, Settings, TimerLevel } from '@/lib/game';

export type TimerLevelValues = {
  id: string;
  smallBlind: string;
  bigBlind: string;
  ante: string;
  durationMinutes: string;
  colorUpChip: ColorUpChipValue | null;
};

let timerLevelId = 0;

function createTimerLevelId() {
  timerLevelId += 1;
  return `timer-level-${timerLevelId}`;
}

function createTimerLevelValues(levels: TimerLevel[]): TimerLevelValues[] {
  return levels.map((level) => ({
    id: createTimerLevelId(),
    smallBlind: String(level.smallBlind || ''),
    bigBlind: String(level.bigBlind || ''),
    ante: String(level.ante || ''),
    durationMinutes: String(level.durationMinutes || ''),
    colorUpChip: level.colorUpChip
  }));
}

function parseTimerLevels(levels: TimerLevelValues[]): TimerLevel[] {
  return levels.map((level) => ({
    smallBlind: Number(level.smallBlind) || 0,
    bigBlind: Number(level.bigBlind) || 0,
    ante: Number(level.ante) || 0,
    durationMinutes: Number(level.durationMinutes) || 0,
    colorUpChip: level.colorUpChip
  }));
}

export function useTimerSettingsForm(settings: Settings) {
  const [timerLevels, setTimerLevels] = useState(() => createTimerLevelValues(settings.timerLevels));
  const sharedDuration = timerLevels.every((level) => level.durationMinutes === timerLevels[0]?.durationMinutes)
    ? timerLevels[0]?.durationMinutes || ''
    : '';
  const [globalDurationMinutes, setGlobalDurationMinutes] = useState(sharedDuration);

  function updateTimerLevel(index: number, key: keyof TimerLevelValues, value: string | ColorUpChipValue | null) {
    setTimerLevels((prev) =>
      prev.map((level, levelIndex) =>
        levelIndex === index
          ? {
              ...level,
              [key]: typeof value === 'string' ? normalizeNumberInput(value) : value
            }
          : level
      )
    );
  }

  function updateGlobalDuration(value: string) {
    setGlobalDurationMinutes(normalizeNumberInput(value));
  }

  function applyDurationToAll(duration = globalDurationMinutes) {
    const nextDuration = normalizeNumberInput(duration);
    if (!nextDuration) return;

    setGlobalDurationMinutes(nextDuration);
    setTimerLevels((prev) => prev.map((level) => ({ ...level, durationMinutes: nextDuration })));
  }

  function clearAnteForAll() {
    setTimerLevels((prev) => prev.map((level) => ({ ...level, ante: '0' })));
  }

  function setAnteToBigBlindForAll() {
    setTimerLevels((prev) => prev.map((level) => ({ ...level, ante: level.bigBlind || '0' })));
  }

  function addTimerLevel() {
    const previous = timerLevels[timerLevels.length - 1];
    setTimerLevels((prev) => [
      ...prev,
      {
        id: createTimerLevelId(),
        smallBlind: previous ? String(Math.max(1, Number(previous.smallBlind) * 2 || 1)) : '100',
        bigBlind: previous ? String(Math.max(1, Number(previous.bigBlind) * 2 || 1)) : '200',
        ante: previous?.ante || '0',
        durationMinutes: previous?.durationMinutes || '20',
        colorUpChip: null
      }
    ]);
  }

  function removeTimerLevel(index: number) {
    setTimerLevels((prev) => (prev.length <= 1 ? prev : prev.filter((_, levelIndex) => levelIndex !== index)));
  }

  function resetToDefaultLevels() {
    const nextLevels = createTimerLevelValues(defaultTimerLevels);
    const nextSharedDuration = nextLevels.every((level) => level.durationMinutes === nextLevels[0]?.durationMinutes)
      ? nextLevels[0]?.durationMinutes || ''
      : '';

    setTimerLevels(nextLevels);
    setGlobalDurationMinutes(nextSharedDuration);
  }

  function createSettingsPatch(): Partial<Settings> {
    return {
      timerLevels: parseTimerLevels(timerLevels)
    };
  }

  return {
    timerLevels,
    globalDurationMinutes,
    updateTimerLevel,
    updateGlobalDuration,
    applyDurationToAll,
    clearAnteForAll,
    setAnteToBigBlindForAll,
    addTimerLevel,
    removeTimerLevel,
    resetToDefaultLevels,
    createSettingsPatch
  };
}
