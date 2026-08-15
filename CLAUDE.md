@AGENTS.md

# Workforce AI — Project Context

## What this is
Phase 1 MVP of an AI-powered workforce analytics dashboard for construction
companies. It is an **AI analytics layer that sits on top of QTime**
(an existing third-party workforce management system) — not a replacement
for QTime, not a clone of it. We consume QTime's workforce data (via
CSV/Excel import for now, API later) and add AI-generated insights,
productivity scoring, and labour cost intelligence on top.

Client has an active QTime account; we have read access to study real
workflows, but this project is a separate, independently-branded product.

## Tech stack (Phase 1 — deliberately backend-light)
- **Next.js 15** (App Router, TypeScript, `src/` dir, `@/*` alias)
- **Tailwind CSS + shadcn/ui** — component layer
- **Tremor** — dashboard charts (KPI cards, bar/line combo, donut)
- **Supabase** — this IS the backend: Postgres + Auth + Row Level Security +
  Storage + Edge Functions. No standalone Node/Express/FastAPI server.
- **LLM API (Anthropic)** — called server-side only (route handler / Edge
  Function), for the AI Insight module. Never expose the API key client-side.
- **Vercel** — hosting

## Design rules — non-negotiable
- **Light theme only.** No dark mode, no dark backgrounds.
- **No blue anywhere** in the palette — pick accent colors deliberately,
  avoid it as a default.
- **No Inter font.** Choose a different, deliberate type pairing.

## Folder structure

```
src/
  app/
    (auth)/login/
    (dashboard)/
      dashboard/          # Executive Dashboard + Workforce KPIs
      attendance/
      work-packages/
      productivity/       # Worker utilisation scoring
      labour-cost/
      reports/
      employees/
      ai-insights/
    api/
      ai-insights/        # server route → LLM call with aggregated context
      ingest/             # CSV/Excel upload handling
  components/
    ui/                   # shadcn/ui
    dashboard/            # KPI cards, charts
    layout/               # sidebar nav, topbar, project switcher
  lib/
    supabase/{client,server}.ts
    ai/insights.ts
    utils.ts
  types/database.ts
```

## Domain knowledge (learned from the real QTime system — build against this)

### Worker types
`General Worker`, `Staff`, `Subcon`, `Operator`, `Subcon As GW`
(subcontractor counted as general worker for headcount purposes).

### Attendance
- Sources: RFID + Face Scan devices; device-online status is tracked
  (field hardware reliability is a real operational concern).
- Processed in **periods, not just daily:** 1st-half / 2nd-half (biweekly)
  for Operator / General Worker; monthly for Subcon Worker.
- Each period has a status — e.g. **Processing** — before it is finalized.
- **Any AI insight referencing attendance must account for whether the
  relevant period is still Processing (provisional data) vs finalized.**
  Unexplained variance is often just processing lag — never surface it
  as a finding without checking period status first.

### Work Packages
- Budget + physical-progress tracking units, not just labour buckets.
- Hierarchical category: `Labour / Preliminary` → sub-category
  (e.g. `Protection`, `Safety Health & Environment`) → work nature
  (e.g. `Site Preliminary Work`, `Work On Behalf`).
- Fields: budget amount, physical progress %.
- Statuses: `On Going` / `In Review` / `Completed` / `Rejected` / `Archived`.
- Two ID schemes coexist: `WP-<PROJECT>-NNN` (user-created) and
  `KSK/<PROJECT>/NNN` (system-generated, legacy-looking). Data completeness
  may differ — do not assume parity between the two schemes.

### Multi-project structure
Everything is scoped under a project code (e.g. `BKT2SA`). The client
manages multiple concurrent construction sites simultaneously.

## Modules (Phase 1 scope)
1. **Data Integration** — CSV/Excel/manual upload now, API integration later
2. **AI Workforce Dashboard** — Executive view + Workforce KPIs
3. **Productivity Analytics** — worker utilisation score:
   - 90–100 %  → High
   - 70–90 %   → Normal
   - < 70 %    → Attention required
4. **Labour Cost Intelligence** — reconcile against Work Package budgets,
   not just `hourly rate × hours`; match how the client already thinks
   about cost.
5. **AI Insight Module** — natural-language Q&A over workforce data
   (e.g. "why is productivity dropping?" → drivers + recommendation)
6. **Management Reporting** — weekly report, export to PDF / Excel
7. **User Management** — Admin / Project Manager / Client roles, enforced
   via Supabase Row Level Security (not just hidden UI elements)

## Conventions
- Commit style: small, scoped commits — `feat:`, `chore:`, `fix:`.
- No remote git origin yet — local commits only until the client repo exists.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` — never commit real
  values; only `.env.local.example` with blanks is committed.

## When updating this file
Keep it current as the schema, folder structure, or design decisions
change. This file is the source of truth read at the start of every
session — update it rather than letting Claude re-derive context from
scratch.
