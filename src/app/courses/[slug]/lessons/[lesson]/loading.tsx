export default function LessonLoading() {
  return (
    <main className="container py-12 space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-20 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-8 w-64 rounded-full bg-[rgba(20,34,64,0.08)]" />
        <div className="h-4 w-48 rounded-full bg-[rgba(20,34,64,0.08)]" />
      </div>
      <div className="card p-6 space-y-3 animate-pulse">
        <div className="h-4 w-full rounded-full bg-[rgba(20,34,64,0.06)]" />
        <div className="h-4 w-5/6 rounded-full bg-[rgba(20,34,64,0.06)]" />
        <div className="h-4 w-2/3 rounded-full bg-[rgba(20,34,64,0.06)]" />
      </div>
    </main>
  );
}
