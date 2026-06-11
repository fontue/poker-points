import { Plus, X } from 'lucide-react';
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
  const normalizedValue = value.trim().toLowerCase();
  const isNameAlreadyAdded = existingNames.some((name) => name.toLowerCase() === normalizedValue);
  const canAddPlayer = normalizedValue.length > 0 && !isNameAlreadyAdded;

  function confirmPlayer() {
    if (canAddPlayer) onConfirm();
  }

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

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={value}
          onFocus={(event) => {
            setTimeout(() => {
              event.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 250);
          }}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') confirmPlayer();
          }}
          placeholder="Имя игрока"
          className="h-14 min-w-0 rounded-2xl border border-white/10 bg-black px-4 text-base font-semibold outline-none placeholder:text-zinc-600 focus:border-violet-400"
        />
        <button
          type="button"
          onClick={confirmPlayer}
          disabled={!canAddPlayer}
          className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-white disabled:bg-zinc-800 disabled:text-zinc-600 active:scale-95"
          aria-label="Добавить игрока"
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-bold text-zinc-400">История имён</div>
          <div className="grid max-h-[38dvh] grid-cols-2 gap-2 overflow-y-auto pr-1 overscroll-contain">
            {[...history]
              .sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }))
              .map((name) => {
                const isAlreadyAdded = existingNames.some((existingName) => existingName.toLowerCase() === name.toLowerCase());

                return (
                  <div
                    key={name}
                    className={`flex min-w-0 items-center gap-1 rounded-xl border p-1.5 ring-1 ring-black/40 ${
                      isAlreadyAdded
                        ? 'border-violet-300/15 bg-violet-500/[0.08]'
                        : 'border-white/[0.14] bg-zinc-900/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectHistoryName(name)}
                      disabled={isAlreadyAdded}
                      className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm font-bold ${
                        isAlreadyAdded ? 'text-violet-100/65' : 'text-white'
                      }`}
                    >
                      {name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryName(name)}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-zinc-800/80 text-zinc-400 active:scale-95"
                      aria-label={`Удалить ${name} из истории`}
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
