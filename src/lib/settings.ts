import type { Settings } from './game';

export type SettingField = {
  key: keyof Settings;
  label: string;
};

export const settingFields: SettingField[] = [
  {
    key: 'buyInPoints',
    label: 'Стоимость 1 бай-ина в поинтах'
  },
  {
    key: 'buyInChips',
    label: 'Сколько фишек в 1 бай-ине'
  },
  {
    key: 'commission',
    label: 'Комиссия в поинтах'
  }
];
