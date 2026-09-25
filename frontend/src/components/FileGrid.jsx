// import FileCard from './FileCard';

// export default function FileGrid({ files, view, ...handlers }) {
//   if (view === 'list') {
//     return (
//       <div className="space-y-2">
//         {files.map((f) => (
//           <FileCard key={f._id} file={f} view="list" {...handlers} />
//         ))}
//       </div>
//     );
//   }
//   return (
//     <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
//       {files.map((f) => (
//         <FileCard key={f._id} file={f} view="grid" {...handlers} />
//       ))}
//     </div>
//   );
// }

import FileCard from './FileCard';

export default function FileGrid({ files, view, ...handlers }) {
  if (view === 'list') {
    return (
      <div className="space-y-2 pb-24 lg:pb-0">
        {files.map((f) => (
          <FileCard
            key={f._id}
            file={f}
            view="list"
            {...handlers}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        sm:gap-4
        md:grid-cols-4
        lg:grid-cols-5
        pb-24
        lg:pb-0
      "
    >
      {files.map((f) => (
        <FileCard
          key={f._id}
          file={f}
          view="grid"
          {...handlers}
        />
      ))}
    </div>
  );
}