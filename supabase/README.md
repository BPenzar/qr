# Supabase Schema Overview

The `0001_core_schema.sql` migration provisions all persistence required for the Free MVP.

## Entities

- **plans / subscriptions** – pricing plans, seeded with a `free` tier.
- **accounts / account_members** – multi-tenant workspaces keyed by `auth.users`.
- **projects** – logical containers for forms, enforcing plan project limits.
- **forms & form_questions** – published form definitions with typed questions.
- **form_qr_codes / form_links** – distribution artifacts (short URLs, QR slots).
- **responses / response_items** – captured feedback data & structured answers.
- **usage_counters** – aggregate meters (responses/month etc.).
- **audit_log / notification_* ** – hooks for future observability and alerts.

## Security

- Row Level Security is enabled on all user data tables.
- Policies allow authenticated members to manage their workspace while enabling anonymous access to published forms/questions/QR codes.
- Response inserts are open to anonymous clients but funnelled through the Next.js API which applies rate- and usage checks before using the Supabase service role.

## Triggers

- `handle_new_user` – auto-creates an account, default plan, and membership upon first auth signup.
- `set_updated_at_timestamp` – updates `updated_at` fields for mutable tables.

## Notes

- Usage counters are upserted from the Next.js API (`responses` route) to keep quota checks consistent.
- When enabling paid plans, connect Stripe webhooks to the `subscriptions` table and extend `plan` JSON limits to include premium metrics.
