import { useState } from 'react';
import { AppModals } from '@/components/dialogs/AppModals';
import { PlayersList } from '@/components/game/PlayersList';
import { AppHeader } from '@/components/layout/AppHeader';
import { FooterTotals } from '@/components/layout/FooterTotals';
import { TournamentControls } from '@/components/layout/TournamentControls';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { usePlayerNameHistory } from '@/hooks/usePlayerNameHistory';
import { useTournamentState } from '@/hooks/useTournamentState';
import './App.css';

export default function PokerPointsPWA() {
  const tournament = useTournamentState();
  const playerNameHistory = usePlayerNameHistory();
  const [playerName, setPlayerName] = useState('');
  const [modal, setModal] = useState(null);

  useBodyScrollLock(Boolean(modal));
  const modalPlayer = modal?.playerId ? tournament.state.players.find((player) => player.id === modal.playerId) || null : null;

  function closeModal() {
    setModal(null);
  }

  function openAddPlayerDialog() {
    setPlayerName('');
    setModal({ type: 'add-player' });
  }

  function addPlayerByName(name) {
    const normalizedName = tournament.addPlayerByName(name);
    if (!normalizedName) return;

    playerNameHistory.rememberName(normalizedName);
    setPlayerName('');
    setModal({ type: 'add-player' });
  }

  function increment(playerId, field) {
    tournament.increment(playerId, field);
  }

  function requestDecrement(playerId, field) {
    const player = tournament.state.players.find((candidate) => candidate.id === playerId);
    if (!player || player[field] <= 0) return;
    setModal({ type: 'decrement-player-field', playerId, field, playerName: player.name });
  }

  function confirmDecrement() {
    if (modal?.type !== 'decrement-player-field') return;
    tournament.decrement(modal.playerId, modal.field);
    closeModal();
  }

  function toggleEliminated(playerId) {
    const player = tournament.state.players.find((candidate) => candidate.id === playerId);
    if (!player) return;

    if (player.isEliminated) {
      setModal({ type: 'return-player', playerId });
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-b from-zinc-950 via-black to-black px-4 pb-24">
        <AppHeader onReference={() => setModal({ type: 'reference' })} onReset={() => setModal({ type: 'reset-tournament' })} />

        <TournamentControls
          settings={tournament.state.settings}
          onSettings={() => setModal({ type: 'settings' })}
          onAddPlayer={openAddPlayerDialog}
        />

        <PlayersList
          players={tournament.state.players}
          buyInPoints={tournament.state.settings.buyInPoints}
          eliminatedPlaces={tournament.eliminatedPlaces}
          onIncrement={increment}
          onRequestDecrement={requestDecrement}
          onToggleEliminated={toggleEliminated}
          onDelete={(playerId) => setModal({ type: 'delete-player', playerId })}
        />
      </div>

      <FooterTotals totals={tournament.totals} onOpen={() => setModal({ type: 'totals' })} />

      <AppModals
        modal={modal}
        modalPlayer={modalPlayer}
        settings={tournament.state.settings}
        totals={tournament.totals}
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
        onResetTournament={resetTournament}
      />
    </div>
  );
}
