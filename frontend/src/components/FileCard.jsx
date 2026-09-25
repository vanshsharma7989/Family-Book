import { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  MoreVertical,
  Star,
  Download,
  Share2,
  Trash2,
  Edit3,
  Eye,
  X,
  ArrowLeft,
} from 'lucide-react';

import { formatBytes, formatDate } from '../utils/format';
import api from '../api/axios';

const iconFor = (category) => {
  if (category === 'photo') return ImageIcon;
  if (category === 'pdf') return FileText;
  return FileText;
};

export default function FileCard({
  file,
  view = 'grid',
  onOpen,
  onFavorite,
  onDelete,
  onRename,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const menuRef = useRef(null);

  const Icon = iconFor(file.category);

  const isImage =
    file.category === 'photo' ||
    file.mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalName || '');

  const isPdf =
    file.category === 'pdf' ||
    file.mimeType === 'application/pdf' ||
    /\.pdf$/i.test(file.originalName || '');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setPdfPreviewOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  const openFile = () => {
    setMenuOpen(false);

    if (isPdf) {
      setPdfPreviewOpen(true);
      return;
    }

    if (onOpen) {
      onOpen(file);
    }
  };

  const download = async () => {
    try {
      const response = await api.get(
        `/files/${file._id}/download`,
        {
          responseType: 'blob',
        }
      );

      const blobUrl = window.URL.createObjectURL(
        response.data
      );

      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = file.originalName || 'download';

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }

    setMenuOpen(false);
  };

  /* =====================================================
     SHARE FILE
  ===================================================== */

  const shareFile = async () => {
    setMenuOpen(false);

    if (!navigator.share) {
      alert(
        'Direct file sharing is not supported in this browser. Please use Chrome or Safari on a supported device.'
      );
      return;
    }

    try {
      setSharing(true);

      const response = await api.get(
        `/files/${file._id}/download`,
        {
          responseType: 'blob',
        }
      );

      const blob = response.data;

      const sharedFile = new File(
        [blob],
        file.originalName || 'Family-Book-file',
        {
          type:
            blob.type ||
            file.mimeType ||
            'application/octet-stream',
        }
      );

      if (
        navigator.canShare &&
        !navigator.canShare({
          files: [sharedFile],
        })
      ) {
        alert(
          'This device or browser does not support sharing this file.'
        );
        return;
      }

      await navigator.share({
        files: [sharedFile],
        title: file.originalName || 'Family Book file',
      });
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Share failed:', error);
        alert('Could not share the file.');
      }
    } finally {
      setSharing(false);
    }
  };

  const moveToTrash = () => {
    if (onDelete) {
      onDelete(file);
    }

    setMenuOpen(false);
  };

  /* =====================================================
     ACTION MENU
  ===================================================== */

  const Menu = () => (
    <div
      ref={menuRef}
      className="
        absolute
        right-2
        top-11
        z-[9999]
        w-52
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        py-1
        shadow-2xl
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* Preview */}
      <button
        type="button"
        onClick={openFile}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-sm
          hover:bg-slate-100
          dark:hover:bg-slate-800
        "
      >
        <Eye className="h-4 w-4 shrink-0" />
        <span>Preview</span>
      </button>

      {/* Download */}
      <button
        type="button"
        onClick={download}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-sm
          hover:bg-slate-100
          dark:hover:bg-slate-800
        "
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Download</span>
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={shareFile}
        disabled={sharing}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-sm
          hover:bg-slate-100
          disabled:cursor-not-allowed
          disabled:opacity-50
          dark:hover:bg-slate-800
        "
      >
        <Share2 className="h-4 w-4 shrink-0" />
        <span>
          {sharing ? 'Sharing...' : 'Share'}
        </span>
      </button>

      {/* Rename */}
      <button
        type="button"
        onClick={() => {
          if (onRename) {
            onRename(file);
          }

          setMenuOpen(false);
        }}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-sm
          hover:bg-slate-100
          dark:hover:bg-slate-800
        "
      >
        <Edit3 className="h-4 w-4 shrink-0" />
        <span>Rename</span>
      </button>

      {/* Favorite */}
      <button
        type="button"
        onClick={() => {
          if (onFavorite) {
            onFavorite(file);
          }

          setMenuOpen(false);
        }}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-sm
          hover:bg-slate-100
          dark:hover:bg-slate-800
        "
      >
        <Star
          className={`h-4 w-4 ${
            file.favorite
              ? 'fill-amber-400 text-amber-400'
              : ''
          }`}
        />

        <span>
          {file.favorite
            ? 'Remove from Favorites'
            : 'Add to Favorites'}
        </span>
      </button>

      <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

      {/* Trash */}
      <button
        type="button"
        onClick={moveToTrash}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-left
          text-sm
          font-medium
          text-red-500
          hover:bg-red-50
          dark:hover:bg-red-950/30
        "
      >
        <Trash2 className="h-4 w-4 shrink-0" />
        <span>Move to Trash</span>
      </button>
    </div>
  );

  /* =====================================================
     LIST VIEW
  ===================================================== */

  if (view === 'list') {
    return (
      <>
        <div
          className="
            card
            relative
            flex
            items-center
            gap-3
            overflow-visible
            p-3
            transition
            hover:shadow-md
          "
        >
          {/* File icon */}
          <button
            type="button"
            onClick={openFile}
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-brand-50
              text-brand-500
              dark:bg-slate-800
            "
          >
            <Icon className="h-5 w-5" />
          </button>

          {/* File name */}
          <button
            type="button"
            onClick={openFile}
            className="
              min-w-0
              flex-1
              truncate
              text-left
              text-sm
              font-medium
            "
          >
            {file.originalName}
          </button>

          {/* Size */}
          <span
            className="
              hidden
              w-20
              text-xs
              text-slate-400
              sm:block
            "
          >
            {formatBytes(file.size)}
          </span>

          {/* Date */}
          <span
            className="
              hidden
              w-24
              text-xs
              text-slate-400
              md:block
            "
          >
            {formatDate(file.createdAt)}
          </span>

          {/* Favorite */}
          {file.favorite && (
            <Star
              className="
                h-4
                w-4
                shrink-0
                fill-amber-400
                text-amber-400
              "
            />
          )}

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                hover:bg-slate-100
                dark:hover:bg-slate-800
              "
              aria-label="File actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && <Menu />}
          </div>
        </div>

        {pdfPreviewOpen && (
          <PdfPreview
            file={file}
            onClose={() => setPdfPreviewOpen(false)}
          />
        )}
      </>
    );
  }

  /* =====================================================
     GRID VIEW
  ===================================================== */

  return (
    <>
      <div
        className="
          card
          group
          relative
          overflow-visible
          transition
          duration-200
          hover:-translate-y-0.5
          hover:shadow-lg
        "
      >
        {/* Preview */}
        <button
          type="button"
          onClick={openFile}
          className="
            flex
            h-32
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-t-xl
            bg-slate-50
            dark:bg-slate-800
            sm:h-36
            lg:h-40
          "
        >
          {isImage ? (
            <img
              src={`${api.defaults.baseURL}/files/${file._id}/preview`}
              alt={file.originalName}
              className="
                h-full
                w-full
                object-cover
                transition
                duration-300
                group-hover:scale-105
              "
              loading="lazy"
            />
          ) : isPdf ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  dark:bg-red-950/30
                "
              >
                <FileText className="h-8 w-8 text-red-500" />
              </div>

              <span className="mt-2 text-xs font-semibold text-red-500">
                PDF
              </span>
            </div>
          ) : (
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-brand-50
                text-brand-500
                dark:bg-slate-700
              "
            >
              <Icon className="h-7 w-7" />
            </div>
          )}
        </button>

        {/* Information */}
        <div className="p-2.5 sm:p-3">
          <div className="flex items-start gap-1">
            <button
              type="button"
              onClick={openFile}
              className="
                min-w-0
                flex-1
                truncate
                text-left
                text-sm
                font-medium
              "
              title={file.originalName}
            >
              {file.originalName}
            </button>

            {/* Menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setMenuOpen((value) => !value)
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  hover:bg-slate-100
                  dark:hover:bg-slate-800
                "
                aria-label="File actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && <Menu />}
            </div>
          </div>

          {/* Meta */}
          <div
            className="
              mt-1
              flex
              items-center
              justify-between
              gap-2
              text-xs
              text-slate-400
            "
          >
            <span className="truncate">
              {formatBytes(file.size)}
            </span>

            {file.favorite && (
              <Star
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  fill-amber-400
                  text-amber-400
                "
              />
            )}
          </div>
        </div>
      </div>

      {pdfPreviewOpen && (
        <PdfPreview
          file={file}
          onClose={() => setPdfPreviewOpen(false)}
        />
      )}
    </>
  );
}

