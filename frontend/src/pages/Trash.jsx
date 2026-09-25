import { useEffect, useState } from 'react';
import { Trash2, RotateCcw, XCircle } from 'lucide-react';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatBytes, formatDate } from '../utils/format';
import { useToast } from '../context/ToastContext';

export default function Trash() {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permTarget, setPermTarget] = useState(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trash');
      setFiles(res.data.data.files);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const restore = async (file) => {
    try {
      await api.patch(`/trash/${file._id}/restore`);
      setFiles((fs) => fs.filter((f) => f._id !== file._id));
      toast.success('File restored');
    } catch {
      toast.error('Could not restore file');
    }
  };

  const permanentDelete = async () => {
    try {
      await api.delete(`/trash/${permTarget._id}/permanent`);
      setFiles((fs) => fs.filter((f) => f._id !== permTarget._id));
      toast.success('File permanently deleted');
    } catch {
      toast.error('Could not delete file');
    } finally {
      setPermTarget(null);
    }
  };

  const emptyTrash = async () => {
    try {
      await api.delete('/trash/empty');
      setFiles([]);
      toast.success('Trash emptied');
    } catch {
      toast.error('Could not empty trash');
    } finally {
      setEmptyConfirm(false);
    }
  };

  return (
    <div className="fade-in">
      <Topbar
        title="Trash"
        actions={
          files.length > 0 && (
            <button className="btn-secondary text-red-500" onClick={() => setEmptyConfirm(true)}>
              Empty Trash
            </button>
          )
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState icon={Trash2} title="Trash is empty" description="Deleted files will appear here for 30 days." />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {files.map((f) => (
            <div key={f._id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{f.originalName}</p>
                <p className="text-xs text-slate-400">
                  {formatBytes(f.size)} · Deleted {formatDate(f.deletedAt)}
                </p>
              </div>
              <button onClick={() => restore(f)} className="btn-secondary !py-1.5 !px-3 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </button>
              <button
                onClick={() => setPermTarget(f)}
                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        open={!!permTarget}
        title="Delete permanently?"
        message={`"${permTarget?.originalName}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete Permanently"
        danger
        onConfirm={permanentDelete}
        onCancel={() => setPermTarget(null)}
      />
      <ConfirmationModal
        open={emptyConfirm}
        title="Empty trash?"
        message="All files in trash will be permanently deleted. This cannot be undone."
        confirmLabel="Empty Trash"
        danger
        onConfirm={emptyTrash}
        onCancel={() => setEmptyConfirm(false)}
      />
    </div>
  );
}
