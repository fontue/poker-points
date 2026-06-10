import { formatNumber } from './format';
import type { TimerLevel } from './game';

let audioContext: AudioContext | null = null;

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

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.5);
}

function vibrateTimer() {
  if (!navigator.vibrate) return;
  navigator.vibrate([250, 100, 250]);
}

type PrepareTimerAlertsOptions = {
  sound: boolean;
  vibration: boolean;
};

export function prepareTimerAlerts({ sound, vibration }: PrepareTimerAlertsOptions) {
  if (sound) {
    const context = getAudioContext();
    context?.resume().catch(() => undefined);
  }

  if (vibration && navigator.vibrate) {
    navigator.vibrate(1);
  }
}

export function previewTimerSound() {
  playTimerSound();
}

export function previewTimerVibration() {
  vibrateTimer();
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
  if (vibration) vibrateTimer();
  if (notification) {
    showTimerNotification(levelIndex, level).catch(() => {
      // Notification delivery is best-effort and can fail depending on browser/PWA state.
    });
  }
}
