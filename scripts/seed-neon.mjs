// One-off: rebuild Neon content from the repo's own seed data (the Supabase
// project is paused and unrecoverable — content is reconstructed from
// migrations + public/images). Idempotent: tables are only seeded when empty
// (menu insert is ON CONFLICT DO NOTHING).
//
// Usage: node scripts/seed-neon.mjs
// Env (.env.local): DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD (bootstrap admin)
import { config } from "dotenv";
import { readFileSync, readdirSync } from "fs";
import bcrypt from "bcryptjs";
import pg from "pg";

config({ path: ".env.local" });

const db = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function isEmpty(table) {
  const { rows: [r] } = await db.query(`select count(*)::int as n from public."${table}"`);
  return r.n === 0;
}

async function main() {
  await db.connect();

  // 1. Bootstrap admin user
  if (await isEmpty("users")) {
    const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to bootstrap the admin user");
    await db.query(
      `insert into public.users (email, name, role, password_hash) values ($1, $2, 'admin', $3)`,
      [email, "Hidden Paradise Admin", bcrypt.hashSync(password, 10)]
    );
    console.log(`users: created admin ${email}`);
  } else {
    console.log("users: not empty, skipped");
  }

  // 2. Experiences — 16 originals from 003_seed_experiences.sql
  if (await isEmpty("experiences")) {
    await db.query(readFileSync("supabase/migrations/003_seed_experiences.sql", "utf8"));
    console.log("experiences: seeded from 003_seed_experiences.sql");
  } else {
    console.log("experiences: not empty, skipped");
  }

  // 3. Site settings — defaults from 002_cms.sql
  if (await isEmpty("site_settings")) {
    await db.query(`insert into public.site_settings (key, label, value) values
      ('phone_primary', 'Primary Phone', '+233 (0) 540 879 700'),
      ('phone_picnic', 'Picnic Line', '+233 (0) 547 352 490'),
      ('email', 'Email Address', 'info@hiddenparadisegh.com'),
      ('instagram_handle', 'Instagram Handle', 'hiddenparadisegh'),
      ('whatsapp_number', 'WhatsApp Number', '233540879700'),
      ('location_address', 'Address', 'Akuse Road, Okwenya, Eastern Region, Ghana'),
      ('location_description', 'Location Description', 'About an hour east of Accra'),
      ('hours_weekday', 'Weekday Hours', '9:00 AM – 1:00 AM'),
      ('hours_weekend', 'Weekend Hours', '9:00 AM – 3:00 AM'),
      ('tagline', 'Site Tagline', 'Your Escape Into Nature')`);
    console.log("site_settings: seeded defaults");
  } else {
    console.log("site_settings: not empty, skipped");
  }

  // 4. Accommodation partners — from 20260331_accommodation_partners.sql
  if (await isEmpty("accommodation_partners")) {
    await db.query(`insert into public.accommodation_partners
      (name, type, distance, price_from, guests, highlights, badge, sort_order) values
      ('Akuse River Lodge',    'Riverside Cabins', '12 min drive', 'GHS 450', '2–4 guests', ARRAY['River views', 'Air conditioning', 'Breakfast included'], 'Popular',      1),
      ('Volta Forest Retreat', 'Eco Chalets',      '18 min drive', 'GHS 380', '2–6 guests', ARRAY['Forest setting', 'Private bathroom', 'Free Wi-Fi'],       'Eco-Friendly', 2),
      ('Okwenya Guesthouse',   'Budget Rooms',     '5 min drive',  'GHS 180', '1–2 guests', ARRAY['Walking distance', 'Fan-cooled', 'Local meals'],          'Best Value',   3),
      ('Eastern Hills Camp',   'Glamping Tents',   '8 min drive',  'GHS 320', '2 guests',   ARRAY['Luxury tents', 'Stargazing deck', 'Firepit'],             'New',          4)`);
    console.log("accommodation_partners: seeded 4 partners");
  } else {
    console.log("accommodation_partners: not empty, skipped");
  }

  // 5. Menu — 121 items from 20260415_menu_items.sql (extract the INSERT, it's
  //    ON CONFLICT DO NOTHING so rerun-safe; the migration's RLS parts are skipped)
  {
    const sql = readFileSync("supabase/migrations/20260415_menu_items.sql", "utf8");
    const start = sql.indexOf("insert into menu_items");
    if (start === -1) throw new Error("menu insert not found in migration");
    const res = await db.query(sql.slice(start));
    console.log(`menu_items: insert ran (${res.rowCount ?? 0} new rows)`);
  }

  // 6. Site state singleton
  await db.query(`insert into public.site_state (id, state) values ('singleton', 'off')
    on conflict (id) do nothing`);
  console.log("site_state: singleton ensured");

  // 7. WhatsApp venue — placeholder from 20260416 (phone_number_id is set for
  //    real when Meta credentials are configured)
  if (await isEmpty("venues")) {
    await db.query(`insert into public.venues (name, phone_number_id, supported_languages, brand_voice) values (
      'Hidden Paradise Nature Park',
      'REPLACE_WITH_REAL_PHONE_NUMBER_ID',
      ARRAY['en', 'tw', 'ee', 'ga', 'fr', 'pid'],
      'Friendly, warm, and welcoming. Use "we" instead of "Hidden Paradise". Keep responses concise and enthusiastic about the park. We are a nature park in the Eastern Region of Ghana, about 1 hour from Accra.'
    )`);
    console.log("venues: seeded Hidden Paradise placeholder");
  } else {
    console.log("venues: not empty, skipped");
  }

  // 8. Gallery — every photo in public/images, alt from filename
  if (await isEmpty("gallery_items")) {
    const toAlt = (f) =>
      "Hidden Paradise — " +
      f.replace(/\.(jpeg|jpg|png|webp)$/i, "").replace(/-v\d+$/, "").replace(/-/g, " ");
    let sort = 0, count = 0;
    for (const dir of ["venue", "experiences"]) {
      for (const f of readdirSync(`public/images/${dir}`).sort()) {
        if (!/\.(jpeg|jpg|png|webp)$/i.test(f)) continue;
        await db.query(
          `insert into public.gallery_items (url, alt, category, sort_order, is_active)
           values ($1, $2, $3, $4, true)`,
          [`/images/${dir}/${f}`, toAlt(f), dir === "venue" ? "venue" : "experiences", sort++]
        );
        count++;
      }
    }
    console.log(`gallery_items: seeded ${count} photos from public/images`);
  } else {
    console.log("gallery_items: not empty, skipped");
  }

  for (const t of ["users", "experiences", "site_settings", "accommodation_partners", "menu_items", "gallery_items", "venues", "site_state", "events", "videos", "reviews", "bookings", "orders", "inquiries"]) {
    const { rows: [r] } = await db.query(`select count(*)::int as n from public."${t}"`);
    console.log(`  ${t}: ${r.n} rows`);
  }
  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });
