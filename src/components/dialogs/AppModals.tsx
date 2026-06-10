import { AnimatePresence } from 'framer-motion';
import { AddPlayerDialog } from './AddPlayerDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { PrizeSettingsDialog } from './PrizeSettingsDialog';
import { ReferenceDialog } from './ReferenceDialog';
import { SettingsDialog } from './SettingsDialog';
import { TimerAlertSettingsDialog } from './TimerAlertSettingsDialog';
import { TimerSettingsDialog } from './TimerSettingsDialog';
import { TotalsDialog } from './TotalsDialog';
import type { Player, PrizePayout, Settings, Totals } from '@/lib/game';
import type { AppModal } from '@/lib/modal';
import type { ConfirmActionDialogProps } from './ConfirmActionDialog';

type AppModalsProps = {
  modal: AppModal | null;
  modalPlayer: Player | null;
  settings: Settings;
  totals: Totals;
  prizePayouts: PrizePayout[];
  playerName: string;
  playerNamesHistory: string[];
  existingPlayerNames: string[];
  onPlayerNameChange: (name: string) => void;
  onClose: () => void;
  onUpdateSettings: (settingsPatch: Partial<Settings>) => void;
  onAddPlayer: (name: string) => void;
  onDeleteHistoryName: (name: string) => void;
  onConfirmDecrement: () => void;
  onConfirmDeletePlayer: () => void;
  onConfirmReturnPlayer: () => void;
  onConfirmResetTimer: () => void;
  onResetTournament: () => void;
};

type ConfirmActions = Pick<
  AppModalsProps,
  'onConfirmDecrement' | 'onConfirmDeletePlayer' | 'onConfirmReturnPlayer' | 'onConfirmResetTimer' | 'onResetTournament'
>;

function getConfirmDialogProps(
  modal: AppModal | null,
  modalPlayer: Player | null,
  actions: ConfirmActions
): Omit<ConfirmActionDialogProps, 'onCancel'> | null {
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
      confirmTone: 'primary' as const,
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

  if (modal.type === 'reset-timer') {
    return {
      title: 'Сбросить таймер?',
      description: 'Таймер остановится, вернётся на первый уровень и выставит полное время первого уровня.',
      confirmText: 'Сбросить',
      onConfirm: actions.onConfirmResetTimer
    };
  }

  return null;
}

export function AppModals({
  modal,
  modalPlayer,
  settings,
  totals,
  prizePayouts,
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
  onConfirmResetTimer,
  onResetTournament
}: AppModalsProps) {
  const confirmDialogProps = getConfirmDialogProps(modal, modalPlayer, {
    onConfirmDecrement,
    onConfirmDeletePlayer,
    onConfirmReturnPlayer,
    onConfirmResetTimer,
    onResetTournament
  });

  function renderModal() {
    if (confirmDialogProps) {
      return <ConfirmActionDialog key={modal?.type || 'confirm'} {...confirmDialogProps} onCancel={onClose} />;
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

    if (modal?.type === 'prize-settings') {
      return <PrizeSettingsDialog key="prize-settings" settings={settings} onChange={onUpdateSettings} onClose={onClose} />;
    }

    if (modal?.type === 'timer-settings') {
      return <TimerSettingsDialog key="timer-settings" settings={settings} onChange={onUpdateSettings} onClose={onClose} />;
    }

    if (modal?.type === 'timer-alert-settings') {
      return <TimerAlertSettingsDialog key="timer-alert-settings" settings={settings} onChange={onUpdateSettings} onClose={onClose} />;
    }

    if (modal?.type === 'reference') {
      return <ReferenceDialog key="reference" onClose={onClose} />;
    }

    if (modal?.type === 'totals') {
      return <TotalsDialog key="totals" totals={totals} prizePayouts={prizePayouts} onClose={onClose} />;
    }

    return null;
  }

  return <AnimatePresence>{renderModal()}</AnimatePresence>;
}
