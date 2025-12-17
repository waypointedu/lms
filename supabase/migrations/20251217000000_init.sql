-- Waypoint LMS schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text check (role in ('admin','instructor','student','applicant')) default 'student',
  created_at timestamp with time zone default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  language text default 'en',
  published boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  position int,
  created_at timestamp with time zone default now()
);

create unique index if not exists modules_course_position_key on public.modules(course_id, position);
create unique index if not exists modules_course_title_key on public.modules(course_id, title);

create index if not exists modules_course_position_idx on public.modules(course_id, position);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  position int,
  content_path text,
  estimated_minutes int,
  published boolean default false,
  unique (module_id, slug)
);

create index if not exists lessons_module_position_idx on public.lessons(module_id, position);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  status text check (status in ('active','completed','paused')) default 'active',
  enrolled_at timestamp with time zone default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed_at timestamp with time zone,
  last_viewed_at timestamp with time zone default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  week_start_date date not null,
  payload jsonb,
  submitted_at timestamp with time zone default now(),
  unique (user_id, course_id, week_start_date)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  schema jsonb
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  score int,
  responses jsonb,
  submitted_at timestamp with time zone default now()
);

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  starts_at timestamp with time zone,
  join_url text,
  description text
);

create unique index if not exists live_sessions_course_title_key on public.live_sessions(course_id, title);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.live_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('present','absent','excused')) default 'absent',
  marked_by uuid references public.profiles(id),
  marked_at timestamp with time zone default now(),
  unique (session_id, user_id)
);

create or replace function public.is_admin_or_instructor(uid uuid)
returns boolean
security definer
set search_path = public
language sql as $$
  select exists(
    select 1 from public.profiles p where p.id = uid and p.role in ('admin','instructor')
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.checkins enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.live_sessions enable row level security;
alter table public.attendance enable row level security;

-- profiles
create policy if not exists profiles_self_select on public.profiles
  for select using (auth.uid() = id or is_admin_or_instructor(auth.uid()));
create policy if not exists profiles_self_insert on public.profiles
  for insert with check (auth.uid() = id);
create policy if not exists profiles_self_update on public.profiles
  for update using (auth.uid() = id or is_admin_or_instructor(auth.uid()));

-- courses
create policy if not exists courses_select on public.courses
  for select using (published is true or is_admin_or_instructor(auth.uid()));
create policy if not exists courses_admin_write on public.courses
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

-- modules
create policy if not exists modules_select on public.modules
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_id = modules.course_id
    )
  );
create policy if not exists modules_admin_write on public.modules
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

-- lessons
create policy if not exists lessons_select on public.lessons
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.enrollments e
      join public.modules m on m.id = lessons.module_id
      where e.user_id = auth.uid() and e.course_id = m.course_id
    )
  );
create policy if not exists lessons_admin_write on public.lessons
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

-- enrollments
create policy if not exists enrollments_select on public.enrollments
  for select using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));
create policy if not exists enrollments_insert on public.enrollments
  for insert with check (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));
create policy if not exists enrollments_update on public.enrollments
  for update using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));
create policy if not exists enrollments_delete on public.enrollments
  for delete using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));

-- lesson progress
create policy if not exists lesson_progress_select on public.lesson_progress
  for select using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));
create policy if not exists lesson_progress_upsert on public.lesson_progress
  for all using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()))
  with check (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));

-- checkins
create policy if not exists checkins_select on public.checkins
  for select using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));
create policy if not exists checkins_upsert on public.checkins
  for all using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()))
  with check (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));

-- quizzes
create policy if not exists quizzes_select on public.quizzes
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.enrollments e
      join public.lessons l on l.id = quizzes.lesson_id
      join public.modules m on m.id = l.module_id
      where e.user_id = auth.uid() and e.course_id = m.course_id
    )
  );
create policy if not exists quizzes_admin_write on public.quizzes
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

-- quiz attempts
create policy if not exists quiz_attempts_select on public.quiz_attempts
  for select using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));
create policy if not exists quiz_attempts_upsert on public.quiz_attempts
  for all using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()))
  with check (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));

-- live sessions
create policy if not exists live_sessions_select on public.live_sessions
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_id = live_sessions.course_id
    )
  );
create policy if not exists live_sessions_admin_write on public.live_sessions
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

-- attendance
create policy if not exists attendance_select on public.attendance
  for select using (is_admin_or_instructor(auth.uid()));
create policy if not exists attendance_write on public.attendance
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));
