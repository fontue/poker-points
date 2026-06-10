import { Button } from '@/components/ui/button';
import { useTimerSettingsForm } from '@/hooks/useTimerSettingsForm';
import { AppDialog } from './AppDialog';
import { TimerLevelsEditor } from './settings/TimerLevelsEditor';
import type { Settings } from '@/lib/game';

type TimerSettingsDialogProps = {
  settings: Settings;
  onChange: (settingsPatch: Partial<Settings>) => void;
  onClose: () => void;
};

export function TimerSettingsDialog({ settings, onChange, onClose }: TimerSettingsDialogProps) {
  const form = useTimerSettingsForm(settings);

  function saveAndClose() {
    onChange(form.createSettingsPatch());
    onClose();
  }

  return (
    <AppDialog align="top" onClose={saveAndClose}>
      <div className="mb-4 flex items-start justify-center gap-3">
        <div>
          <h3 className="text-lg font-bold">Настройки таймера</h3>
          <p className="mt-1 text-sm text-zinc-400">Уровни, длительность и color up.</p>
        </div>
      </div>

      <TimerLevelsEditor
        levels={form.timerLevels}
        globalDurationMinutes={form.globalDurationMinutes}
        onChange={form.updateTimerLevel}
        onGlobalDurationChange={form.updateGlobalDuration}
        onApplyDurationToAll={form.applyDurationToAll}
        onClearAnteForAll={form.clearAnteForAll}
        onSetAnteToBigBlindForAll={form.setAnteToBigBlindForAll}
        onAdd={form.addTimerLevel}
        onRemove={form.removeTimerLevel}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={form.resetToDefaultLevels} className="h-12 rounded-2xl bg-zinc-700 font-bold text-zinc-100">
          Сбросить
        </Button>
        <Button onClick={saveAndClose} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
