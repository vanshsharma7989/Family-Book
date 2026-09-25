export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-0.5 text-center sm:flex-row sm:gap-2">
        <span className="text-[11px] text-slate-400 sm:text-xs">
          © 2026 Family Book
        </span>

        <span className="hidden text-slate-300 sm:inline">•</span>

        <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
          Developed by Vansh Sharma
        </span>
      </div>
    </footer>
  );
}