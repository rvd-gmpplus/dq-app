export default function PageFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <div className="h-6 w-48 animate-pulse rounded-md bg-slate-100" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
    </div>
  );
}
