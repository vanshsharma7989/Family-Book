import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, LockKeyhole } from 'lucide-react';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/forgot-password', {
        email: email.trim(),
      });

      setSubmitted(true);

      toast.success(
        'If the account exists, a reset link has been sent.'
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Logo / Icon */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <LockKeyhole className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your email and we'll help you reset your password.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? 'Sending...'
                    : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                  <Mail className="h-6 w-6" />
                </div>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Check your email
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  If an account exists for this email address,
                  you'll receive instructions to reset your password.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Try another email
                </button>
              </div>
            )}
          </div>

          {/* Back to login */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}