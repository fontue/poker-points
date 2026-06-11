import { Capacitor, registerPlugin } from '@capacitor/core';
import { getLevelDurationSeconds } from './game';
import type { Settings, TimerLevel, TournamentTimer } from './game';

type PokerTimerLiveActivityPlugin = {
  start(options: PokerTimerLiveActivityOptions): Promise<void>;
  update(options: PokerTimerLiveActivityOptions): Promise<void>;
  end(): Promise<void>;
};

type PokerTimerLiveActivityOptions = {
  levelIndex: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  endsAt: number;
  isRunning: boolean;
  remainingSeconds: number;
  colorUpChip?: number;
  levelStartedAt?: number;
  levels: PokerTimerLiveActivityLevel[];
};

type PokerTimerLiveActivityLevel = {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationSeconds: number;
  colorUpChip?: number;
};

const PokerTimerLiveActivity = registerPlugin<PokerTimerLiveActivityPlugin>('PokerTimerLiveActivity');

function createLiveActivityLevel(level: TimerLevel): PokerTimerLiveActivityLevel {
  return {
    smallBlind: level.smallBlind,
    bigBlind: level.bigBlind,
    ante: level.ante,
    durationSeconds: getLevelDurationSeconds(level),
    colorUpChip: level.colorUpChip || undefined
  };
}

function isInitialStoppedTimer(settings: Settings, timer: TournamentTimer) {
  const firstLevel = settings.timerLevels[0];
  if (!firstLevel) return true;

  return timer.currentLevelIndex === 0 && !timer.isRunning && timer.remainingSeconds >= getLevelDurationSeconds(firstLevel);
}

function createLiveActivityOptions(settings: Settings, timer: TournamentTimer): PokerTimerLiveActivityOptions | null {
  const level = settings.timerLevels[timer.currentLevelIndex] || settings.timerLevels[0];
  if (!level) return null;

  return {
    levelIndex: timer.currentLevelIndex,
    smallBlind: level.smallBlind,
    bigBlind: level.bigBlind,
    ante: level.ante,
    endsAt: timer.endsAt || Date.now() + timer.remainingSeconds * 1000,
    isRunning: timer.isRunning,
    remainingSeconds: timer.remainingSeconds,
    colorUpChip: level.colorUpChip || undefined,
    levelStartedAt: timer.levelStartedAt || undefined,
    levels: settings.timerLevels.map(createLiveActivityLevel)
  };
}

export async function syncNativeTimerLiveActivity(settings: Settings, timer: TournamentTimer) {
  if (!Capacitor.isNativePlatform()) return;

  if (isInitialStoppedTimer(settings, timer)) {
    await PokerTimerLiveActivity.end().catch(() => undefined);
    return;
  }

  const options = createLiveActivityOptions(settings, timer);
  if (!options) return;

  await PokerTimerLiveActivity.update(options).catch((error) => {
    console.warn('Live Activity update failed', error);
  });
}
