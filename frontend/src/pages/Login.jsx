import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookHeart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(email, password);

      toast.success('Welcome back!');

      navigate(
        location.state?.from || '/dashboard',
        { replace: true }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm fade-in">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <BookHeart className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-bold">
            Welcome back
          </h1>

          <p className="text-sm text-slate-500">
            Log in to your Family Book vault
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={submit}
          className="card space-y-4 p-6"
        >

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="input pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((v) => !v)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot Password */}
          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-slate-500">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(e.target.checked)
                }
              />

              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="font-medium text-brand-500 hover:underline"
            >
              Forgot password?
            </Link>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <LoadingSpinner
                size="sm"
                className="border-white border-t-transparent"
              />
            ) : (
              'Login'
            )}
          </button>

        </form>

        {/* Signup removed */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Your Family Book account is private and protected.
        </p>

      </div>
    </div>
  );
}