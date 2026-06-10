import type { ReactNode } from 'react';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="rounded-3xl bg-zinc-900 p-3 text-left ring-1 ring-white/10">
      <h4 className="mb-3 text-sm font-black text-zinc-100">{title}</h4>
      {children}
    </section>
  );
}
