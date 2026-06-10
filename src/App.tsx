import { useState } from 'react';
import { AppModals } from '@/components/dialogs/AppModals';
import { PokerTimer } from '@/components/game/PokerTimer';
import { PlayersList } from '@/components/game/PlayersList';
import { AppHeader } from '@/components/layout/AppHeader';
import { FooterTotals } from '@/components/layout/FooterTotals';
import { TournamentControls } from '@/components/layout/TournamentControls';
import { useAppModal } from '@/hooks/useAppModal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { usePlayerNameHistory } from '@/hooks/usePlayerNameHistory';
import { useTournamentState } from '@/hooks/useTournamentState';
import type { PlayerCounterField } from '@/lib/game';

export default function PokerPointsPWA() {
  const tournament = useTournamentState();
  const playerNameHistory = usePlayerNameHistory();
  const appModal = useAppModal();
  const [playerName, setPlayerName] = useState('');
  const { modal } = appModal;

  useBodyScrollLock(Boolean(modal));
  const modalPlayer =
    modal && 'playerId' in modal ? tournament.state.players.find((player) => player.id === modal.playerId) || null : null;

  function closeModal() {
    appModal.closeModal();
  }

  function openAddPlayerDialog() {
    setPlayerName('');
    appModal.openAddPlayer();
  }

  function addPlayerByName(name: string) {
    const normalizedName = tournament.addPlayerByName(name);
    if (!normalizedName) return;

    playerNameHistory.rememberName(normalizedName);
    setPlayerName('');
    appModal.openAddPlayer();
  }

  function increment(playerId: string, field: PlayerCounterField) {
    tournament.increment(playerId, field);
  }

  function requestDecrement(playerId: string, field: PlayerCounterField) {
    const player = tournament.state.players.find((candidate) => candidate.id === playerId);
    if (!player || player[field] <= 0) return;
    appModal.openDecrementPlayerField(playerId, field, player.name);
  }

  function confirmDecrement() {
    if (modal?.type !== 'decrement-player-field') return;
    tournament.decrement(modal.playerId, modal.field);
    closeModal();
  }

  function toggleEliminated(playerId: string) {
    const player = tournament.state.players.find((candidate) => candidate.id === playerId);
    if (!player) return;

    if (player.isEliminated) {
      appModal.openReturnPlayer(playerId);
      return;
    }

    tournament.eliminate(playerId);
  }

  function confirmReturnPlayer() {
    if (modal?.type !== 'return-player') return;
    tournament.returnToGame(modal.playerId);
    closeModal();
  }

  function confirmDeletePlayer() {
    if (modal?.type !== 'delete-player') return;
    tournament.deletePlayer(modal.playerId);
    closeModal();
  }

  function resetTournament() {
    tournament.reset();
    setPlayerName('');
    closeModal();
  }

  function confirmResetTimer() {
    if (modal?.type !== 'reset-timer') return;
    tournament.resetTimerLevel();
    closeModal();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-b from-zinc-950 via-black to-black px-4 pb-24">
        <AppHeader onReference={appModal.openReference} onReset={appModal.openResetTournament} />

        <TournamentControls
          settings={tournament.state.settings}
          onSettings={appModal.openSettings}
          onPrizeSettings={appModal.openPrizeSettings}
          onAddPlayer={openAddPlayerDialog}
        />

        <PokerTimer
          settings={tournament.state.settings}
          timer={tournament.state.timer}
          onToggle={tournament.toggleTimer}
          onPreviousLevel={tournament.previousTimerLevel}
          onNextLevel={tournament.nextTimerLevel}
          onResetLevel={appModal.openResetTimer}
          onSettings={appModal.openTimerSettings}
          onAlertSettings={appModal.openTimerAlertSettings}
        />

        <PlayersList
          players={tournament.state.players}
          buyInPoints={tournament.state.settings.buyInPoints}
          eliminatedPlaces={tournament.eliminatedPlaces}
          onIncrementBuyIns={(playerId) => increment(playerId, 'buyIns')}
          onDecrementBuyIns={(playerId) => requestDecrement(playerId, 'buyIns')}
          onIncrementPaidEntries={(playerId) => increment(playerId, 'paidEntries')}
          onDecrementPaidEntries={(playerId) => requestDecrement(playerId, 'paidEntries')}
          onToggleEliminated={toggleEliminated}
          onDelete={appModal.openDeletePlayer}
        />
      </div>

      <FooterTotals totals={tournament.totals} onOpen={appModal.openTotals} />

      <AppModals
        modal={modal}
        modalPlayer={modalPlayer}
        settings={tournament.state.settings}
        timer={tournament.state.timer}
        totals={tournament.totals}
        prizePayouts={tournament.prizePayouts}
        playerName={playerName}
        playerNamesHistory={playerNameHistory.history}
        existingPlayerNames={tournament.existingPlayerNames}
        onPlayerNameChange={setPlayerName}
        onClose={closeModal}
        onUpdateSettings={tournament.updateSettings}
        onAddPlayer={addPlayerByName}
        onDeleteHistoryName={playerNameHistory.deleteName}
        onConfirmDecrement={confirmDecrement}
        onConfirmDeletePlayer={confirmDeletePlayer}
        onConfirmReturnPlayer={confirmReturnPlayer}
        onConfirmResetTimer={confirmResetTimer}
        onResetTournament={resetTournament}
      />
    </div>
  );
}
