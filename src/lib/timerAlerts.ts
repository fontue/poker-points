import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { formatNumber } from './format';
import type { TimerLevel } from './game';

let audioContext: AudioContext | null = null;
const timerAlertVibrationPattern = [450, 180, 450, 180, 450, 180, 450, 180, 450, 180, 450, 180, 450, 180, 450];

function getAudioContext() {
  if (audioContext) return audioContext;
  if (!window.AudioContext) return null;

  audioContext = new AudioContext();
  return audioContext;
}

function playTimerSound() {
  const context = getAudioContext();
  if (!context) return;

  context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const duration = 4;

  oscillator.type = 'square';
  gain.gain.setValueAtTime(0.001, now);

  for (let time = 0; time < duration; time += 0.5) {
    const startsAt = now + time;
    oscillator.frequency.setValueAtTime(time % 1 === 0 ? 1200 : 880, startsAt);
    gain.gain.setValueAtTime(0.001, startsAt);
    gain.gain.linearRampToValueAtTime(0.24, startsAt + 0.02);
    gain.gain.setValueAtTime(0.24, startsAt + 0.28);
    gain.gain.linearRampToValueAtTime(0.001, startsAt + 0.34);
  }

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(now + duration);
}

async function vibrateTimer() {
  if (Capacitor.isNativePlatform()) {
    Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    Haptics.vibrate({ duration: 4000 }).catch(() => undefined);

    for (let index = 0; index < 16; index += 1) {
      window.setTimeout(() => {
        Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => undefined);
      }, index * 250);
    }

    window.setTimeout(() => {
      Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    }, 2000);
    return;
  }

  if (navigator.vibrate) {
    navigator.vibrate(timerAlertVibrationPattern);
  }
}

type PrepareTimerAlertsOptions = {
  sound: boolean;
};

export function prepareTimerAlerts({ sound }: PrepareTimerAlertsOptions) {
  if (sound) {
    const context = getAudioContext();
    context?.resume().catch(() => undefined);
  }
}

export function previewTimerSound() {
  playTimerSound();
}

export function previewTimerVibration() {
  vibrateTimer().catch(() => undefined);
}

async function showTimerNotification(levelIndex: number, level: TimerLevel) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const title = `Уровень ${levelIndex + 1}`;
  const body = `${formatNumber(level.smallBlind)} / ${formatNumber(level.bigBlind)}${level.ante > 0 ? ` · ante ${formatNumber(level.ante)}` : ''}`;

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag: 'poker-points-timer-level',
      silent: false
    });
    return;
  }

  new Notification(title, { body, tag: 'poker-points-timer-level' });
}

type TriggerTimerLevelAlertOptions = {
  sound: boolean;
  vibration: boolean;
  notification: boolean;
  levelIndex: number;
  level: TimerLevel;
};

export function triggerTimerLevelAlert({ sound, vibration, notification, levelIndex, level }: TriggerTimerLevelAlertOptions) {
  if (sound) playTimerSound();
  if (vibration) vibrateTimer().catch(() => undefined);
  if (notification) {
    showTimerNotification(levelIndex, level).catch(() => {
      // Notification delivery is best-effort and can fail depending on browser/PWA state.
    });
  }
}