/* =====================================================
   PDF PREVIEW
===================================================== */

function PdfPreview({ file, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await api.get(
          `/files/${file._id}/preview`,
          {
            responseType: 'blob',
          }
        );

        const pdfBlob = new Blob(
          [response.data],
          {
            type: 'application/pdf',
          }
        );

        objectUrl = window.URL.createObjectURL(
          pdfBlob
        );

        setPdfUrl(objectUrl);
      } catch (err) {
        console.error(
          'PDF preview failed:',
          err
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file._id]);

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        bg-black/70
        backdrop-blur-sm
      "
    >
      {/* Header */}
      <div
        className="
          flex
          h-14
          items-center
          justify-between
          bg-white
          px-2
          shadow
          dark:bg-slate-900
          sm:px-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
            sm:gap-3
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              hover:bg-slate-100
              dark:hover:bg-slate-800
            "
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <FileText className="h-5 w-5 shrink-0 text-red-500" />

          <span
            className="
              max-w-[220px]
              truncate
              text-sm
              font-medium
              sm:max-w-[400px]
            "
            title={file.originalName}
          >
            {file.originalName}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            hover:bg-slate-100
            dark:hover:bg-slate-800
          "
          aria-label="Close PDF preview"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* PDF content */}
      <div
        className="
          h-[calc(100vh-56px)]
          bg-slate-200
          p-1
          dark:bg-slate-950
          sm:p-2
        "
      >
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div
              className="
                rounded-xl
                bg-white
                px-5
                py-4
                shadow
                dark:bg-slate-900
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-slate-300
                    border-t-red-500
                  "
                />

                <span className="text-sm">
                  Loading PDF...
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center p-4">
            <div
              className="
                w-full
                max-w-sm
                rounded-2xl
                bg-white
                p-6
                text-center
                shadow
                dark:bg-slate-900
              "
            >
              <FileText className="mx-auto h-12 w-12 text-red-500" />

              <h3 className="mt-4 font-semibold">
                Unable to preview PDF
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                The PDF could not be loaded.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="
                  mt-5
                  rounded-xl
                  bg-brand-500
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  hover:bg-brand-600
                "
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <iframe
            src={pdfUrl}
            title={file.originalName}
            className="
              h-full
              w-full
              rounded-lg
              border-0
              bg-white
            "
          />
        )}
      </div>
    </div>
  );
}