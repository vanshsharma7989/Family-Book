export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-slate-800">
          <Icon className="h-8 w-8 text-brand-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
