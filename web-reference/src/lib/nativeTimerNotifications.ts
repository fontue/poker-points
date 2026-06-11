import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { formatNumber } from './format';
import { getLevelDurationSeconds } from './game';
import type { Settings, TimerLevel, TournamentTimer } from './game';

const TIMER_NOTIFICATION_ID_BASE = 41000;
const MAX_SCHEDULED_LEVEL_NOTIFICATIONS = 50;

function isNativeNotificationsAvailable() {
  return Capacitor.isNativePlatform();
}

function createNotificationId(index: number) {
  return TIMER_NOTIFICATION_ID_BASE + index;
}

function formatLevelBody(level: TimerLevel) {
  return `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)}${level.ante > 0 ? ` / ${formatNumber(level.ante)}` : ''}`;
}

export async function requestNativeTimerNotificationPermission() {
  if (!isNativeNotificationsAvailable()) return false;

  const currentPermission = await LocalNotifications.checkPermissions().catch(() => null);
  if (currentPermission?.display === 'granted') return true;

  const requestedPermission = await LocalNotifications.requestPermissions().catch(() => null);
  return requestedPermission?.display === 'granted';
}

export async function cancelNativeTimerNotifications() {
  if (!isNativeNotificationsAvailable()) return;

  const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
  const timerNotifications = pending.notifications.filter((notification) => notification.id >= TIMER_NOTIFICATION_ID_BASE);

  if (timerNotifications.length > 0) {
    await LocalNotifications.cancel({ notifications: timerNotifications }).catch(() => undefined);
  }
}

export async function scheduleNativeTimerNotifications(settings: Settings, timer: TournamentTimer) {
  if (!isNativeNotificationsAvailable()) return;

  await cancelNativeTimerNotifications();

  if (!settings.timerNotificationEnabled || !timer.isRunning || !timer.endsAt) return;

  const permission = await LocalNotifications.checkPermissions().catch(() => null);
  if (permission?.display !== 'granted') return;

  const notifications = [];
  let triggerAt = timer.endsAt;

  for (
    let levelIndex = timer.currentLevelIndex + 1;
    levelIndex < settings.timerLevels.length && notifications.length < MAX_SCHEDULED_LEVEL_NOTIFICATIONS;
    levelIndex += 1
  ) {
    const level = settings.timerLevels[levelIndex];
    notifications.push({
      id: createNotificationId(levelIndex),
      title: `Уровень ${levelIndex + 1}`,
      body: formatLevelBody(level),
      schedule: { at: new Date(triggerAt) },
      sound: 'default'
    });

    triggerAt += getLevelDurationSeconds(level) * 1000;
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications }).catch(() => undefined);
  }
}
