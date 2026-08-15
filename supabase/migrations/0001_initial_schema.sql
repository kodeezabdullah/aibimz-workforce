-- =============================================================================
-- 0001_initial_schema.sql
-- Phase 1 MVP — Workforce AI (QTime analytics layer)
--
-- DO NOT RUN manually. Apply via: supabase db push (after supabase link)
-- Tables are written-to-disk only until Supabase credentials are configured.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- projects
-- One row per construction site / project code (e.g. "BKT2SA").
-- Everything in the system is scoped to a project_id.
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,        -- e.g. "BKT2SA"
  name        text not null,
  created_at  timestamptz not null default now()
);

comment on table public.projects is
  'Top-level container. Every other table has a project_id FK. '
  'The client runs multiple concurrent sites — always filter by project.';

-- ---------------------------------------------------------------------------
-- workers
-- All personnel tracked by QTime: direct employees, subcontractors, operators.
-- ---------------------------------------------------------------------------
create table public.workers (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  worker_type    text not null check (worker_type in (
                   'general_worker', 'staff', 'subcon',
                   'operator', 'subcon_as_gw'
                 )),
  -- subcon_as_gw: subcontractor headcount that counts as a general worker.
  name           text not null,
  company        text,                     -- relevant for subcon/subcon_as_gw
  trade_category text,
  created_at     timestamptz not null default now()
);

comment on table public.workers is
  'Personnel from QTime. Worker types mirror QTime exactly: '
  'general_worker, staff, subcon, operator, subcon_as_gw. '
  'subcon_as_gw counts toward general-worker headcount.';

create index idx_workers_project_id   on public.workers(project_id);
create index idx_workers_worker_type  on public.workers(worker_type);

-- ---------------------------------------------------------------------------
-- attendance
-- Raw attendance records imported from QTime (RFID / Face Scan / manual).
-- CRITICAL: period_status must be checked before surfacing any AI insight
-- about attendance variance — "Processing" means provisional data.
-- ---------------------------------------------------------------------------
create table public.attendance (
  id              uuid primary key default uuid_generate_v4(),
  worker_id       uuid not null references public.workers(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  date            date not null,
  check_in        time,
  check_out       time,
  working_hours   numeric(5, 2),
  overtime_hours  numeric(5, 2) default 0,
  status          text not null check (status in (
                    'present', 'absent', 'late', 'early_leave'
                  )),
  source          text not null check (source in (
                    'rfid', 'face_scan', 'manual'
                  )),
  -- Attendance is processed in periods, not purely daily.
  -- Operator / General Worker: 1st_half (days 1-15) or 2nd_half (days 16-end).
  -- Subcon Worker: monthly.
  period_type     text not null check (period_type in (
                    '1st_half', '2nd_half', 'monthly'
                  )),
  -- "processing" = provisional; do NOT treat variance as a real signal yet.
  -- "finalized"  = locked; safe to surface in AI insights.
  period_status   text not null default 'processing' check (period_status in (
                    'processing', 'finalized'
                  )),
  created_at      timestamptz not null default now()
);

comment on table public.attendance is
  'QTime attendance records. ALWAYS filter on period_status before '
  'drawing conclusions — processing periods contain incomplete data. '
  'Source may be rfid, face_scan, or manual (manual = device was offline).';

create index idx_attendance_project_id    on public.attendance(project_id);
create index idx_attendance_worker_id     on public.attendance(worker_id);
create index idx_attendance_date          on public.attendance(date);
create index idx_attendance_period_status on public.attendance(period_status);
create index idx_attendance_status        on public.attendance(status);

-- ---------------------------------------------------------------------------
-- work_packages
-- Budget + physical-progress tracking units from QTime.
-- Two ID schemes coexist — package_code handles both.
-- ---------------------------------------------------------------------------
create table public.work_packages (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  -- Supports both user-created ("WP-BKT2SA-001") and
  -- system-generated ("KSK/BKT2SA/001") codes. Do NOT assume parity.
  package_code      text not null,
  category          text,                  -- "Labour" or "Preliminary"
  subcategory       text,                  -- e.g. "Protection", "Safety Health & Environment"
  sub_subcategory   text,
  work_nature       text,                  -- e.g. "Site Preliminary Work", "Work On Behalf"
  remark            text,
  budget_amount     numeric(15, 2),
  physical_progress numeric(5, 2) check (
                      physical_progress >= 0 and physical_progress <= 100
                    ),
  status            text not null default 'on_going' check (status in (
                      'on_going', 'in_review', 'completed', 'rejected_archived'
                    )),
  created_by        uuid,                  -- profiles.id (nullable until auth is live)
  assigned_to       uuid,                  -- profiles.id (nullable until auth is live)
  created_at        timestamptz not null default now()
);

comment on table public.work_packages is
  'Budget and progress tracking units. package_code may follow either '
  'WP-<PROJECT>-NNN (user-created) or KSK/<PROJECT>/NNN (system-generated). '
  'Labour cost analysis reconciles against budget_amount, not just '
  'hourly_rate × hours — this is how the client thinks about cost.';

create index idx_work_packages_project_id on public.work_packages(project_id);
create index idx_work_packages_status     on public.work_packages(status);
create unique index idx_work_packages_code_per_project
  on public.work_packages(project_id, package_code);

-- ---------------------------------------------------------------------------
-- labour_rates
-- Effective rates per worker_type per project, used for cost calculations.
-- Multiple rows per project_id + worker_type to support rate changes.
-- ---------------------------------------------------------------------------
create table public.labour_rates (
  id             uuid primary key default uuid_generate_v4(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  worker_type    text not null check (worker_type in (
                   'general_worker', 'staff', 'subcon',
                   'operator', 'subcon_as_gw'
                 )),
  hourly_rate    numeric(10, 2) not null,
  ot_rate        numeric(10, 2),           -- overtime rate (may differ from hourly × 1.5)
  effective_date date not null,
  created_at     timestamptz not null default now()
);

comment on table public.labour_rates is
  'Rates used for labour cost intelligence. effective_date supports '
  'historical rate changes. Join on worker_type and the rate '
  'effective on or before the attendance date.';

create index idx_labour_rates_project_id on public.labour_rates(project_id);

-- ---------------------------------------------------------------------------
-- ai_insight_queries
-- Audit log of every Q&A the AI Insight module produces.
-- ---------------------------------------------------------------------------
create table public.ai_insight_queries (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid,                         -- auth.users.id (nullable until auth is live)
  question   text not null,
  answer     text not null,
  created_at timestamptz not null default now()
);

comment on table public.ai_insight_queries is
  'Stores every Q&A from the AI Insight module for audit and future '
  'fine-tuning. user_id is nullable until Supabase Auth is wired up.';

create index idx_ai_queries_project_id on public.ai_insight_queries(project_id);
create index idx_ai_queries_created_at on public.ai_insight_queries(created_at desc);

-- ---------------------------------------------------------------------------
-- profiles
-- Extends auth.users with app-level roles. Stub for now — RLS not enforced.
-- Roles: admin (full access), project_manager (project-scoped), client (read-only).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key,            -- matches auth.users.id when auth is live
  role       text not null default 'project_manager' check (role in (
               'admin', 'project_manager', 'client'
             )),
  project_id uuid references public.projects(id),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'App-level user roles. Phase 1 stub — id will reference auth.users.id '
  'once Supabase Auth is configured. RLS policies will be added at that '
  'point to enforce role-scoped access; for now it is a reference table only.';

create index idx_profiles_project_id on public.profiles(project_id);
