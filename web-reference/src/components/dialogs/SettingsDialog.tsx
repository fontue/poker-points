import { Button } from '@/components/ui/button';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { buyInSettingsSection } from '@/lib/settings';
import { AppDialog } from './AppDialog';
import { SettingsNumberField } from './settings/SettingsNumberField';
import type { Settings } from '@/lib/game';
import type { BuyInSettingKey } from '@/hooks/useSettingsForm';

type SettingsDialogProps = {
  settings: Settings;
  onChange: (settingsPatch: Partial<Settings>) => void;
  onClose: () => void;
};

export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  const form = useSettingsForm(settings);

  function saveAndClose() {
    onChange(form.createSettingsPatch());
    onClose();
  }

  return (
    <AppDialog align="top" onClose={saveAndClose}>
      <div className="mb-3 flex items-start justify-center gap-3">
        <h3 className="text-lg font-bold">Параметры игры</h3>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/[0.14] bg-zinc-900/70 p-3 text-left ring-1 ring-black/40">
        {buyInSettingsSection.fields.map((field) => (
          <SettingsNumberField
            key={field.key}
            field={field}
            value={form.values[field.key as BuyInSettingKey]}
            onChange={(key, value) => form.updateValue(key as BuyInSettingKey, value)}
          />
        ))}
      </div>

      <div className="mt-3 grid">
        <Button onClick={saveAndClose} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
