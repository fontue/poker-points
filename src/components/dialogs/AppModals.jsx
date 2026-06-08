import { AnimatePresence } from 'framer-motion';
import { AddPlayerDialog } from './AddPlayerDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { ReferenceDialog } from './ReferenceDialog';
import { SettingsDialog } from './SettingsDialog';
import { TotalsDialog } from './TotalsDialog';

function getConfirmDialogProps(modal, modalPlayer, actions) {
  if (!modal) return null;

  if (modal.type === 'decrement-player-field') {
    return {
      title: 'Подтвердить уменьшение?',
      description: `Это действие уменьшит параметр игрока «${modal.playerName}».`,
      confirmText: 'Уменьшить',
      onConfirm: actions.onConfirmDecrement
    };
  }

  if (modal.type === 'delete-player' && modalPlayer) {
    return {
      title: 'Удалить игрока?',
      description: `Игрок «${modalPlayer.name}» будет удалён вместе со всеми его бай-инами и оплатами.`,
      confirmText: 'Удалить',
      onConfirm: actions.onConfirmDeletePlayer
    };
  }

  if (modal.type === 'return-player' && modalPlayer) {
    return {
      title: 'Вернуть игрока в игру?',
      description: `Игрок «${modalPlayer.name}» снова будет отмечен как «В игре».`,
      confirmText: 'Вернуть',
      confirmTone: 'primary',
      onConfirm: actions.onConfirmReturnPlayer
    };
  }

  if (modal.type === 'reset-tournament') {
    return {
      title: 'Сбросить турнир?',
      description: 'Все игроки, бай-ины и оплаты будут удалены. История имён сохранится.',
      confirmText: 'Сбросить',
      onConfirm: actions.onResetTournament
    };
  }

  return null;
}

export function AppModals({
  modal,
  modalPlayer,
  settings,
  totals,
  playerName,
  playerNamesHistory,
  existingPlayerNames,
  onPlayerNameChange,
  onClose,
  onUpdateSettings,
  onAddPlayer,
  onDeleteHistoryName,
  onConfirmDecrement,
  onConfirmDeletePlayer,
  onConfirmReturnPlayer,
  onResetTournament
}) {
  const confirmDialogProps = getConfirmDialogProps(modal, modalPlayer, {
    onConfirmDecrement,
    onConfirmDeletePlayer,
    onConfirmReturnPlayer,
    onResetTournament
  });

  function renderModal() {
    if (confirmDialogProps) {
      return <ConfirmActionDialog key={modal.type} {...confirmDialogProps} onCancel={onClose} />;
    }

    if (modal?.type === 'add-player') {
      return (
        <AddPlayerDialog
          key="add-player"
          value={playerName}
          history={playerNamesHistory}
          existingNames={existingPlayerNames}
          onChange={onPlayerNameChange}
          onCancel={onClose}
          onConfirm={() => onAddPlayer(playerName)}
          onSelectHistoryName={onAddPlayer}
          onDeleteHistoryName={onDeleteHistoryName}
        />
      );
    }

    if (modal?.type === 'settings') {
      return <SettingsDialog key="settings" settings={settings} onChange={onUpdateSettings} onClose={onClose} />;
    }

    if (modal?.type === 'reference') {
      return <ReferenceDialog key="reference" onClose={onClose} />;
    }

    if (modal?.type === 'totals') {
      return <TotalsDialog key="totals" totals={totals} onClose={onClose} />;
    }

    return null;
  }

  return <AnimatePresence>{renderModal()}</AnimatePresence>;
}
