# BSP Feedback Platform

A full-stack QR & web widget feedback application built with Next.js 16 and Supabase. Teams can create projects, launch multi-question forms, distribute QR codes, capture anonymous responses, and review analytics from a single dashboard. The architecture follows the PRD requirements for a Free MVP with Stripe-ready upgrade paths and automated onboarding.

## Features

- **Onboarding & Auth**: Supabase email/OAuth login, workspace-aware navigation, and plan-aware guards.
- **Project Builder**: Create projects, add guided form templates, and manage QR/web/link channels in one place.
- **Form Engine**: Rating, NPS, select, and free-text question types with drag-on presets, thank-you messaging, and publish states.
- **QR Automation**: Generate short codes, PNG downloads, and track scans per location with plan limits enforced.
- **Public Experience**: Hosted `/f/[code]` forms with rate-protected submissions, sentiment-friendly inputs, and redirect support.
- **Analytics & Export**: Dashboard trend charts, per-form response explorer, CSV export endpoint, and usage counters.
- **Plan Enforcement**: Free-tier ceilings for projects, forms per project, QR slots, and monthly responses with upgrade prompts.
- **Extensibility Hooks**: Notifications digest helper (Resend/Slack ready), Stripe upgrade placeholders, and Supabase RLS policies.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, TanStack Query, Recharts.
- **Backend**: Supabase (Postgres + Auth + Storage), Edge-ready Next.js route handlers & server actions.
- **Utilities**: Zod validation, React Hook Form, `qrcode` PNG generation, PapaParse CSV export.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and populate values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project credentials. |
| `SUPABASE_SERVICE_ROLE_KEY` | Needed for public form submissions and usage counters. Keep secret. |
| `NEXT_PUBLIC_APP_URL` | Base URL for hosted forms/redirects (e.g. `http://localhost:3000`). |
| Optional integrations | `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `PLAUSIBLE_DOMAIN`, etc. |

### 3. Bootstrap Supabase schema

Run the SQL migration against your Supabase project (requires the [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase db execute --file supabase/migrations/0001_core_schema.sql
```

This creates tables, policies, the default Free plan seed, and the auth trigger that provisions accounts.

> **Tip**: For local development you can use `supabase start` and then `supabase db reset` to apply all migrations in order.

### 4. Launch the app

```bash
npm run dev
```

- Dashboard: `http://localhost:3000/app`
- Public forms: `http://localhost:3000/f/{shortCode}`

Sign up via the Supabase-powered `/sign-in` screen. The first user receives a Free plan workspace automatically.

## Key Workflows

1. **Create Project** → name/describe workspace initiatives (free plan allows 1 active project).
2. **Build Form** → use presets for rating, NPS, select, and text questions; publish when ready.
3. **Generate QR / Share** → create up to three QR short links per form with PNG downloads or share direct URLs.
4. **Collect Responses** → hosted forms post to `/api/forms/{id}/responses`, updating Supabase tables and usage counters.
5. **Analyse & Export** → dashboard trend chart + per-form response explorer with CSV download.

## Project Structure

```
src/
  app/                 Next.js route tree (marketing, auth, dashboard, public forms, APIs)
  components/          Reusable UI, dashboards, form builders, providers
  env/                 Zod-validated environment loaders (client & server)
  lib/
    notifications/     Weekly digest helper stub (Resend/Slack ready)
    plan-limits.ts     Plan limit parsing & guard helpers
    repositories/      Supabase data access for accounts, projects, forms, responses
    supabase/          Browser/server/Service-role clients
  ...
supabase/migrations/   Postgres schema, RLS policies, seed data
```

## Commands

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode. |
| `npm run build` | Production build. |
| `npm run start` | Start production server. |
| `npm run lint` | ESLint (Next.js recommended config). |

## Implementation Notes

- **RLS**: Policies restrict workspace data while allowing anonymous read/submit for published forms. Keep service role operations in server routes only.
- **Plan Limits**: Free tier defaults (1 project, 3 forms/project, 3 QR codes/form, 50 responses/month) are enforced in server actions and API routes.
- **Usage Counters**: Response submissions upsert monthly counters for future billing/upgrade logic.
- **Notifications**: `src/lib/notifications/digest.ts` produces a weekly payload and logs recipients—wire to Resend/MailerSend when ready.
- **Stripe Upgrade Stub**: Upgrade CTAs surface in the UI; hook into Stripe Billing and replace placeholders in `settings/page.tsx` when payments are enabled.

## Roadmap / TODOs

- Add Plausible script hook and Supabase Edge function for spam/rate limiting.
- Extend analytics with sentiment tagging and funnel conversion (views vs submits).
- Implement member invites & RBAC UIs (owner/admin/analyst) with Supabase RLS roles.
- Connect Stripe webhooks to `subscriptions` table and guard premium features.
- Wire Slack/email notification channels to `notification_rules` tables.
- Add automated tests (Playwright/Cypress) for end-to-end QR → response flows.

## License

Internal MVP implementation for BSP Lab. Review PRD (`/home/bruno/Documents/PRD-s/04_QR_PRD/PRD_Interview_Summary.md`) for full business context before extending.
