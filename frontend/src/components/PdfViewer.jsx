import { X, Download } from 'lucide-react';
import api from '../api/axios';

export default function PdfViewer({ file, onClose }) {
  if (!file) return null;

  const download = async () => {
    const res = await api.get(`/files/${file._id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const previewUrl = `${api.defaults.baseURL}/files/${file._id}/preview`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 fade-in">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="truncate text-sm">{file.originalName}</p>
        <div className="flex items-center gap-1">
          <button onClick={download} className="icon-btn-dark">
            <Download className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="icon-btn-dark">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-slate-800">
        <iframe title={file.originalName} src={previewUrl} className="h-full w-full" />
      </div>
    </div>
  );
}
