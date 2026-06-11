import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePrizeSettingsForm } from '@/hooks/usePrizeSettingsForm';
import { formatNumber } from '@/lib/format';
import { buyInSettingsSection, prizeRoundingStepOptions, prizeSettingsSection } from '@/lib/settings';
import { AppDialog } from './AppDialog';
import { PrizeDistributionEditor } from './settings/PrizeDistributionEditor';
import { PrizeDistributionInfoDialog } from './settings/PrizeDistributionInfoDialog';
import type { Settings } from '@/lib/game';
import type { PrizeSettingKey } from '@/hooks/usePrizeSettingsForm';
import type { SettingField } from '@/lib/settings';

type PrizeSettingsDialogProps = {
  settings: Settings;
  onChange: (settingsPatch: Partial<Settings>) => void;
  onClose: () => void;
};

type PrizeFieldCardProps = {
  field: SettingField;
  value: string;
  onChange: (key: PrizeSettingKey, value: string) => void;
};

function PrizeFieldCard({ field, value, onChange }: PrizeFieldCardProps) {
  return (
    <label className="rounded-2xl bg-zinc-900/80 p-3 text-left ring-1 ring-white/10">
      <span className="block text-[11px] font-black uppercase text-zinc-500">{field.label}</span>
      <input
        type="text"
        inputMode={field.allowNegative ? 'text' : 'numeric'}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key as PrizeSettingKey, event.target.value)}
        className="mt-1 h-9 w-full rounded-xl border border-transparent bg-black/50 px-3 text-base font-black outline-none placeholder:text-zinc-700 focus:border-violet-400"
      />
    </label>
  );
}

export function PrizeSettingsDialog({ settings, onChange, onClose }: PrizeSettingsDialogProps) {
  const [isPrizeInfoOpen, setIsPrizeInfoOpen] = useState(false);
  const form = usePrizeSettingsForm(settings);
  const buyInPointsField = buyInSettingsSection.fields.find((field) => field.key === 'buyInPoints');
  const buyInChipsField = buyInSettingsSection.fields.find((field) => field.key === 'buyInChips');
  const adjustmentField = prizeSettingsSection.fields.find((field) => field.key === 'prizeAdjustmentPoints');
  const placesField = prizeSettingsSection.fields.find((field) => field.key === 'prizePlaces');
  const roundingField = prizeSettingsSection.fields.find((field) => field.key === 'prizeRoundingStep');

  function saveAndClose() {
    if (!form.isPrizeDistributionValid) return;

    onChange(form.createSettingsPatch());
    onClose();
  }

  return (
    <>
      <AppDialog align="top" onClose={form.isPrizeDistributionValid ? saveAndClose : undefined}>
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold">Параметры игры</h3>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {buyInPointsField && <PrizeFieldCard field={buyInPointsField} value={form.values.buyInPoints} onChange={form.updateValue} />}
            {buyInChipsField && <PrizeFieldCard field={buyInChipsField} value={form.values.buyInChips} onChange={form.updateValue} />}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {adjustmentField && (
              <PrizeFieldCard field={adjustmentField} value={form.values.prizeAdjustmentPoints} onChange={form.updateValue} />
            )}
            {placesField && <PrizeFieldCard field={placesField} value={form.values.prizePlaces} onChange={form.updateValue} />}
          </div>

          <div className="rounded-2xl bg-zinc-900/80 p-3 text-left ring-1 ring-white/10">
            <div className="mb-2 text-[11px] font-black uppercase text-zinc-500">{roundingField?.label || 'Шаг округления'}</div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <label className="min-w-0">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.values.prizeRoundingStep}
                  placeholder={roundingField?.placeholder || '1'}
                  onChange={(event) => form.updateValue('prizeRoundingStep', event.target.value)}
                  className="h-9 w-full rounded-xl border border-transparent bg-black/50 px-3 text-base font-black outline-none placeholder:text-zinc-700 focus:border-violet-400"
                />
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {prizeRoundingStepOptions.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => form.applyRoundingStep(step)}
                    className={`h-9 min-w-12 rounded-xl px-2 text-xs font-black active:scale-95 ${
                      Number(form.values.prizeRoundingStep) === step ? 'bg-violet-600 text-white' : 'bg-black/60 text-zinc-300'
                    }`}
                  >
                    {formatNumber(step)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PrizeDistributionEditor
          prizePlaces={Number(form.values.prizePlaces) || 1}
          distribution={form.prizeDistribution}
          percentValues={form.prizePercentValues}
          percentTotal={form.prizePercentTotal}
          isOrdered={form.isPrizeDistributionOrdered}
          isValid={form.isPrizeDistributionValid}
          onInfo={() => setIsPrizeInfoOpen(true)}
          onApplyPreset={form.applyPrizePreset}
          onPercentChange={form.updatePrizePercent}
        />

        <div className="sticky -bottom-5 -mx-5 -mb-5 mt-4 grid border-t border-white/10 bg-zinc-950 px-5 pb-5 pt-3">
          <Button onClick={saveAndClose} disabled={!form.isPrizeDistributionValid} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
            Готово
          </Button>
        </div>
      </AppDialog>

      {isPrizeInfoOpen && <PrizeDistributionInfoDialog settings={form.draftSettings} onClose={() => setIsPrizeInfoOpen(false)} />}
    </>
  );
}
