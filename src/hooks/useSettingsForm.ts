import { useState } from 'react';
import { normalizeNumberInput } from '@/lib/format';
import { buyInSettingsSection } from '@/lib/settings';
import type { Settings } from '@/lib/game';
import type { ScalarSettingKey } from '@/lib/settings';

export type BuyInSettingKey = Extract<ScalarSettingKey, 'buyInPoints' | 'buyInChips'>;
export type SettingsValues = Record<BuyInSettingKey, string>;

function createSettingsValues(settings: Settings): SettingsValues {
  return Object.fromEntries(buyInSettingsSection.fields.map((field) => [field.key, String(settings[field.key] || '')])) as SettingsValues;
}

function normalizeSettingsValues(values: SettingsValues): Record<BuyInSettingKey, number> {
  return Object.fromEntries(
    buyInSettingsSection.fields.map((field) => {
      const rawValue = values[field.key as BuyInSettingKey] === '' ? 0 : Number(values[field.key as BuyInSettingKey]);
      const value = Number.isFinite(rawValue) ? Math.floor(rawValue) : 0;

      return [field.key, field.minValue === null ? value : Math.max(field.minValue, value)];
    })
  ) as Record<BuyInSettingKey, number>;
}

export function useSettingsForm(settings: Settings) {
  const [values, setValues] = useState(() => createSettingsValues(settings));
  const normalizedSettings = normalizeSettingsValues(values);

  function updateValue(key: BuyInSettingKey, value: string) {
    const field = buyInSettingsSection.fields.find((currentField) => currentField.key === key);
    const nextValue = normalizeNumberInput(value, field?.allowNegative);
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  }

  function createSettingsPatch(): Partial<Settings> {
    return normalizedSettings;
  }

  return {
    values,
    updateValue,
    createSettingsPatch
  };
}
