import { Button } from '@/components/ui/button';
import { AppDialog } from './AppDialog';

const confirmButtonClasses = {
  destructive: 'bg-red-600 text-white',
  primary: 'bg-violet-600 text-white'
};

export function ConfirmActionDialog({
  title,
  description,
  confirmText,
  confirmTone = 'destructive',
  onCancel,
  onConfirm
}) {
  return (
    <AppDialog onClose={onCancel}>
      <div className="mb-3">
        <h3 className="text-lg font-bold">{title}</h3>
        {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onCancel} className="h-12 rounded-2xl bg-zinc-800 text-white">
          Отмена
        </Button>
        <Button onClick={onConfirm} className={`h-12 rounded-2xl ${confirmButtonClasses[confirmTone]}`}>
          {confirmText}
        </Button>
      </div>
    </AppDialog>
  );
}
