import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { normalizeNumberInput } from '@/lib/format';
import { AppDialog } from './AppDialog';

export function SettingsDialog({ settings, onChange, onClose }) {
  const [values, setValues] = useState({
    buyInPoints: String(settings.buyInPoints || ''),
    buyInChips: String(settings.buyInChips || ''),
    commission: String(settings.commission || '')
  });

  function updateValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: normalizeNumberInput(value) }));
  }

  function saveAndClose() {
    onChange({
      buyInPoints: values.buyInPoints === '' ? 0 : values.buyInPoints,
      buyInChips: values.buyInChips === '' ? 0 : values.buyInChips,
      commission: values.commission === '' ? 0 : values.commission
    });
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
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">Стоимость 1 бай-ина в поинтах</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.buyInPoints}
            onChange={(event) => updateValue('buyInPoints', event.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">Сколько фишек в 1 бай-ине</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.buyInChips}
            onChange={(event) => updateValue('buyInChips', event.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">Комиссия в поинтах</span>
          <input
            type="text"
            inputMode="numeric"
            value={values.commission}
            onChange={(event) => updateValue('commission', event.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
          />
        </label>
      </div>

      <div className="mt-4 grid">
        <Button onClick={saveAndClose} className="h-12 rounded-2xl bg-violet-600 font-bold text-white hover:bg-violet-500">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
