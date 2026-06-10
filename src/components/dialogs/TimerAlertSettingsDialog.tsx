import { Button } from '@/components/ui/button';
import { prepareTimerAlerts, previewTimerSound, previewTimerVibration } from '@/lib/timerAlerts';
import { AppDialog } from './AppDialog';
import type { Settings } from '@/lib/game';

type TimerAlertSettingsDialogProps = {
  settings: Settings;
  onChange: (settingsPatch: Partial<Settings>) => void;
  onClose: () => void;
};

type TimerAlertToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

function TimerAlertToggle({ label, description, checked, disabled = false, onChange }: TimerAlertToggleProps) {
  return (
    <label className={`flex items-center justify-between gap-4 rounded-2xl bg-zinc-900 px-4 py-3 text-left ring-1 ring-white/10 ${disabled ? 'opacity-60' : ''}`}>
      <span>
        <span className="block text-sm font-black text-zinc-100">{label}</span>
        <span className="mt-1 block text-xs font-bold text-zinc-500">{description}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${checked ? 'bg-violet-600' : 'bg-zinc-700'}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
      </span>
    </label>
  );
}

function getNotificationStatus() {
  if (typeof Notification === 'undefined') {
    return {
      disabled: true,
      permission: 'unsupported',
      description: 'Браузер не поддерживает системные уведомления.'
    };
  }

  if (!window.isSecureContext) {
    return {
      disabled: true,
      permission: Notification.permission,
      description: 'Нужен HTTPS или установленное PWA.'
    };
  }

  if (Notification.permission === 'denied') {
    return {
      disabled: true,
      permission: Notification.permission,
      description: 'Разрешение запрещено в настройках браузера.'
    };
  }

  return {
    disabled: false,
    permission: Notification.permission,
    description: Notification.permission === 'granted' ? 'Показывать системное уведомление.' : 'Нужно разрешение браузера.'
  };
}

export function TimerAlertSettingsDialog({ settings, onChange, onClose }: TimerAlertSettingsDialogProps) {
  const notificationStatus = getNotificationStatus();

  function updateSound(checked: boolean) {
    if (checked) {
      prepareTimerAlerts({ sound: true, vibration: false });
      previewTimerSound();
    }
    onChange({ timerSoundEnabled: checked });
  }

  function updateVibration(checked: boolean) {
    if (checked) {
      prepareTimerAlerts({ sound: false, vibration: true });
      previewTimerVibration();
    }
    onChange({ timerVibrationEnabled: checked });
  }

  async function updateNotifications(checked: boolean) {
    if (!checked) {
      onChange({ timerNotificationEnabled: false });
      return;
    }

    if (typeof Notification === 'undefined' || !window.isSecureContext) {
      onChange({ timerNotificationEnabled: false });
      return;
    }

    const permission =
      Notification.permission === 'default'
        ? await Notification.requestPermission().catch(() => 'default' as NotificationPermission)
        : Notification.permission;
    onChange({ timerNotificationEnabled: permission === 'granted' });
  }

  return (
    <AppDialog onClose={onClose}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Настройки уведомлений</h3>
        <p className="mt-1 text-sm text-zinc-400">Сигналы при автоматической смене уровня.</p>
      </div>

      <div className="space-y-3">
        <TimerAlertToggle
          label="Звук"
          description="Короткий сигнал при переходе уровня."
          checked={settings.timerSoundEnabled}
          onChange={updateSound}
        />
        <TimerAlertToggle
          label="Вибрация"
          description="Сработает на устройствах с поддержкой вибрации."
          checked={settings.timerVibrationEnabled}
          onChange={updateVibration}
        />
        <TimerAlertToggle
          label="Уведомления"
          description={notificationStatus.description}
          checked={settings.timerNotificationEnabled && notificationStatus.permission === 'granted'}
          disabled={notificationStatus.disabled}
          onChange={updateNotifications}
        />
      </div>

      <div className="mt-4 grid">
        <Button onClick={onClose} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
