create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  user_id uuid not null,
  points_possible numeric,
  points_earned numeric,
  letter text,
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, user_id)
);

alter table public.grades enable row level security;

create policy "Students can view their grades"
  on public.grades
  for select
  using (auth.uid() = user_id);

create policy "Instructors can view grades for their courses"
  on public.grades
  for select
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = grades.course_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Instructors can insert grades for their courses"
  on public.grades
  for insert
  with check (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = grades.course_id
        and course_instructors.user_id = auth.uid()
    )
  );

create policy "Instructors can update grades for their courses"
  on public.grades
  for update
  using (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = grades.course_id
        and course_instructors.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.course_instructors
      where course_instructors.course_id = grades.course_id
        and course_instructors.user_id = auth.uid()
    )
  );
