import type { SettingField, ScalarSettingKey } from '@/lib/settings';

type SettingsNumberFieldProps = {
  field: SettingField;
  value: string;
  onChange: (key: ScalarSettingKey, value: string) => void;
};

export function SettingsNumberField({ field, value, onChange }: SettingsNumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-300">{field.label}</span>
      <input
        type="text"
        inputMode={field.allowNegative ? 'text' : 'numeric'}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
      />
    </label>
  );
}
