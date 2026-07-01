export default function ProfilLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
        <div className="flex flex-col items-center pt-4 pb-6">
          <div className="w-20 h-20 rounded-full bg-muted animate-pulse mb-4" />
          <div className="w-36 h-6 rounded-md bg-muted animate-pulse mb-2" />
        </div>
        <div className="w-full h-32 rounded-xl bg-muted animate-pulse" />
        <div className="w-full h-32 rounded-xl bg-muted animate-pulse" />
        <div className="w-full h-32 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}
