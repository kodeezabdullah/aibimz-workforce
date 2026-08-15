# Workforce AI

Workforce is an AI-powered analytics dashboard built for construction companies. It acts as an intelligent analytics layer on top of an existing workforce management system — surfacing insights from attendance records, work packages, and labour costs — and provides an AI Insight Q&A module that lets managers query their data in plain language.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Charts / KPI | Tremor |
| Icons | Lucide React |
| Backend | Supabase (Postgres, Auth, RLS, Storage, Edge Functions) |
| AI | Anthropic Claude API |
| Forms | React Hook Form + Zod |
| Exports | SheetJS (xlsx), jsPDF + jspdf-autotable |
| Hosting | Vercel |

## Folder Structure

```
src/
  app/
    (auth)/login/               # Login page
    (dashboard)/
      dashboard/                # Executive Dashboard + Workforce KPIs
      attendance/               # Attendance records + period status
      work-packages/            # Work package listing + detail
      productivity/             # Worker utilisation scoring
      labour-cost/              # Labour cost intelligence
      reports/                  # Weekly reports + export
      employees/                # Employee list, registration, resignation, transfer
      ai-insights/              # AI Insight Q&A module
    api/
      ai-insights/              # Server route calling the LLM with aggregated data
      ingest/                   # CSV/Excel upload handling
  components/
    ui/                         # shadcn/ui components
    dashboard/                  # KPI cards, charts, shared dashboard widgets
    layout/                     # Sidebar nav, topbar, project switcher
  lib/
    supabase/
      client.ts                 # Browser client (createBrowserClient)
      server.ts                 # Server client for Server Components / route handlers
    ai/
      insights.ts               # Prompt-building + Anthropic API call logic
    utils.ts                    # cn() utility
  types/
    database.ts                 # Supabase schema types (replace with generated output)
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in your Supabase project URL, anon key, service role key, and Anthropic API key.

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Generate Supabase types** (after the schema is created)
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
   ```
