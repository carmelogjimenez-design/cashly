export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-8">
      <div className="skeleton h-9 w-48" />
      <div className="skeleton mt-6 h-40 w-full rounded-3xl" />
      <div className="skeleton mt-4 h-12 w-full rounded-2xl" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
