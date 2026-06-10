import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePrizeSettingsForm } from '@/hooks/usePrizeSettingsForm';
import { formatNumber } from '@/lib/format';
import { prizeRoundingStepOptions, prizeSettingsSection } from '@/lib/settings';
import { AppDialog } from './AppDialog';
import { PrizeDistributionEditor } from './settings/PrizeDistributionEditor';
import { PrizeDistributionInfoDialog } from './settings/PrizeDistributionInfoDialog';
import { SettingsNumberField } from './settings/SettingsNumberField';
import { SettingsSection } from './settings/SettingsSection';
import type { Settings } from '@/lib/game';
import type { PrizeSettingKey } from '@/hooks/usePrizeSettingsForm';

type PrizeSettingsDialogProps = {
  settings: Settings;
  onChange: (settingsPatch: Partial<Settings>) => void;
  onClose: () => void;
};

export function PrizeSettingsDialog({ settings, onChange, onClose }: PrizeSettingsDialogProps) {
  const [isPrizeInfoOpen, setIsPrizeInfoOpen] = useState(false);
  const form = usePrizeSettingsForm(settings);

  function saveAndClose() {
    if (!form.isPrizeDistributionValid) return;

    onChange(form.createSettingsPatch());
    onClose();
  }

  return (
    <>
      <AppDialog align="top" onClose={form.isPrizeDistributionValid ? saveAndClose : undefined}>
        <div className="mb-4 flex items-start justify-center gap-3">
          <div>
            <h3 className="text-lg font-bold">Призовой фонд</h3>
            <p className="mt-1 text-sm text-zinc-400">Фонд, округление и распределение призовых.</p>
          </div>
        </div>

        <SettingsSection title={prizeSettingsSection.title}>
          <div className="space-y-3">
            {prizeSettingsSection.fields.map((field) => (
              <SettingsNumberField
                key={field.key}
                field={field}
                value={form.values[field.key as PrizeSettingKey]}
                onChange={(key, value) => form.updateValue(key as PrizeSettingKey, value)}
              />
            ))}

            <div className="grid grid-cols-3 gap-2">
              {prizeRoundingStepOptions.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => form.applyRoundingStep(step)}
                  className={`h-10 rounded-2xl text-sm font-black active:scale-95 ${
                    Number(form.values.prizeRoundingStep) === step ? 'bg-violet-600 text-white' : 'bg-black text-zinc-300'
                  }`}
                >
                  {formatNumber(step)}
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

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

        <div className="mt-4 grid">
          <Button onClick={saveAndClose} disabled={!form.isPrizeDistributionValid} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
            Готово
          </Button>
        </div>
      </AppDialog>

      {isPrizeInfoOpen && <PrizeDistributionInfoDialog settings={form.draftSettings} onClose={() => setIsPrizeInfoOpen(false)} />}
    </>
  );
}
