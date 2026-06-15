export default function AppLoading() {
  return (
    <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-6">
      <div className="h-6 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 w-full animate-pulse rounded-2xl bg-surface border border-border" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 animate-pulse rounded-2xl bg-surface border border-border" />
        <div className="h-28 animate-pulse rounded-2xl bg-surface border border-border" />
      </div>
      <div className="h-20 w-full animate-pulse rounded-2xl bg-surface border border-border" />
      <div className="h-20 w-full animate-pulse rounded-2xl bg-surface border border-border" />
    </div>
  );
}
