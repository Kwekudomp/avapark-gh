# Cutover: Supabase → Neon + R2 (v2, current main)

Branch: `migrate/neon-r2-v2`. Supabase is fully removed; the stack is
Neon Postgres (Drizzle) + Cloudflare R2 + cookie-session auth. Content was
rebuilt from in-repo seeds (the paused Supabase project's data was not
recoverable without settling the org's invoices).

## Already done (local)

- 20-table schema pushed to Neon; seeded: 1 admin user, 16 experiences,
  10 site settings, 4 accommodation partners, 121 menu items, 27 gallery
  photos, WhatsApp venue placeholder, site_state singleton.
- R2 bucket `hiddenparadise-media` verified end-to-end (upload + public URL).
- Admin login: info@hiddenparadisegh.com (password given to owner in chat;
  change or add staff at /admin/users).

## Vercel env changes (Project → Settings → Environment Variables)

Add:
```
DATABASE_URL          = <Neon pooled connection string>
SESSION_SECRET        = <openssl rand -hex 32 — use a NEW one for prod>
R2_ACCOUNT_ID         = 64ee37e56251949cf9bf9882581b688a
R2_ACCESS_KEY_ID      = <from R2 API token>
R2_SECRET_ACCESS_KEY  = <from R2 API token>
R2_BUCKET             = hiddenparadise-media
R2_PUBLIC_URL         = https://pub-f387a98bdb154fc7bfad43ef6eaa93c4.r2.dev
```

Remove (if still present):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Keep unchanged: `MAINTENANCE_SECRET`, `ANTHROPIC_API_KEY`, `WHATSAPP_*`,
`RESEND_API_KEY`, `PAYSTACK_*`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
(`ADMIN_EMAIL`/`ADMIN_PASSWORD` are seed-script-only — do NOT add to Vercel.)

## Post-deploy verification

1. Public: home, /experiences, /gallery (27 photos), /food-drinks (menu),
   /event-calendar render with DB content.
2. /admin login works; wrong password rejected.
3. /admin/users — create a second account; sign in with it.
4. /admin/settings — save works (this endpoint was missing before the migration).
5. /admin/gallery — upload an image; URL starts with pub-…r2.dev.
6. Public review submit → appears pending in /admin/reviews.
7. Order flow: /order → submits + wa.me link.
8. /api/sys site lock: set maintenance with MAINTENANCE_SECRET, confirm
   public rewrite to /maintenance, then set off.
9. WhatsApp (when Meta creds are configured): set the venue's real
   phone_number_id (currently REPLACE_WITH_REAL_PHONE_NUMBER_ID) in the
   venues table or /admin/whatsapp/settings; webhook URL unchanged.

## Notable behavior changes

- Admin sessions last 7 days (jose JWT cookie `hp_admin_session`).
- WhatsApp inbox updates by 15-second polling instead of Supabase Realtime.
- DB triggers are gone; `updated_at` is set by the app on update.
- Password hashes live in the `users` table (bcrypt); manage staff at /admin/users.

## Data lost with Supabase (rebuilt-by-use)

Past bookings, reviews, orders, inquiries, WhatsApp conversations, and any
CMS edits made after the repo seeds. Historical records remain inside the
paused Supabase project until 31 Aug 2026 if ever needed (requires settling
the Qonsapp org invoice to restore).

## Follow-ups

- Attach `media.hiddenparadisegh.com` to the R2 bucket before real traffic
  (r2.dev is rate-limited) and swap `R2_PUBLIC_URL`.
- Consider deleting the Vercel KV/`@vercel/kv` if unused after this change.
