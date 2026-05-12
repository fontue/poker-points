import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Settings2, X, Check, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import './App.css';

const STORAGE_KEY = 'poker-points-pwa-state-v1';

const defaultState = {
  settings: {
    buyInPoints: 1000,
    buyInChips: 5000,
    isCollapsed: false
  },
  players: []
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      players: Array.isArray(parsed.players) ? parsed.players : []
    };
  } catch {
    return defaultState;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU').format(Number(value) || 0);
}

function clampNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return 0;
  return Math.floor(num);
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makePlayer(name) {
  return {
    id: createId(),
    name: name.trim(),
    buyIns: 1,
    paidToken: 0,
    paidOnlineToken: 0
  };
}

function ConfirmDialog({ action, onCancel, onConfirm }) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-[430px] rounded-3xl bg-zinc-950 p-5 text-white shadow-2xl ring-1 ring-white/10"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Подтвердить уменьшение?</h3>
            <p className="mt-1 text-sm text-zinc-400">Это действие уменьшит параметр игрока «{action.playerName}».</p>
          </div>
          <button onClick={onCancel} className="rounded-full bg-white/10 p-2 text-zinc-300">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onCancel} className="h-12 rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700">
            Отмена
          </Button>
          <Button onClick={onConfirm} className="h-12 rounded-2xl bg-red-600 text-white hover:bg-red-500">
            Уменьшить
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function DeletePlayerDialog({ player, onCancel, onConfirm }) {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-[430px] rounded-3xl bg-zinc-950 p-5 text-white shadow-2xl ring-1 ring-white/10"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Удалить игрока?</h3>
            <p className="mt-1 text-sm text-zinc-400">Игрок «{player.name}» будет удалён вместе со всеми его бай-инами и оплатами.</p>
          </div>
          <button onClick={onCancel} className="rounded-full bg-white/10 p-2 text-zinc-300">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onCancel} className="h-12 rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700">
            Отмена
          </Button>
          <Button onClick={onConfirm} className="h-12 rounded-2xl bg-red-600 text-white hover:bg-red-500">
            Удалить
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function CounterRow({ value, colorClass, onInc, onDec }) {
  return (
    <div className="rounded-2xl bg-zinc-900/80 p-2 ring-1 ring-white/5">
      <div className="flex gap-1">
        <Button onClick={onInc} className={`h-8 flex-1 rounded-xl p-0 text-base font-black text-white ${colorClass}`}>
          {value}
        </Button>

        <Button
          onClick={onDec}
          disabled={value <= 0}
          className="h-8 w-9 rounded-xl bg-zinc-800 p-0 text-white hover:bg-zinc-700 disabled:opacity-35"
        >
          <Minus size={16} />
        </Button>
      </div>
    </div>
  );
}

