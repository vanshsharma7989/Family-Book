import { useCallback, useRef, useState } from 'react';
import {
  UploadCloud,
  X,
  FileCheck2,
  FileX2,
  RotateCcw,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

import api from '../api/axios';
import { formatBytes } from '../utils/format';

const ACCEPTED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 25 * 1024 * 1024;

const detectCategory = (file) => {
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  if (
    type.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(name)
  ) {
    return 'photo';
  }

  if (
    type === 'application/pdf' ||
    name.endsWith('.pdf')
  ) {
    return 'pdf';
  }

  return 'document';
};

const categoryLabel = (category) => {
  if (category === 'photo') return 'Photo';
  if (category === 'pdf') return 'PDF';
  return 'Document';
};

const CategoryIcon = ({ category }) => {
  if (category === 'photo') {
    return <ImageIcon className="h-5 w-5 text-brand-500" />;
  }

  if (category === 'pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }

  return <FileText className="h-5 w-5 text-blue-500" />;
};

export default function UploadModal({
  open,
  onClose,
  onUploaded,
}) {
  const [queue, setQueue] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);

    const items = files.map((file) => {
      let error = null;

      const accepted =
        ACCEPTED.includes(file.type) ||
        /\.(jpg|jpeg|png|webp|gif|bmp|pdf|doc|docx|txt|rtf)$/i.test(
          file.name
        );

      if (!accepted) {
        error = 'Unsupported file type';
      } else if (file.size > MAX_SIZE) {
        error = 'File exceeds 25MB limit';
      }

      return {
        file,
        category: detectCategory(file),
        status: error ? 'error' : 'pending',
        progress: 0,
        error,
      };
    });

    setQueue((current) => [...current, ...items]);
  };

  const uploadOne = async (item, idx) => {
    setQueue((current) =>
      current.map((it, i) =>
        i === idx
          ? {
              ...it,
              status: 'uploading',
              progress: 0,
            }
          : it
      )
    );

    const formData = new FormData();

    formData.append('files', item.file);
    formData.append('category', item.category);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },

        onUploadProgress: (event) => {
          if (!event.total) return;

          const progress = Math.round(
            (event.loaded * 100) / event.total
          );

          setQueue((current) =>
            current.map((it, i) =>
              i === idx
                ? {
                    ...it,
                    progress,
                  }
                : it
            )
          );
        },
      });

      setQueue((current) =>
        current.map((it, i) =>
          i === idx
            ? {
                ...it,
                status: 'done',
                progress: 100,
              }
            : it
        )
      );
    } catch (error) {
      setQueue((current) =>
        current.map((it, i) =>
          i === idx
            ? {
                ...it,
                status: 'error',
                error:
                  error.response?.data?.message ||
                  'Upload failed',
              }
            : it
        )
      );
    }
  };

  const startUpload = async () => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'pending') {
        // eslint-disable-next-line no-await-in-loop
        await uploadOne(queue[i], i);
      }
    }

    onUploaded?.();
  };

  const retry = (idx) => {
    if (queue[idx]) {
      uploadOne(queue[idx], idx);
    }
  };

  const remove = (idx) => {
    setQueue((current) =>
      current.filter((_, i) => i !== idx)
    );
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  }, []);

  if (!open) return null;

  const pendingCount = queue.filter(
    (item) => item.status === 'pending'
  ).length;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-center
        bg-black/50
        p-0
        backdrop-blur-sm
        fade-in
        sm:items-center
        sm:p-4
      "
    >
      <div
        className="
          card
          max-h-[92vh]
          w-full
          overflow-y-auto
          rounded-t-3xl
          p-5
          sm:max-w-lg
          sm:rounded-2xl
          sm:p-6
        "
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Upload Files
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              File category is detected automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop area */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex
            min-h-[190px]
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-2xl
            border-2
            border-dashed
            px-5
            py-8
            text-center
            transition
            ${
              dragOver
                ? 'border-brand-400 bg-brand-50 dark:bg-slate-800'
                : 'border-slate-200 dark:border-slate-700'
            }
          `}
        >
          <div
            className="
              mb-3
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-brand-50
              dark:bg-slate-800
            "
          >
            <UploadCloud className="h-7 w-7 text-brand-500" />
          </div>

          <p className="text-sm font-semibold">
            Choose files to upload
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Tap here or drag & drop files
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {['JPG', 'PNG', 'WEBP', 'PDF', 'DOC', 'DOCX', 'TXT'].map(
              (type) => (
                <span
                  key={type}
                  className="
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-[10px]
                    font-medium
                    text-slate-500
                    dark:bg-slate-800
                    dark:text-slate-400
                  "
                >
                  {type}
                </span>
              )
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            Maximum 25MB per file
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">
                Selected files
              </p>

              <span className="text-xs text-slate-400">
                {queue.length} file
                {queue.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {queue.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-slate-100
                    p-3
                    dark:border-slate-800
                  "
                >
                  {/* Category */}
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-50
                      dark:bg-slate-800
                    "
                  >
                    <CategoryIcon category={item.category} />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>
                        {formatBytes(item.file.size)}
                      </span>

                      <span>•</span>

                      <span
                        className={
                          item.category === 'pdf'
                            ? 'font-medium text-red-500'
                            : item.category === 'photo'
                            ? 'font-medium text-brand-500'
                            : 'font-medium text-blue-500'
                        }
                      >
                        {categoryLabel(item.category)}
                      </span>
                    </div>

                    {item.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                          <span>Uploading</span>
                          <span>{item.progress}%</span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full bg-brand-500 transition-all"
                            style={{
                              width: `${item.progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {item.error}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  {item.status === 'done' && (
                    <FileCheck2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  )}

                  {item.status === 'error' && (
                    <button
                      type="button"
                      onClick={() => retry(idx)}
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        hover:bg-slate-100
                        dark:hover:bg-slate-800
                      "
                      title="Retry"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}

                  {item.status !== 'uploading' &&
                    item.status !== 'done' && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          hover:bg-slate-100
                          dark:hover:bg-slate-800
                        "
                        title="Remove"
                      >
                        <FileX2 className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-2
          "
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="btn-primary"
            disabled={pendingCount === 0}
            onClick={startUpload}
          >
            Upload
            {pendingCount > 0 ? ` ${pendingCount}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}