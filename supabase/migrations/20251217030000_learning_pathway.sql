-- Learning Pathway schema updates: roles, checkpoints, and capstones
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('admin','faculty','instructor','student','applicant'));

alter table public.profiles
  alter column role set default 'student';

create or replace function public.is_admin_or_instructor(uid uuid)
returns boolean
security definer
set search_path = public
language sql as $$
  select exists(
    select 1 from public.profiles p where p.id = uid and p.role in ('admin','instructor','faculty')
  );
$$;

-- Translation and pathway fields
alter table public.courses add column if not exists duration_weeks int;
alter table public.courses add column if not exists title_es text;
alter table public.courses add column if not exists description_es text;
alter table public.courses add column if not exists pathway text;

alter table public.modules add column if not exists summary text;
alter table public.modules add column if not exists summary_es text;

alter table public.lessons add column if not exists summary text;
alter table public.lessons add column if not exists summary_es text;
alter table public.lessons add column if not exists title_es text;
alter table public.lessons add column if not exists required_for_pathway boolean default true;

alter table public.enrollments add column if not exists cohort_label text;
alter table public.enrollments add column if not exists starts_on date;
alter table public.enrollments add column if not exists target_end_on date;

-- Roles and assignments
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.profile_roles (
  profile_id uuid references public.profiles(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz default now(),
  primary key (profile_id, role_id)
);

-- Checkpoints
create table if not exists public.checkpoints (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  title_es text,
  week_number int not null,
  due_on date,
  requirements jsonb default '[]',
  status text check (status in ('planned','published','archived')) default 'planned',
  created_at timestamptz default now()
);

create unique index if not exists checkpoints_course_week_idx on public.checkpoints(course_id, week_number);

create table if not exists public.checkpoint_progress (
  id uuid primary key default gen_random_uuid(),
  checkpoint_id uuid references public.checkpoints(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('not_started','in_progress','completed','behind')) default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz default now(),
  notes text,
  unique (checkpoint_id, user_id)
);

-- Capstones
create table if not exists public.capstones (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('not_started','scheduled','passed','needs_remediation')) default 'not_started',
  outcome_notes text,
  reviewed_by uuid references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create unique index if not exists capstones_enrollment_unique on public.capstones(enrollment_id);

create table if not exists public.capstone_schedules (
  id uuid primary key default gen_random_uuid(),
  capstone_id uuid references public.capstones(id) on delete cascade,
  scheduled_at timestamptz not null,
  faculty_id uuid references public.profiles(id),
  requested_by uuid references public.profiles(id),
  status text check (status in ('proposed','accepted','rescheduled','completed','cancelled')) default 'proposed',
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.roles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.checkpoints enable row level security;
alter table public.checkpoint_progress enable row level security;
alter table public.capstones enable row level security;
alter table public.capstone_schedules enable row level security;

-- Roles policies
create policy if not exists roles_select_all on public.roles
  for select using (true);

create policy if not exists roles_admin_write on public.roles
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

create policy if not exists profile_roles_select on public.profile_roles
  for select using (auth.uid() = profile_id or is_admin_or_instructor(auth.uid()));

create policy if not exists profile_roles_insert on public.profile_roles
  for insert with check (is_admin_or_instructor(auth.uid()));

create policy if not exists profile_roles_delete on public.profile_roles
  for delete using (is_admin_or_instructor(auth.uid()));

-- Checkpoint policies
create policy if not exists checkpoints_select on public.checkpoints
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_id = checkpoints.course_id
    )
  );

create policy if not exists checkpoints_admin_write on public.checkpoints
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

create policy if not exists checkpoint_progress_select on public.checkpoint_progress
  for select using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));

create policy if not exists checkpoint_progress_upsert on public.checkpoint_progress
  for all using (auth.uid() = user_id or is_admin_or_instructor(auth.uid()))
  with check (auth.uid() = user_id or is_admin_or_instructor(auth.uid()));

-- Capstone policies
create policy if not exists capstones_select on public.capstones
  for select using (
    is_admin_or_instructor(auth.uid())
    or auth.uid() = student_id
    or exists (
      select 1 from public.capstone_schedules cs
      where cs.capstone_id = capstones.id and cs.faculty_id = auth.uid()
    )
  );

create policy if not exists capstones_insert on public.capstones
  for insert with check (auth.uid() = student_id or is_admin_or_instructor(auth.uid()));

create policy if not exists capstones_update on public.capstones
  for update using (auth.uid() = student_id or is_admin_or_instructor(auth.uid()));

create policy if not exists capstone_schedules_select on public.capstone_schedules
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.capstones c
      where c.id = capstone_schedules.capstone_id and c.student_id = auth.uid()
    )
    or capstone_schedules.faculty_id = auth.uid()
  );

create policy if not exists capstone_schedules_insert on public.capstone_schedules
  for insert with check (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.capstones c
      where c.id = capstone_schedules.capstone_id and c.student_id = auth.uid()
    )
  );

create policy if not exists capstone_schedules_update on public.capstone_schedules
  for update using (
    is_admin_or_instructor(auth.uid())
    or capstone_schedules.faculty_id = auth.uid()
    or exists (
      select 1 from public.capstones c
      where c.id = capstone_schedules.capstone_id and c.student_id = auth.uid()
    )
  );

-- Seed core roles
insert into public.roles (slug, name, description, is_default)
values
  ('student', 'Student', 'Default learner role for the pathway', true),
  ('faculty', 'Faculty', 'Faculty and reviewers for checkpoints and capstones', false),
  ('admin', 'Admin', 'Administrators with full access', false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_default = excluded.is_default;
