import { Link } from 'react-router-dom';
import {
  BookHeart,
  LockKeyhole,
  ShieldCheck,
  Image,
  ChevronRight,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* App Container */}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-5 dark:bg-slate-950 sm:max-w-lg">

        {/* Top App Header */}
        <header className="flex items-center justify-between py-5">

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
              <BookHeart className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Family Book
              </p>
              <p className="text-[10px] text-slate-400">
                Private file vault
              </p>
            </div>
          </div>

          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            Private
          </div>

        </header>

        {/* Main */}
        <main className="flex flex-1 flex-col justify-center pb-8">

          {/* Logo */}
          <div className="text-center">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-brand-500 text-white shadow-xl shadow-brand-500/20">
              <BookHeart className="h-10 w-10" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Family Book
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your private place for family photos, documents and memories.
            </p>

          </div>

          {/* Login Button */}
          <div className="mt-9">

            <Link
              to="/login"
              className="
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-brand-500
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-brand-500/20
                transition
                hover:bg-brand-600
                active:scale-[0.98]
              "
            >
              Login

              <ChevronRight className="h-4 w-4" />
            </Link>

          </div>

          {/* Features */}
          <div className="mt-8 space-y-3">

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-500 shadow-sm dark:bg-slate-800">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Private by design
                </h3>

                <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Your files are accessible only after secure login.
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-500 shadow-sm dark:bg-slate-800">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Secure access
                </h3>

                <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Authentication protects your personal vault.
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-500 shadow-sm dark:bg-slate-800">
                <Image className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Everything in one place
                </h3>

                <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Photos, PDFs and important documents together.
                </p>
              </div>

            </div>

          </div>

        </main>

        {/* Bottom */}
        <footer className="pb-6 pt-2 text-center">

          <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure private family vault
          </div>

          <p className="text-[10px] text-slate-300 dark:text-slate-600">
            Family Book
          </p>

        </footer>

      </div>
    </div>
  );
}