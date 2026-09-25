import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookHeart } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <BookHeart className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Set a new password</h1>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : 'Reset Password'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-brand-500 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
