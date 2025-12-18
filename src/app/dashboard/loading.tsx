export default function DashboardLoading() {
  return (
    <main className="container space-y-8 py-12">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-8 w-64 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-4 w-80 rounded-full bg-[rgba(20,34,64,0.08)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="card p-5 space-y-3 animate-pulse">
            <div className="h-4 w-24 rounded-full bg-[rgba(20,34,64,0.1)]" />
            <div className="h-6 w-32 rounded-full bg-[rgba(20,34,64,0.1)]" />
            <div className="h-4 w-full rounded-full bg-[rgba(20,34,64,0.06)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
