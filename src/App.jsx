import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, Settings2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPlayerDialog } from '@/components/dialogs/AddPlayerDialog';
import { ConfirmActionDialog } from '@/components/dialogs/ConfirmActionDialog';
import { ReferenceDialog } from '@/components/dialogs/ReferenceDialog';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { TotalsDialog } from '@/components/dialogs/TotalsDialog';
import { PlayerCard } from '@/components/game/PlayerCard';
import { FooterTotals } from '@/components/layout/FooterTotals';
import { clampNumber, formatNumber } from '@/lib/format';
import {
  addPlayerToState,
  calculateTotals,
  decrementPlayerField,
  defaultState,
  deletePlayerFromState,
  eliminatePlayer,
  getEliminatedPlaceMap,
  incrementPlayerField,
  normalizeName,
  returnPlayerToGame
} from '@/lib/game';
import { loadPlayerNamesHistory, loadState, savePlayerNamesHistory, saveState } from '@/lib/storage';
import './App.css';

function upsertNameHistory(history, name) {
  return [name, ...history.filter((existingName) => existingName.toLowerCase() !== name.toLowerCase())];
}

function isDuplicatePlayer(players, name) {
  return players.some((player) => player.name.toLowerCase() === name.toLowerCase());
}

export default function PokerPointsPWA() {
  const [state, setState] = useState(loadState);
  const [playerName, setPlayerName] = useState('');
  const [modal, setModal] = useState(null);
  const [playerNamesHistory, setPlayerNamesHistory] = useState(loadPlayerNamesHistory);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    savePlayerNamesHistory(playerNamesHistory);
  }, [playerNamesHistory]);

  useEffect(() => {
    if (!modal) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [modal]);

  const totals = useMemo(() => calculateTotals(state.players, state.settings), [state.players, state.settings]);
  const eliminatedPlaces = useMemo(() => getEliminatedPlaceMap(state.players), [state.players]);
  const existingPlayerNames = useMemo(() => state.players.map((player) => player.name), [state.players]);

  const modalPlayer = useMemo(() => {
    if (!modal?.playerId) return null;
    return state.players.find((player) => player.id === modal.playerId) || null;
  }, [modal, state.players]);

  function closeModal() {
    setModal(null);
  }

  function updateSettings(settingsPatch) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...Object.fromEntries(Object.entries(settingsPatch).map(([key, value]) => [key, clampNumber(value)]))
      }
    }));
  }

  function openAddPlayerDialog() {
    setPlayerName('');
    setModal({ type: 'add-player' });
  }

  function addPlayerByName(name) {
    const normalizedName = normalizeName(name);
    if (!normalizedName || isDuplicatePlayer(state.players, normalizedName)) return;

    setState((prev) => addPlayerToState(prev, normalizedName));
    setPlayerNamesHistory((prev) => upsertNameHistory(prev, normalizedName));
    setPlayerName('');
    setModal({ type: 'add-player' });
  }

  function deleteHistoryName(name) {
    setPlayerNamesHistory((prev) => prev.filter((existingName) => existingName.toLowerCase() !== name.toLowerCase()));
  }

  function increment(playerId, field) {
    setState((prev) => incrementPlayerField(prev, playerId, field));
  }

  function requestDecrement(playerId, field) {
    const player = state.players.find((candidate) => candidate.id === playerId);
    if (!player || player[field] <= 0) return;
    setModal({ type: 'decrement-player-field', playerId, field, playerName: player.name });
  }

  function confirmDecrement() {
    if (modal?.type !== 'decrement-player-field') return;
    setState((prev) => decrementPlayerField(prev, modal.playerId, modal.field));
    closeModal();
  }

  function toggleEliminated(playerId) {
    const player = state.players.find((candidate) => candidate.id === playerId);
    if (!player) return;

    if (player.isEliminated) {
      setModal({ type: 'return-player', playerId });
      return;
    }

    setState((prev) => eliminatePlayer(prev, playerId));
  }

  function confirmReturnPlayer() {
    if (modal?.type !== 'return-player') return;
    setState((prev) => returnPlayerToGame(prev, modal.playerId));
    closeModal();
  }

  function confirmDeletePlayer() {
    if (modal?.type !== 'delete-player') return;
    setState((prev) => deletePlayerFromState(prev, modal.playerId));
    closeModal();
  }

  function resetTournament() {
    setState(defaultState);
    setPlayerName('');
    closeModal();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-b from-zinc-950 via-black to-black px-4 pb-24">
        <header className="sticky top-0 z-20 -mx-4 mb-4 bg-black/35 px-4 pb-3 pt-2 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Poker points</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setModal({ type: 'reference' })} className="rounded-2xl bg-zinc-900 px-3 text-zinc-300">
                <BookOpen size={18} />
              </Button>

              <Button onClick={() => setModal({ type: 'reset-tournament' })} className="rounded-2xl bg-zinc-900 px-3 text-zinc-300">
                Сброс
              </Button>
            </div>
          </div>
        </header>

        <section className="mb-4">
          <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
            <button
              onClick={() => setModal({ type: 'settings' })}
              className="flex min-w-0 items-center justify-between rounded-3xl bg-zinc-900/90 p-4 text-left active:scale-[0.99]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-2xl bg-violet-600/20 p-2 text-violet-200">
                  <Settings2 size={20} />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">Параметры</div>
                  <div className="truncate text-sm text-zinc-400">
                    {formatNumber(state.settings.buyInPoints)}P · {formatNumber(state.settings.buyInChips)} фишек · комиссия{' '}
                    {formatNumber(state.settings.commission)}P
                  </div>
                </div>
              </div>
            </button>

            <Button onClick={openAddPlayerDialog} className="h-full w-16 rounded-3xl bg-zinc-900 text-zinc-100">
              <UserPlus size={18} className="size-6" />
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
                place={eliminatedPlaces.get(player.id)}
                onIncrement={increment}
                onRequestDecrement={requestDecrement}
                onToggleEliminated={toggleEliminated}
                onDelete={(playerId) => setModal({ type: 'delete-player', playerId })}
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

      <FooterTotals totals={totals} onOpen={() => setModal({ type: 'totals' })} />

      <AnimatePresence>
        {modal?.type === 'decrement-player-field' && (
          <ConfirmActionDialog
            title="Подтвердить уменьшение?"
            description={`Это действие уменьшит параметр игрока «${modal.playerName}».`}
            confirmText="Уменьшить"
            onCancel={closeModal}
            onConfirm={confirmDecrement}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal?.type === 'delete-player' && modalPlayer && (
          <ConfirmActionDialog
            title="Удалить игрока?"
            description={`Игрок «${modalPlayer.name}» будет удалён вместе со всеми его бай-инами и оплатами.`}
            confirmText="Удалить"
            onCancel={closeModal}
            onConfirm={confirmDeletePlayer}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal?.type === 'return-player' && modalPlayer && (
          <ConfirmActionDialog
            title="Вернуть игрока в игру?"
            description={`Игрок «${modalPlayer.name}» снова будет отмечен как «В игре».`}
            confirmText="Вернуть"
            confirmTone="primary"
            onCancel={closeModal}
            onConfirm={confirmReturnPlayer}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal?.type === 'add-player' && (
          <AddPlayerDialog
            value={playerName}
            history={playerNamesHistory}
            existingNames={existingPlayerNames}
            onChange={setPlayerName}
            onCancel={closeModal}
            onConfirm={() => addPlayerByName(playerName)}
            onSelectHistoryName={addPlayerByName}
            onDeleteHistoryName={deleteHistoryName}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal?.type === 'settings' && <SettingsDialog settings={state.settings} onChange={updateSettings} onClose={closeModal} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal?.type === 'reset-tournament' && (
          <ConfirmActionDialog
            title="Сбросить турнир?"
            description="Все игроки, бай-ины и оплаты будут удалены. История имён сохранится."
            confirmText="Сбросить"
            onCancel={closeModal}
            onConfirm={resetTournament}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{modal?.type === 'reference' && <ReferenceDialog onClose={closeModal} />}</AnimatePresence>

      <AnimatePresence>{modal?.type === 'totals' && <TotalsDialog totals={totals} onClose={closeModal} />}</AnimatePresence>
    </div>
  );
}
