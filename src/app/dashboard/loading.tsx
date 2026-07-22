export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="skeleton h-5 w-28" />
          <div className="skeleton mt-2 h-8 w-56" />
        </div>
        <div className="skeleton h-11 w-11 rounded-2xl" />
      </div>
      <div className="skeleton mt-6 h-56 w-full rounded-3xl" />
      <div className="skeleton mt-4 h-24 w-full rounded-3xl" />
      <div className="skeleton mt-4 h-28 w-full rounded-3xl" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
