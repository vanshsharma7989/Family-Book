import { Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, search, onSearchChange, actions }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop Topbar */}
      <div className="hidden lg:flex sticky top-0 z-30 mb-6 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/90 pb-4 pt-1 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex items-center gap-2">
          {onSearchChange && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search files..."
                className="input w-64 pl-9"
              />
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="lg:hidden sticky top-0 z-30 mb-4 bg-slate-50/95 pb-3 pt-1 backdrop-blur dark:bg-slate-950/95">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Family Book
            </p>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {onSearchChange && (
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your files..."
              className="input h-11 w-full rounded-xl bg-white pl-10 pr-4 shadow-sm dark:bg-slate-900"
            />
          </div>
        )}

        {actions && (
          <div className="mt-3 hidden">
            {actions}
          </div>
        )}
      </div>
    </>
  );
}
