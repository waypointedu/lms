-- Certificates, audit events, and optional lesson index for search
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  issued_at timestamp with time zone default now(),
  verification_code text unique not null
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor uuid references public.profiles(id),
  action text not null,
  target text,
  created_at timestamp with time zone default now()
);

create table if not exists public.lesson_index (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  content text,
  language text default 'en'
);

alter table public.certificates enable row level security;
alter table public.audit_events enable row level security;
alter table public.lesson_index enable row level security;

-- certificates policies
create policy if not exists certificates_select on public.certificates
  for select using (
    is_admin_or_instructor(auth.uid())
    or user_id = auth.uid()
  );
create policy if not exists certificates_admin_write on public.certificates
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));

-- audit events (admin/instructor only)
create policy if not exists audit_events_select on public.audit_events
  for select using (is_admin_or_instructor(auth.uid()));
create policy if not exists audit_events_insert on public.audit_events
  for insert with check (is_admin_or_instructor(auth.uid()));

-- lesson index (read published/enrolled lessons)
create policy if not exists lesson_index_select on public.lesson_index
  for select using (
    is_admin_or_instructor(auth.uid())
    or exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.enrollments e on e.course_id = m.course_id and e.user_id = auth.uid()
      where l.id = lesson_index.lesson_id
    )
  );
create policy if not exists lesson_index_admin_write on public.lesson_index
  for all using (is_admin_or_instructor(auth.uid())) with check (is_admin_or_instructor(auth.uid()));
