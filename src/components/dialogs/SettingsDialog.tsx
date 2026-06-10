import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import { formatNumber } from '@/lib/format';
import { prizeRoundingStepOptions, settingsSections } from '@/lib/settings';
import { AppDialog } from './AppDialog';
import { PrizeDistributionEditor } from './settings/PrizeDistributionEditor';
import { PrizeDistributionInfoDialog } from './settings/PrizeDistributionInfoDialog';
import { SettingsNumberField } from './settings/SettingsNumberField';
import { SettingsSection } from './settings/SettingsSection';
import type { Settings } from '@/lib/game';

type SettingsDialogProps = {
  settings: Settings;
  onChange: (settingsPatch: Partial<Settings>) => void;
  onClose: () => void;
};

export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  const [isPrizeInfoOpen, setIsPrizeInfoOpen] = useState(false);
  const form = useSettingsForm(settings);

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
            <h3 className="text-lg font-bold">Параметры игры</h3>
            <p className="mt-1 text-sm text-zinc-400">Настройки бай-ина, фонда и призовых.</p>
          </div>
        </div>

        <div className="space-y-4">
          {settingsSections.map((section) => (
            <SettingsSection key={section.title} title={section.title}>
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <SettingsNumberField key={field.key} field={field} value={form.values[field.key]} onChange={form.updateValue} />
                ))}

                {section.fields.some((field) => field.key === 'prizeRoundingStep') && (
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
                )}
              </div>
            </SettingsSection>
          ))}
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
