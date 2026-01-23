create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  description text,
  program_id uuid,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Authenticated users can view published courses"
  on public.courses
  for select
  using (auth.role() = 'authenticated' and published = true);

alter table public.course_enrollments
  add constraint course_enrollments_course_id_fkey
  foreign key (course_id) references public.courses (id);

alter table public.course_enrollments
  add constraint course_enrollments_unique_user_course
  unique (course_id, user_id);

alter table public.course_instructors
  add constraint course_instructors_course_id_fkey
  foreign key (course_id) references public.courses (id);

create policy "Students can enroll themselves"
  on public.course_enrollments
  for insert
  with check (auth.uid() = user_id);

create policy "Students can update their enrollments"
  on public.course_enrollments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.courses (code, title, description, published)
values
  ('PHIL-1401', 'Philosophy', 'Introductory philosophy course.', true),
  ('HIST-100', 'History', 'Survey of world history.', true),
  ('ART-210', 'Art Appreciation', 'Foundations of visual art.', true);
