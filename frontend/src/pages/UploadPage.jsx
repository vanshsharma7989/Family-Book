import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import UploadModal from '../components/UploadModal';
import { useToast } from '../context/ToastContext';

export default function UploadPage() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div className="fade-in">
      <Topbar title="Upload Files" />
      <p className="mb-4 text-sm text-slate-500">
        Drag and drop photos, PDFs, or documents below, or use the button to browse your device.
      </p>
      <UploadModal
        open={open}
        onClose={() => navigate('/dashboard')}
        defaultCategory="photo"
        onUploaded={() => toast.success('Upload complete')}
      />
      {!open && (
        <button className="btn-primary" onClick={() => setOpen(true)}>
          Open upload
        </button>
      )}
    </div>
  );
}
