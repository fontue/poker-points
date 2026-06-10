import { Trophy, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSummaryButton } from './SettingsSummaryButton';
import type { Settings } from '@/lib/game';

type TournamentControlsProps = {
  settings: Settings;
  onSettings: () => void;
  onPrizeSettings: () => void;
  onAddPlayer: () => void;
};

export function TournamentControls({ settings, onSettings, onPrizeSettings, onAddPlayer }: TournamentControlsProps) {
  return (
    <section className="mb-4">
      <div className="mb-3 grid grid-cols-[1fr_auto_auto] gap-2">
        <SettingsSummaryButton settings={settings} onClick={onSettings} />

        <Button onClick={onPrizeSettings} className="h-full w-16 rounded-3xl bg-zinc-900 text-zinc-100">
          <Trophy size={18} className="size-6" />
        </Button>

        <Button onClick={onAddPlayer} className="h-full w-16 rounded-3xl bg-zinc-900 text-zinc-100">
          <UserPlus size={18} className="size-6" />
        </Button>
      </div>
    </section>
  );
}
