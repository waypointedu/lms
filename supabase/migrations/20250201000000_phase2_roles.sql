create table if not exists public.course_instructors (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null,
  user_id uuid not null,
  role text not null default 'instructor',
  created_at timestamptz not null default now()
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null,
  user_id uuid not null,
  status text not null default 'enrolled',
  enrolled_at timestamptz not null default now(),
  dropped_at timestamptz
);

alter table public.course_instructors enable row level security;
alter table public.course_enrollments enable row level security;

create policy "Course instructors can view their assignments"
  on public.course_instructors
  for select
  using (auth.uid() = user_id);

create policy "Enrolled students can view their enrollments"
  on public.course_enrollments
  for select
  using (auth.uid() = user_id);