function PlayerCard({ player, buyInPoints, onIncrement, onRequestDecrement, onDelete }) {
  const unpaid = Math.max(0, player.buyIns - player.paidToken - player.paidOnlineToken);
  const unpaidPoints = unpaid * buyInPoints;
  const isPaid = unpaid === 0 && player.buyIns > 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
      <Card className="overflow-hidden rounded-3xl border-white/10 bg-zinc-900 text-white shadow-xl">
        <CardContent className="pl-3 pr-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="-ml-1 min-w-0 truncate text-xl font-black tracking-tight">{player.name}</h2>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-2xl px-3 ring-1 ${
                  isPaid ? 'bg-emerald-500/15 ring-emerald-500/25' : 'bg-red-500/15 ring-red-500/25'
                }`}
              >
                <div className={`text-[11px] font-bold uppercase tracking-wide ${isPaid ? 'text-emerald-200/80' : 'text-red-200/80'}`}>
                  {isPaid ? 'Оплачено' : 'Не оплачено'}
                </div>

                <div className={`text-xl font-black ${isPaid ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isPaid ? '✓' : `${formatNumber(unpaidPoints)}P`}
                </div>
              </div>

              <button onClick={() => onDelete(player.id)} className="rounded-2xl bg-white/10 p-2 text-zinc-400 active:scale-95">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CounterRow
              label="Бай"
              value={player.buyIns}
              colorClass="bg-violet-600 hover:bg-violet-500"
              onInc={() => onIncrement(player.id, 'buyIns')}
              onDec={() => onRequestDecrement(player.id, 'buyIns')}
            />

            <CounterRow
              label="Жетон"
              value={player.paidToken}
              colorClass="bg-orange-500 hover:bg-orange-400"
              onInc={() => onIncrement(player.id, 'paidToken')}
              onDec={() => onRequestDecrement(player.id, 'paidToken')}
            />

            <CounterRow
              label="Онлайн"
              value={player.paidOnlineToken}
              colorClass="bg-emerald-600 hover:bg-emerald-500"
              onInc={() => onIncrement(player.id, 'paidOnlineToken')}
              onDec={() => onRequestDecrement(player.id, 'paidOnlineToken')}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PokerPointsPWA() {
  const [state, setState] = useState(loadState);
  const [playerName, setPlayerName] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [deletePlayerId, setDeletePlayerId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totals = useMemo(() => {
    const totalBuyIns = state.players.reduce((sum, p) => sum + p.buyIns, 0);
    const paidTokens = state.players.reduce((sum, p) => sum + p.paidToken + p.paidOnlineToken, 0);

    return {
      pointsInGame: totalBuyIns * state.settings.buyInPoints,
      pointsPaidByTokens: paidTokens * state.settings.buyInPoints,
      chipsInGame: totalBuyIns * state.settings.buyInChips
    };
  }, [state.players, state.settings.buyInPoints, state.settings.buyInChips]);

  const playerToDelete = useMemo(
    () => state.players.find((player) => player.id === deletePlayerId) || null,
    [state.players, deletePlayerId]
  );

  function updateSettings(key, value) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: clampNumber(value)
      }
    }));
  }

  function toggleSettings() {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        isCollapsed: !prev.settings.isCollapsed
      }
    }));
  }

  function addPlayer() {
    const name = playerName.trim();
    if (!name) return;
    setState((prev) => ({ ...prev, players: [...prev.players, makePlayer(name)] }));
    setPlayerName('');
  }

  function increment(playerId, field) {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, [field]: p[field] + 1 } : p))
    }));
  }

  function requestDecrement(playerId, field) {
    const player = state.players.find((p) => p.id === playerId);
    if (!player || player[field] <= 0) return;
    setConfirmAction({ playerId, field, playerName: player.name });
  }

  function confirmDecrement() {
    if (!confirmAction) return;
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === confirmAction.playerId ? { ...p, [confirmAction.field]: Math.max(0, p[confirmAction.field] - 1) } : p
      )
    }));
    setConfirmAction(null);
  }

  function requestDeletePlayer(playerId) {
    setDeletePlayerId(playerId);
  }

  function confirmDeletePlayer() {
    if (!deletePlayerId) return;

    setState((prev) => ({ ...prev, players: prev.players.filter((p) => p.id !== deletePlayerId) }));
    setDeletePlayerId(null);
  }

  function resetTournament() {
    const ok = window.confirm('Сбросить турнир? Все игроки и параметры будут удалены.');
    if (!ok) return;
    setState(defaultState);
    setPlayerName('');
    setDeletePlayerId(null);
    setConfirmAction(null);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-b from-zinc-950 via-black to-black px-4 pb-24">
        <header className="sticky top-0 z-20 -mx-4 mb-4 bg-black/35 px-4 pb-3 pt-2 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Poker points</p>
            </div>
            <Button onClick={resetTournament} className="rounded-2xl bg-zinc-900 px-3 text-zinc-300 hover:bg-zinc-800">
              Сброс
            </Button>
          </div>
        </header>

        <section className="mb-4">
          <button
            onClick={toggleSettings}
            className="mb-3 flex w-full items-center justify-between rounded-3xl bg-zinc-900/90 p-4 text-left ring-1 ring-white/10 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-600/20 p-2 text-violet-200">
                <Settings2 size={20} />
              </div>
              <div>
                <div className="font-bold">Глобальные параметры</div>
                <div className="text-sm text-zinc-400">
                  {formatNumber(state.settings.buyInPoints)}P · {formatNumber(state.settings.buyInChips)} фишек
                </div>
              </div>
            </div>
            <span className="text-sm text-zinc-400">{state.settings.isCollapsed ? 'Открыть' : 'Скрыть'}</span>
          </button>

          <AnimatePresence initial={false}>
            {!state.settings.isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="rounded-3xl border-white/10 bg-zinc-900 text-white">
                  <CardContent className="space-y-3 p-4">
                    <label className="block">
                      <span className="mb-2 block text-sm text-zinc-300">Стоимость 1 бай-ина в поинтах</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={state.settings.buyInPoints}
                        onChange={(e) => updateSettings('buyInPoints', e.target.value)}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-zinc-300">Сколько фишек в 1 бай-ине</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={state.settings.buyInChips}
                        onChange={(e) => updateSettings('buyInChips', e.target.value)}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-xl font-bold outline-none focus:border-violet-400"
                      />
                    </label>
                    <Button onClick={toggleSettings} className="h-12 w-full rounded-2xl bg-violet-600 font-bold hover:bg-violet-500">
                      Сохранить и скрыть
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="mb-5 rounded-3xl bg-zinc-900 p-4 ring-1 ring-white/10">
          <div className="mb-3 flex items-center gap-2 text-lg font-black">
            <UserPlus size={20} /> Игроки
          </div>
          <div className="grid grid-cols-[1fr_56px] gap-2">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addPlayer();
              }}
              placeholder="Имя игрока"
              className="h-14 rounded-2xl border border-white/10 bg-black px-4 text-lg font-semibold outline-none placeholder:text-zinc-600 focus:border-violet-400"
            />
            <Button onClick={addPlayer} className="h-14 rounded-2xl bg-zinc-800 text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700">
              <Plus size={22} />
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <AnimatePresence>
            {state.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                buyInPoints={state.settings.buyInPoints}
                onIncrement={increment}
                onRequestDecrement={requestDecrement}
                onDelete={requestDeletePlayer}
              />
            ))}
          </AnimatePresence>

          {state.players.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-zinc-500">
              Добавь первого игрока, чтобы начать считать бай-ины и оплату жетонами.
            </div>
          )}
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-black/80 px-3 pb-2 pt-1 backdrop-blur-xl">
        <div className="grid w-full max-w-[430px] grid-cols-3 gap-1.5 rounded-2xl bg-zinc-950 mb-2 p-1.5 shadow-2xl ring-1 ring-white/10">
          <div className="rounded-xl bg-violet-600/15 px-2 py-1.5 text-center ring-1 ring-violet-500/20">
            <div className="text-[9px] font-bold uppercase tracking-tight text-violet-200/80">Поинты в игре</div>
            <div className="text-sm font-black text-violet-100">{formatNumber(totals.pointsInGame)}P</div>
          </div>
          <div className="rounded-xl bg-orange-500/15 px-2 py-1.5 text-center ring-1 ring-orange-500/20">
            <div className="text-[9px] font-bold uppercase tracking-tight text-orange-200/80">Оплачено</div>
            <div className="text-sm font-black text-orange-100">{formatNumber(totals.pointsPaidByTokens)}P</div>
          </div>
          <div className="rounded-xl bg-emerald-600/15 px-2 py-1.5 text-center ring-1 ring-emerald-500/20">
            <div className="text-[9px] font-bold uppercase tracking-tight text-emerald-200/80">Фишки</div>
            <div className="text-sm font-black text-emerald-100">{formatNumber(totals.chipsInGame)}</div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {confirmAction && <ConfirmDialog action={confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={confirmDecrement} />}
      </AnimatePresence>

      <AnimatePresence>
        {playerToDelete && (
          <DeletePlayerDialog player={playerToDelete} onCancel={() => setDeletePlayerId(null)} onConfirm={confirmDeletePlayer} />
        )}
      </AnimatePresence>
    </div>
  );
}
