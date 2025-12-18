export default function CoursesLoading() {
  return (
    <main className="container py-14 space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-8 w-64 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-4 w-80 rounded-full bg-[rgba(20,34,64,0.08)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="card p-6 space-y-3 animate-pulse">
            <div className="h-4 w-20 rounded-full bg-[rgba(20,34,64,0.1)]" />
            <div className="h-6 w-48 rounded-full bg-[rgba(20,34,64,0.1)]" />
            <div className="h-4 w-full rounded-full bg-[rgba(20,34,64,0.06)]" />
            <div className="h-4 w-2/3 rounded-full bg-[rgba(20,34,64,0.06)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
