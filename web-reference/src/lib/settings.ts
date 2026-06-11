import type { Settings } from './game';

export type ScalarSettingKey = Exclude<keyof Settings, 'prizeDistribution' | 'timerLevels'>;
export type SettingSection = {
  title: string;
  fields: SettingField[];
};

export type SettingField = {
  key: ScalarSettingKey;
  label: string;
  minValue: number | null;
  placeholder: string;
  allowNegative?: boolean;
};

export const settingFields: SettingField[] = [
  {
    key: 'buyInPoints',
    label: 'Цена бай-ина',
    minValue: 1,
    placeholder: '1'
  },
  {
    key: 'buyInChips',
    label: 'Фишек за бай-ин',
    minValue: 1,
    placeholder: '1'
  },
  {
    key: 'prizeAdjustmentPoints',
    label: 'Корректировка призового фонда',
    minValue: null,
    placeholder: '0',
    allowNegative: true
  },
  {
    key: 'prizePlaces',
    label: 'Количество призовых мест',
    minValue: 1,
    placeholder: '1'
  },
  {
    key: 'prizeRoundingStep',
    label: 'Шаг округления призовых',
    minValue: 1,
    placeholder: '1'
  }
];

export const buyInSettingsSection: SettingSection = {
  title: 'Бай-ин',
  fields: settingFields.filter((field) => field.key === 'buyInPoints' || field.key === 'buyInChips')
};

export const prizeSettingsSection: SettingSection = {
  title: 'Призовой фонд',
  fields: settingFields.filter(
    (field) => field.key === 'prizeAdjustmentPoints' || field.key === 'prizePlaces' || field.key === 'prizeRoundingStep'
  )
};

export const prizeDistributionPresets: Record<number, number[]> = {
  1: [100],
  2: [70, 30],
  3: [60, 30, 10]
};

export const prizeRoundingStepOptions = [100, 500, 1000];
