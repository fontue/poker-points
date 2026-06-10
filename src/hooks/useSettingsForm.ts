import { useState } from 'react';
import { normalizeNumberInput } from '@/lib/format';
import { normalizePrizeDistribution, normalizeSettings } from '@/lib/game';
import { prizeDistributionPresets, settingFields } from '@/lib/settings';
import type { Settings } from '@/lib/game';
import type { ScalarSettingKey } from '@/lib/settings';

export type SettingsValues = Record<ScalarSettingKey, string>;

function createSettingsValues(settings: Settings): SettingsValues {
  return Object.fromEntries(settingFields.map((field) => [field.key, String(settings[field.key] || '')])) as SettingsValues;
}

function normalizeScalarSettings(values: SettingsValues): Record<ScalarSettingKey, number> {
  return Object.fromEntries(
    settingFields.map((field) => {
      const rawValue = values[field.key] === '' ? 0 : Number(values[field.key]);
      const value = Number.isFinite(rawValue) ? Math.floor(rawValue) : 0;

      return [field.key, field.minValue === null ? value : Math.max(field.minValue, value)];
    })
  ) as Record<ScalarSettingKey, number>;
}

function parsePrizeDistribution(distribution: string[]) {
  return distribution.map((percent) => (percent === '' ? 0 : Number(percent)));
}

export function useSettingsForm(settings: Settings) {
  const [values, setValues] = useState(() => createSettingsValues(settings));
  const [prizeDistribution, setPrizeDistribution] = useState(() =>
    normalizePrizeDistribution(settings.prizeDistribution, settings.prizePlaces).map(String)
  );

  const prizePercentValues = prizeDistribution.map((percent) => Number(percent) || 0);
  const prizePercentTotal = prizePercentValues.reduce((sum, percent) => sum + percent, 0);
  const isPrizeDistributionOrdered = prizePercentValues.every(
    (percent, index) => index === 0 || percent <= prizePercentValues[index - 1]
  );
  const isPrizeDistributionValid = prizePercentTotal === 100 && isPrizeDistributionOrdered;
  const normalizedScalarSettings = normalizeScalarSettings(values);
  const draftSettings = normalizeSettings({
    ...settings,
    ...normalizedScalarSettings,
    prizeDistribution: parsePrizeDistribution(prizeDistribution)
  });

  function updateValue(key: ScalarSettingKey, value: string) {
    const field = settingFields.find((currentField) => currentField.key === key);
    const nextValue = normalizeNumberInput(value, field?.allowNegative);
    setValues((prev) => ({ ...prev, [key]: nextValue }));

    if (key === 'prizePlaces') {
      const prizePlaces = Math.max(1, Number(nextValue) || 1);
      setPrizeDistribution((prev) => (prizeDistributionPresets[prizePlaces] || normalizePrizeDistribution(prev, prizePlaces)).map(String));
    }
  }

  function updatePrizePercent(index: number, value: string) {
    setPrizeDistribution((prev) => prev.map((percent, percentIndex) => (percentIndex === index ? normalizeNumberInput(value) : percent)));
  }

  function applyPrizePreset(distribution: number[]) {
    setValues((prev) => ({ ...prev, prizePlaces: String(distribution.length) }));
    setPrizeDistribution(distribution.map(String));
  }

  function applyRoundingStep(step: number) {
    setValues((prev) => ({ ...prev, prizeRoundingStep: String(step) }));
  }

  function createSettingsPatch(): Partial<Settings> {
    return {
      ...normalizedScalarSettings,
      prizeDistribution: parsePrizeDistribution(prizeDistribution)
    };
  }

  return {
    values,
    prizeDistribution,
    prizePercentValues,
    prizePercentTotal,
    isPrizeDistributionOrdered,
    isPrizeDistributionValid,
    draftSettings,
    updateValue,
    updatePrizePercent,
    applyPrizePreset,
    applyRoundingStep,
    createSettingsPatch
  };
}
