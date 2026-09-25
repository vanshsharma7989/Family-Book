import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Star,
  Settings,
  LogOut,
  BookHeart,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/photos', label: 'Photos', icon: FolderOpen },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/pdfs', label: 'PDFs', icon: FolderOpen },
  { to: '/upload', label: 'Upload', icon: Plus },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/trash', label: 'Trash', icon: FolderOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const mobileLinks = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/photos', label: 'Files', icon: FolderOpen },
  { to: '/favorites', label: 'Favorites', icon: Star },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:sticky lg:top-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <BookHeart className="h-5 w-5" />
          </div>

          <span className="text-lg font-bold">
            Family Book
          </span>
        </div>

        {/* Desktop navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop account */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 truncate px-3 text-xs text-slate-400">
            {user?.email}
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-slate-200
          bg-white/95
          px-3
          pb-[max(8px,env(safe-area-inset-bottom))]
          pt-2
          shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
          backdrop-blur-xl
          dark:border-slate-800
          dark:bg-slate-950/95
          lg:hidden
        "
      >
        <div className="relative mx-auto flex max-w-md items-end justify-around">
          {mobileLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition ${
                  isActive
                    ? 'text-brand-500'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                    }`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Floating upload button */}
          <NavLink
            to="/upload"
            aria-label="Upload files"
            className="
              absolute
              -top-8
              left-1/2
              flex
              h-14
              w-14
              -translate-x-1/2
              items-center
              justify-center
              rounded-full
              bg-brand-500
              text-white
              shadow-lg
              shadow-brand-500/30
              ring-4
              ring-white
              transition
              hover:scale-105
              active:scale-95
              dark:ring-slate-950
            "
          >
            <Plus className="h-7 w-7" />
          </NavLink>
        </div>
      </nav>
    </>
  );
}