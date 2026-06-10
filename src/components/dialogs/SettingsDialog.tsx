import { Button } from '@/components/ui/button';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { buyInSettingsSection } from '@/lib/settings';
import { AppDialog } from './AppDialog';
import { SettingsNumberField } from './settings/SettingsNumberField';
import { SettingsSection } from './settings/SettingsSection';
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
      <div className="mb-4 flex items-start justify-center gap-3">
        <div>
          <h3 className="text-lg font-bold">Параметры игры</h3>
          <p className="mt-1 text-sm text-zinc-400">Настройки бай-ина и фишек.</p>
        </div>
      </div>

      <SettingsSection title={buyInSettingsSection.title}>
        <div className="space-y-3">
          {buyInSettingsSection.fields.map((field) => (
            <SettingsNumberField
              key={field.key}
              field={field}
              value={form.values[field.key as BuyInSettingKey]}
              onChange={(key, value) => form.updateValue(key as BuyInSettingKey, value)}
            />
          ))}
        </div>
      </SettingsSection>

      <div className="mt-4 grid">
        <Button onClick={saveAndClose} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
