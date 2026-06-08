import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppDialog } from './AppDialog';

type AddPlayerDialogProps = {
  value: string;
  history: string[];
  existingNames: string[];
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onSelectHistoryName: (name: string) => void;
  onDeleteHistoryName: (name: string) => void;
};

export function AddPlayerDialog({
  value,
  history,
  existingNames,
  onChange,
  onCancel,
  onConfirm,
  onSelectHistoryName,
  onDeleteHistoryName
}: AddPlayerDialogProps) {
  return (
    <AppDialog align="top" onClose={onCancel}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Добавить игрока</h3>
        </div>
        <button onClick={onCancel} className="rounded-full bg-white/10 p-2 text-zinc-300">
          <X size={18} />
        </button>
      </div>

      <input
        value={value}
        onFocus={(event) => {
          setTimeout(() => {
            event.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }, 250);
        }}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onConfirm();
        }}
        placeholder="Имя игрока"
        className="mb-3 h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-lg font-semibold outline-none placeholder:text-zinc-600 focus:border-violet-400"
      />

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onCancel} className="h-12 rounded-2xl bg-zinc-800 text-white">
          Отмена
        </Button>
        <Button onClick={onConfirm} className="h-12 rounded-2xl bg-violet-600 font-bold text-white">
          Добавить
        </Button>
      </div>

      {history.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-bold text-zinc-400">История имён</div>
          <div className="max-h-[38dvh] space-y-2 overflow-y-auto pr-1 overscroll-contain">
            {[...history]
              .sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }))
              .map((name) => {
                const isAlreadyAdded = existingNames.some((existingName) => existingName.toLowerCase() === name.toLowerCase());

                return (
                  <div key={name} className="flex items-center gap-2 rounded-2xl bg-zinc-900 p-2 ring-1 ring-white/5">
                    <button
                      type="button"
                      onClick={() => onSelectHistoryName(name)}
                      disabled={isAlreadyAdded}
                      className="min-w-0 flex-1 truncate rounded-xl px-3 py-2 text-left text-sm font-bold text-white disabled:text-zinc-600"
                    >
                      {name}
                      {isAlreadyAdded ? ' · В игре' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryName(name)}
                      className="rounded-xl bg-white/10 p-2 text-zinc-400 active:scale-95"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </AppDialog>
  );
}
