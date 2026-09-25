// import { LayoutGrid, List, ArrowDownUp } from 'lucide-react';

// const SORTS = [
//   { value: 'newest', label: 'Newest' },
//   { value: 'oldest', label: 'Oldest' },
//   { value: 'name_asc', label: 'Name A-Z' },
//   { value: 'name_desc', label: 'Name Z-A' },
//   { value: 'size', label: 'Size' },
// ];

// export default function FilterBar({ view, setView, sort, setSort }) {
//   return (
//     <div className="mb-4 flex items-center justify-between gap-2">
//       <div className="relative">
//         <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//         <select
//           value={sort}
//           onChange={(e) => setSort(e.target.value)}
//           className="input appearance-none pl-9 pr-8 py-2 text-sm w-40"
//         >
//           {SORTS.map((s) => (
//             <option key={s.value} value={s.value}>
//               {s.label}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
//         <button
//           onClick={() => setView('grid')}
//           className={`p-2 ${view === 'grid' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-900'}`}
//         >
//           <LayoutGrid className="h-4 w-4" />
//         </button>
//         <button
//           onClick={() => setView('list')}
//           className={`p-2 ${view === 'list' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-900'}`}
//         >
//           <List className="h-4 w-4" />
//         </button>
//       </div>
//     </div>
//   );
// }

import { LayoutGrid, List, ArrowDownUp } from 'lucide-react';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'size', label: 'Size' },
];

export default function FilterBar({ view, setView, sort, setSort }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      {/* Sort */}
      <div className="relative min-w-0 flex-1 sm:flex-none">
        <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="
            input
            w-full
            appearance-none
            py-2
            pl-9
            pr-8
            text-sm
            sm:w-40
          "
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid / List */}
      <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setView('grid')}
          aria-label="Grid view"
          className={`
            flex h-10 w-10 items-center justify-center
            transition
            ${
              view === 'grid'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          `}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setView('list')}
          aria-label="List view"
          className={`
            flex h-10 w-10 items-center justify-center
            transition
            ${
              view === 'list'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }
          `}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}