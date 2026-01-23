create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.program_memberships (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  user_id uuid not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (program_id, user_id)
);

alter table public.programs enable row level security;
alter table public.program_memberships enable row level security;

create policy "Admins can manage programs"
  on public.programs
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Admins can manage program memberships"
  on public.program_memberships
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Admins can manage courses"
  on public.courses
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Admins can manage course instructors"
  on public.course_instructors
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );

create policy "Admins can manage course enrollments"
  on public.course_enrollments
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role_global = 'admin'
    )
  );
