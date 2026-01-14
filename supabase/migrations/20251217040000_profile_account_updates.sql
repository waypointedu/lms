alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists mailing_address_line1 text,
  add column if not exists mailing_address_line2 text,
  add column if not exists mailing_city text,
  add column if not exists mailing_state text,
  add column if not exists mailing_postal_code text,
  add column if not exists mailing_country text;

create or replace function public.is_admin_or_instructor(uid uuid)
returns boolean
security definer
set search_path = public
language sql as $$
  select exists(
    select 1 from public.profiles p where p.id = uid and p.role in ('admin','instructor','faculty')
  )
  or exists(
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = uid
      and r.slug in ('admin','instructor','faculty')
  );
$$;
