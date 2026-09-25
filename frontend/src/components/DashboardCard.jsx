export default function DashboardCard({ icon: Icon, label, value, tint = 'brand' }) {
  const tints = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-slate-800 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-slate-800 dark:text-emerald-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-slate-800 dark:text-violet-400',
  };
  return (
    <div className="card flex items-center gap-4 p-5 transition hover:shadow-md fade-in">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tints[tint]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
