export function ToolSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-5">
      <div className="text-center space-y-3">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-white/20" />
        <div className="mx-auto h-8 w-48 rounded-lg bg-white/20" />
        <div className="mx-auto h-4 w-72 rounded bg-white/10" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/10 p-8 h-48" />
    </div>
  );
}
