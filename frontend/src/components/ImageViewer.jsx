import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Star } from 'lucide-react';
import api from '../api/axios';

export default function ImageViewer({ files, index, onClose, onIndexChange, onFavorite }) {
  const [zoom, setZoom] = useState(1);
  const file = files[index];

  useEffect(() => {
    setZoom(1);
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < files.length - 1) onIndexChange(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, files.length, onClose, onIndexChange]);

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 fade-in">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="truncate text-sm">{file.originalName}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="icon-btn-dark">
            <ZoomOut className="h-5 w-5" />
          </button>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="icon-btn-dark">
            <ZoomIn className="h-5 w-5" />
          </button>
          <button onClick={() => onFavorite(file)} className="icon-btn-dark">
            <Star className={`h-5 w-5 ${file.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <button onClick={download} className="icon-btn-dark">
            <Download className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="icon-btn-dark">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {index > 0 && (
          <button onClick={() => onIndexChange(index - 1)} className="absolute left-3 icon-btn-dark">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <img
          src={`${api.defaults.baseURL}/files/${file._id}/preview`}
          alt={file.originalName}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-[80vh] max-w-[90vw] object-contain transition-transform"
        />
        {index < files.length - 1 && (
          <button onClick={() => onIndexChange(index + 1)} className="absolute right-3 icon-btn-dark">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
