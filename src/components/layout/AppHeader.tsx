import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AppHeaderProps = {
  onReference: () => void;
  onReset: () => void;
};

export function AppHeader({ onReference, onReset }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 bg-black/35 px-4 pb-3 pt-2 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Poker points</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onReference} className="rounded-2xl bg-zinc-900 px-3 text-zinc-300">
            <BookOpen size={18} />
          </Button>

          <Button onClick={onReset} className="rounded-2xl bg-zinc-900 px-3 text-zinc-300">
            Сброс
          </Button>
        </div>
      </div>
    </header>
  );
}
