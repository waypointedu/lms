export default function CourseDetailLoading() {
  return (
    <main className="container py-12 space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-8 w-72 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-4 w-80 rounded-full bg-[rgba(20,34,64,0.08)]" />
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="card p-5 space-y-3 animate-pulse">
            <div className="h-6 w-48 rounded-full bg-[rgba(20,34,64,0.1)]" />
            <div className="h-4 w-full rounded-full bg-[rgba(20,34,64,0.06)]" />
            <div className="h-4 w-3/4 rounded-full bg-[rgba(20,34,64,0.06)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
