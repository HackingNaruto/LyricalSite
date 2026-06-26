export default function Loading() {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full gradient-primary animate-pulse" />
      <p className="text-sm font-semibold text-slate-400">Loading...</p>
    </div>
  );
}
