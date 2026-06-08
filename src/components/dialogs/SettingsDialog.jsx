import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { normalizeNumberInput } from '@/lib/format';
import { settingFields } from '@/lib/settings';
import { AppDialog } from './AppDialog';

export function SettingsDialog({ settings, onChange, onClose }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(settingFields.map((field) => [field.key, String(settings[field.key] || '')]))
  );

  function updateValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: normalizeNumberInput(value) }));
  }

  function saveAndClose() {
    onChange(Object.fromEntries(settingFields.map((field) => [field.key, values[field.key] === '' ? 0 : values[field.key]])));
    onClose();
  }

  return (
    <AppDialog align="top" onClose={saveAndClose}>
      <div className="mb-4 flex items-start justify-center gap-3">
        <div>
          <h3 className="text-lg font-bold">Параметры игры</h3>
          <p className="mt-1 text-sm text-zinc-400">Настройки бай-ина, количества фишек и комиссии.</p>
        </div>
      </div>

      <div className="space-y-3">
        {settingFields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-2 block text-sm text-zinc-300">{field.label}</span>
            <input
              type="text"
              inputMode="numeric"
              value={values[field.key]}
              onChange={(event) => updateValue(field.key, event.target.value)}
              className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 grid">
        <Button onClick={saveAndClose} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
