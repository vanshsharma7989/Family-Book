import { useCallback, useEffect, useState } from 'react';
import { Image as ImageIcon, FileText, File as FileIcon, Star, Upload as UploadIcon } from 'lucide-react';
import api from '../api/axios';
import Topbar from '../components/Topbar';
import FilterBar from '../components/FilterBar';
import FileGrid from '../components/FileGrid';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import ImageViewer from '../components/ImageViewer';
import PdfViewer from '../components/PdfViewer';
import UploadModal from '../components/UploadModal';
import { useToast } from '../context/ToastContext';

const META = {
  photo: { title: 'Photos', icon: ImageIcon, empty: 'No photos yet' },
  document: { title: 'Documents', icon: FileText, empty: 'No documents yet' },
  pdf: { title: 'PDFs', icon: FileIcon, empty: 'No PDFs yet' },
  favorites: { title: 'Favorites', icon: Star, empty: 'No favorites yet' },
};

// Shared browser used by /photos, /documents, /pdfs and /favorites
export default function FileBrowser({ mode }) {
  const meta = META[mode];
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [viewerIndex, setViewerIndex] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (search) params.search = search;
      let res;
      if (mode === 'favorites') {
        res = await api.get('/favorites');
        res = { data: { data: { files: res.data.data.files } } };
      } else {
        params.category = mode;
        res = await api.get('/files', { params });
      }
      setFiles(res.data.data.files);
    } catch {
      toast.error('Could not load files');
    } finally {
      setLoading(false);
    }
  }, [mode, sort, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const photoFiles = files.filter((f) => f.category === 'photo');

  const handleOpen = (file) => {
    if (file.category === 'photo') {
      const idx = photoFiles.findIndex((f) => f._id === file._id);
      setViewerIndex(idx);
    } else if (file.category === 'pdf') {
      setPdfFile(file);
    } else {
      toast.info('Preview unavailable for this file type. Use download instead.');
    }
  };

  const handleFavorite = async (file) => {
    try {
      const res = await api.patch(`/files/${file._id}/favorite`);
      setFiles((fs) =>
        mode === 'favorites' && !res.data.data.favorite
          ? fs.filter((f) => f._id !== file._id)
          : fs.map((f) => (f._id === file._id ? res.data.data : f))
      );
      toast.success(res.data.data.favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Could not update favorite');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/files/${deleteTarget._id}`);
      setFiles((fs) => fs.filter((f) => f._id !== deleteTarget._id));
      toast.success('Moved to trash');
    } catch {
      toast.error('Could not delete file');
    } finally {
      setDeleteTarget(null);
    }
  };

  const submitRename = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/files/${renameTarget._id}`, { originalName: renameValue });
      setFiles((fs) => fs.map((f) => (f._id === renameTarget._id ? res.data.data : f)));
      toast.success('File renamed');
    } catch {
      toast.error('Could not rename file');
    } finally {
      setRenameTarget(null);
    }
  };

  return (
    <div className="fade-in">
      <Topbar
        title={meta.title}
        search={search}
        onSearchChange={setSearch}
        actions={
          <button className="btn-primary" onClick={() => setUploadOpen(true)}>
            <UploadIcon className="h-4 w-4" /> Upload
          </button>
        }
      />
      <FilterBar view={view} setView={setView} sort={sort} setSort={setSort} />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={meta.icon}
          title={meta.empty}
          description="Files you add here will show up in this view."
          action={
            <button className="btn-primary" onClick={() => setUploadOpen(true)}>
              Upload files
            </button>
          }
        />
      ) : (
        <FileGrid
          files={files}
          view={view}
          onOpen={handleOpen}
          onFavorite={handleFavorite}
          onDelete={setDeleteTarget}
          onRename={(f) => {
            setRenameTarget(f);
            setRenameValue(f.originalName);
          }}
        />
      )}

      {viewerIndex !== null && (
        <ImageViewer
          files={photoFiles}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
          onFavorite={handleFavorite}
        />
      )}
      {pdfFile && <PdfViewer file={pdfFile} onClose={() => setPdfFile(null)} />}

      <ConfirmationModal
        open={!!deleteTarget}
        title="Move to trash?"
        message={`"${deleteTarget?.originalName}" will be moved to Trash. You can restore it later.`}
        confirmLabel="Move to Trash"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 fade-in">
          <form onSubmit={submitRename} className="card w-full max-w-sm p-6">
            <h3 className="mb-4 font-semibold">Rename file</h3>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="input"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setRenameTarget(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <UploadModal
  open={uploadOpen}
  defaultCategory={mode === 'favorites' ? 'photo' : mode}
  onClose={() => setUploadOpen(false)}
  onUploaded={() => {
    load();
    toast.success('Upload complete');
  }}
/>
    </div>
  );
}
