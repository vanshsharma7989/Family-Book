import { useEffect, useState } from 'react';
import {
  User,
  Shield,
  HardDrive,
  Palette,
  Monitor,
  LogOut,
} from 'lucide-react';

import api from '../api/axios';
import Topbar from '../components/Topbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatBytes, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function Settings() {
  const [tab, setTab] = useState('account');

  return (
    <div className="fade-in">
      <Topbar title="Settings" />

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-px dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-xl">
        {tab === 'account' && <AccountTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'storage' && <StorageTab />}
        {tab === 'appearance' && <AppearanceTab />}
      </div>
    </div>
  );
}

/* =====================================================
   ACCOUNT TAB
===================================================== */

function AccountTab() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(
        'New password must be different from current password'
      );
      return;
    }

    setLoading(true);

    try {
      await api.post('/security/change-password', {
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');

      toast.success(
        'Password changed. Please log in again.'
      );

      /*
       * Backend revokes all sessions after password change.
       * Logout clears the current frontend auth state.
       */
      await logout();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Could not change password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">
          Profile
        </h3>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">
              Name
            </p>

            <p className="font-medium">
              {user?.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Email
            </p>

            <p className="font-medium">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <form
        onSubmit={submit}
        className="card space-y-3 p-5"
      >
        <div>
          <h3 className="font-semibold">
            Change Password
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            After changing your password, you will be
            logged out from all devices.
          </p>
        </div>

        {/* Current Password */}
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(e.target.value)
          }
          className="input"
        />

        {/* New Password */}
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="New password (min 8 characters)"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          className="input"
        />

        {/* Update */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? 'Updating…'
            : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

/* =====================================================
   SECURITY TAB
===================================================== */

function SecurityTab() {
  const toast = useToast();
  const { logout } = useAuth();

  const [sessions, setSessions] = useState(null);
  const [history, setHistory] = useState(null);
  const [logoutLoading, setLogoutLoading] =
    useState(false);

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        const [sessionsRes, historyRes] =
          await Promise.all([
            api.get('/security/sessions'),
            api.get('/security/login-history'),
          ]);

        setSessions(
          sessionsRes.data.data.sessions
        );

        setHistory(
          historyRes.data.data.history
        );
      } catch (error) {
        console.error(
          'Failed to load security data:',
          error
        );

        toast.error(
          'Could not load security information'
        );

        setSessions([]);
        setHistory([]);
      }
    };

    loadSecurityData();
  }, []);

  const logoutAll = async () => {
    setLogoutLoading(true);

    try {
      await api.post('/security/logout-all');

      toast.success(
        'Logged out from all devices'
      );

      await logout();
    } catch {
      toast.error(
        'Could not log out all sessions'
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      <div className="card p-5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold">
            Active Sessions
          </h3>

          <button
            onClick={logoutAll}
            disabled={logoutLoading}
            className="btn-secondary !px-3 !py-1.5 text-xs text-red-500 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />

            {logoutLoading
              ? 'Logging out...'
              : 'Logout all devices'}
          </button>
        </div>

        {!sessions ? (
          <LoadingSpinner size="sm" />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-400">
            No active sessions
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {sessions.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <p className="truncate">
                    {s.device}
                  </p>

                  <p className="text-xs text-slate-400">
                    {s.ipAddress} · since{' '}
                    {formatDate(s.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login History */}
      <div className="card p-5">
        <h3 className="mb-3 font-semibold">
          Login History
        </h3>

        {!history ? (
          <LoadingSpinner size="sm" />
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400">
            No login history
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {history.map((h) => (
              <div
                key={h._id}
                className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-800"
              >
                <span
                  className={
                    h.success
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }
                >
                  {h.success
                    ? 'Successful login'
                    : 'Failed attempt'}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(
                    h.timestamp
                  ).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   STORAGE TAB
===================================================== */

function StorageTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get(
          '/files/stats'
        );

        setStats(res.data.data);
      } catch (err) {
        console.error(
          'Failed to load storage stats:',
          err
        );

        setError(true);
      }
    };

    loadStats();
  }, []);

  if (error) {
    return (
      <div className="card p-5">
        <p className="text-sm text-red-500">
          Could not load storage information.
        </p>
      </div>
    );
  }

  if (!stats) {
    return <LoadingSpinner size="sm" />;
  }

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold">
        Storage
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">
            Total files
          </p>

          <p className="text-lg font-bold">
            {stats.totalFiles}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">
            Storage used
          </p>

          <p className="text-lg font-bold">
            {formatBytes(stats.storageUsed)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   APPEARANCE TAB
===================================================== */

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  const options = [
    {
      id: 'light',
      label: 'Light',
    },
    {
      id: 'dark',
      label: 'Dark',
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
    },
  ];

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold">
        Appearance
      </h3>

      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              theme === o.id
                ? 'border-brand-400 bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {o.icon && (
              <o.icon className="mr-1 inline h-4 w-4" />
            )}

            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}