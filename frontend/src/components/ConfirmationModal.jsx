import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 fade-in">
      <div className="card w-full max-w-sm p-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger ? 'bg-red-100 dark:bg-red-950' : 'bg-brand-50 dark:bg-slate-800'
            }`}
          >
            <AlertTriangle className={`h-5 w-5 ${danger ? 'text-red-500' : 'text-brand-500'}`} />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn-primary ${danger ? '!bg-red-500 hover:!bg-red-600' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
