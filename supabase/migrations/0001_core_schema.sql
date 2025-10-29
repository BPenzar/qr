-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Custom enums
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'form_channel'
      and n.nspname = 'public'
  ) then
    create type public.form_channel as enum ('qr', 'widget', 'link');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'question_type'
      and n.nspname = 'public'
  ) then
    create type public.question_type as enum (
      'nps',
      'rating',
      'single_select',
      'multi_select',
      'short_text',
      'long_text'
    );
  end if;
end
$$;

-- Plans & subscriptions ------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  monthly_price_cents integer not null default 0,
  yearly_price_cents integer,
  limits jsonb not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id),
  plan_id uuid references public.plans (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'analyst')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (account_id, user_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  billing_cycle_anchor timestamptz not null,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  external_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  metric text not null,
  period_start date not null,
  period_end date not null,
  value integer not null default 0,
  unique (account_id, metric, period_start)
);

create table if not exists public.audit_log (
  id bigserial primary key,
  account_id uuid not null references public.accounts (id) on delete cascade,
  actor_id uuid references auth.users (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Projects & forms -----------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null,
  description text,
  is_archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  description text,
  channel public.form_channel not null default 'qr',
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'archived')),
  thank_you_message text,
  redirect_url text,
  settings jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  position integer not null,
  type public.question_type not null,
  label text not null,
  description text,
  placeholder text,
  options jsonb,
  is_required boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.form_qr_codes (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  label text not null,
  short_code text not null unique,
  destination_url text not null,
  scan_count integer not null default 0,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.form_links (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  short_code text not null unique,
  channel public.form_channel not null default 'link',
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Responses ------------------------------------------------------------------
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  form_id uuid not null references public.forms (id) on delete cascade,
  qr_code_id uuid references public.form_qr_codes (id),
  link_id uuid references public.form_links (id),
  submitted_at timestamptz not null default now(),
  channel public.form_channel not null,
  location_name text,
  attributes jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  sentiment text,
  tags text[],
  rating numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.response_items (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses (id) on delete cascade,
  question_id uuid references public.form_questions (id),
  value jsonb not null,
  created_at timestamptz not null default now()
);

-- Notifications --------------------------------------------------------------
create table if not exists public.notification_channels (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  type text not null check (type in ('email', 'slack', 'webhook')),
  config jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  form_id uuid references public.forms (id) on delete cascade,
  channel_id uuid not null references public.notification_channels (id) on delete cascade,
  trigger text not null check (trigger in ('new_response', 'threshold', 'digest')),
  threshold integer,
  schedule text,
  created_at timestamptz not null default now()
);

-- Helper functions -----------------------------------------------------------
create or replace function public.set_updated_at_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_account_id uuid;
  free_plan_id uuid;
begin
  select id into free_plan_id
  from public.plans
  where slug = 'free'
  order by created_at asc
  limit 1;

  if free_plan_id is null then
    insert into public.plans (slug, name, description, limits, is_default)
    values (
      'free',
      'Free',
      'Default free tier',
      jsonb_build_object(
        'projects', 1,
        'forms_per_project', 3,
        'responses_per_month', 50,
        'members', 3
      ),
      true
    )
    returning id into free_plan_id;
  end if;

  insert into public.accounts (name, owner_id, plan_id)
  values (
    coalesce(new.raw_user_meta_data->>'company', 'My Workspace'),
    new.id,
    free_plan_id
  )
  returning id into new_account_id;

  insert into public.account_members (account_id, user_id, role, accepted_at)
  values (new_account_id, new.id, 'owner', now());

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Triggers -------------------------------------------------------------------
create trigger set_accounts_updated_at
before update on public.accounts
for each row
execute procedure public.set_updated_at_timestamp();

create trigger set_projects_updated_at
before update on public.projects
for each row
execute procedure public.set_updated_at_timestamp();

create trigger set_forms_updated_at
before update on public.forms
for each row
execute procedure public.set_updated_at_timestamp();

create trigger handle_new_user_trigger
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Row-Level Security ---------------------------------------------------------
alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.projects enable row level security;
alter table public.forms enable row level security;
alter table public.form_questions enable row level security;
alter table public.form_qr_codes enable row level security;
alter table public.form_links enable row level security;
alter table public.responses enable row level security;
alter table public.response_items enable row level security;
alter table public.usage_counters enable row level security;
alter table public.audit_log enable row level security;
alter table public.notification_channels enable row level security;
alter table public.notification_rules enable row level security;

-- Helper policy predicate
create or replace function public.current_account_ids()
returns setof uuid
language sql security definer set search_path = public stable as $$
  select account_id
  from public.account_members
  where user_id = auth.uid()
$$;

-- Accounts policies
create policy "Users can view their accounts"
on public.accounts
for select
using (id in (select * from public.current_account_ids()));

create policy "Users can update their accounts"
on public.accounts
for update
using (id in (select * from public.current_account_ids()));

-- Account members policies
create policy "Users can view account members"
on public.account_members
for select
using (account_id in (select * from public.current_account_ids()));

-- Projects policies
create policy "Users manage projects within account"
on public.projects
for all
using (account_id in (select * from public.current_account_ids()))
with check (account_id in (select * from public.current_account_ids()));

create policy "Service role manages projects"
on public.projects
for all
to service_role
using (true)
with check (true);

-- Forms policies
grant all on table public.forms to service_role;
grant all on table public.form_questions to service_role;
grant all on table public.form_qr_codes to service_role;

create policy "Users manage forms within account"
on public.forms
for all
using (account_id in (select * from public.current_account_ids()))
with check (account_id in (select * from public.current_account_ids()));

create policy "Service role manages forms"
on public.forms
for all
to service_role
using (true)
with check (true);

create policy "Public can read published forms"
on public.forms
for select
to anon
using (status = 'published');

-- Form questions
create policy "Users manage form_questions within account"
on public.form_questions
for all
using (
  form_id in (
    select id from public.forms where account_id in (select * from public.current_account_ids())
  )
)
with check (
  form_id in (
    select id from public.forms where account_id in (select * from public.current_account_ids())
  )
);

create policy "Service role manages form questions"
on public.form_questions
for all
to service_role
using (true)
with check (true);

create policy "Public can read published form questions"
on public.form_questions
for select
to anon
using (
  form_id in (
    select id
    from public.forms
    where status = 'published'
  )
);

-- QR codes policies
create policy "Users manage qr codes within account"
on public.form_qr_codes
for all
using (
  form_id in (
    select id from public.forms where account_id in (select * from public.current_account_ids())
  )
)
with check (
  form_id in (
    select id from public.forms where account_id in (select * from public.current_account_ids())
  )
);

create policy "Service role manages form qr codes"
on public.form_qr_codes
for all
to service_role
using (true)
with check (true);

create policy "Public can resolve published qr codes"
on public.form_qr_codes
for select
to anon
using (
  form_id in (
    select id
    from public.forms
    where status = 'published'
  )
);

-- Form links policies
create policy "Users manage form links within account"
on public.form_links
for all
using (
  form_id in (
    select id from public.forms where account_id in (select * from public.current_account_ids())
  )
)
with check (
  form_id in (
    select id from public.forms where account_id in (select * from public.current_account_ids())
  )
);

create policy "Public can resolve published form links"
on public.form_links
for select
to anon
using (
  form_id in (
    select id
    from public.forms
    where status = 'published'
  )
);

-- Responses policies (read only from dashboard)
create policy "Users can read responses within account"
on public.responses
for select
using (
  account_id in (select * from public.current_account_ids())
);

create policy "Anyone can insert responses via form edge function"
on public.responses
for insert
with check (true);

-- Response items
create policy "Users can read response items within account"
on public.response_items
for select
using (
  response_id in (
    select id from public.responses where account_id in (select * from public.current_account_ids())
  )
);

create policy "Edge function can insert response items"
on public.response_items
for insert
with check (true);

-- Usage counters
create policy "Users can read their usage counters"
on public.usage_counters
for select
using (account_id in (select * from public.current_account_ids()));

create policy "Service role updates usage counters"
on public.usage_counters
for all
to service_role
using (true)
with check (true);

-- Audit log
create policy "Users can read their audit logs"
on public.audit_log
for select
using (account_id in (select * from public.current_account_ids()));

create policy "Service role inserts audit logs"
on public.audit_log
for insert
to service_role
with check (true);

-- Notification channels & rules
create policy "Users manage notifications"
on public.notification_channels
for all
using (account_id in (select * from public.current_account_ids()))
with check (account_id in (select * from public.current_account_ids()));

create policy "Users manage notification rules"
on public.notification_rules
for all
using (account_id in (select * from public.current_account_ids()))
with check (account_id in (select * from public.current_account_ids()));

-- Seed data ------------------------------------------------------------------
insert into public.plans (slug, name, description, monthly_price_cents, limits, is_default)
values (
  'free',
  'Free',
  'Free tier with generous limits for testing the platform.',
  0,
  jsonb_build_object(
    'projects', 1,
    'forms_per_project', 3,
    'responses_per_month', 50,
    'members', 3,
    'qr_codes_per_form', 3
  ),
  true
)
on conflict (slug) do nothing;
