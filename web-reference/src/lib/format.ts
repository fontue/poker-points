export function formatNumber(value: number | string) {
  return new Intl.NumberFormat('ru-RU').format(Number(value) || 0);
}

export function clampNumber(value: number | string) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return 0;
  return Math.floor(num);
}

export function normalizeNumberInput(value: string, allowNegative = false) {
  const sign = allowNegative && value.trim().startsWith('-') ? '-' : '';
  const onlyDigits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

  return `${sign}${onlyDigits}`;
}
