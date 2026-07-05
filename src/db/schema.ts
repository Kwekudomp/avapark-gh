import {
  pgTable, uuid, text, date, integer, numeric, boolean, timestamp, jsonb,
  index, uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================
// Auth — replaces Supabase auth.users + profiles
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("admin"), // 'admin' | 'marketing_sales'
  password_hash: text("password_hash").notNull(),
  last_sign_in_at: timestamp("last_sign_in_at", { withTimezone: true, mode: "string" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

// ============================================================
// Core content
// ============================================================

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  experience_slug: text("experience_slug").notNull(),
  experience_name: text("experience_name").notNull(),
  guest_name: text("guest_name").notNull(),
  guest_email: text("guest_email").notNull(),
  guest_phone: text("guest_phone").notNull(),
  booking_date: date("booking_date").notNull(),
  group_size: integer("group_size").notNull().default(1),
  adults: integer("adults").notNull().default(1),
  children: integer("children").notNull().default(0),
  package_tier_id: text("package_tier_id"),
  package_tier_name: text("package_tier_name"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2, mode: "number" }).notNull(),
  deposit_amount: numeric("deposit_amount", { precision: 10, scale: 2, mode: "number" }).notNull(),
  paystack_reference: text("paystack_reference").unique(),
  paystack_status: text("paystack_status"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  admin_notes: text("admin_notes"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  schedule: text("schedule").notNull().default(""),
  time: text("time").notNull().default(""),
  package_includes: text("package_includes").array().notNull().default([]),
  activities: text("activities").array().notNull().default([]),
  cover_image_url: text("cover_image_url"),
  images: text("images").array().notNull().default([]),
  category: text("category").notNull().default("recurring"),
  is_featured: boolean("is_featured").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }),
  deposit_amount: numeric("deposit_amount", { precision: 10, scale: 2, mode: "number" }),
  package_tiers: jsonb("package_tiers"),
  sort_order: integer("sort_order").notNull().default(0),
  whatsapp_message: text("whatsapp_message").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  category: text("category").notNull().default("venue"),
  sort_order: integer("sort_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  uploaded_by: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  label: text("label").notNull().default(""),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  event_date: date("event_date").notNull(),
  end_date: date("end_date"),
  image_url: text("image_url"),
  price: text("price"),
  ticket_url: text("ticket_url"),
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  youtube_url: text("youtube_url"),
  video_url: text("video_url"),
  source: text("source").notNull().default("youtube"),
  category: text("category").notNull().default("highlights"),
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  guest_name: text("guest_name").notNull(),
  guest_email: text("guest_email").notNull(),
  experience_name: text("experience_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  status: text("status").notNull().default("pending"),
  admin_note: text("admin_note"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const accommodationPartners = pgTable("accommodation_partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  distance: text("distance").notNull(),
  price_from: text("price_from").notNull(),
  guests: text("guests").notNull(),
  highlights: text("highlights").array().notNull().default([]),
  badge: text("badge"),
  badge_color: text("badge_color"),
  image_url: text("image_url"),
  whatsapp_override: text("whatsapp_override"),
  enquiry_url: text("enquiry_url"),
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

// ============================================================
// Commerce
// ============================================================

export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subnote: text("subnote"),
  category: text("category").notNull(),
  meal: text("meal").notNull(), // 'breakfast' | 'lunch' | 'supper' | 'all-day'
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }),
  tags: text("tags").array().notNull().default([]),
  available: boolean("available").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  index("menu_items_meal_idx").on(t.meal),
  index("menu_items_sort_idx").on(t.sort_order),
]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_email: text("customer_email"),
  order_type: text("order_type").notNull(), // 'dine-in' | 'pickup' | 'delivery'
  scheduled_time: text("scheduled_time"),
  items: jsonb("items").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2, mode: "number" }).notNull().default(0),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  index("orders_created_at_idx").on(t.created_at.desc()),
  index("orders_status_idx").on(t.status),
]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  experience: text("experience"),
  dates: text("dates"),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"), // 'unread' | 'read' | 'archived'
  admin_note: text("admin_note"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  index("inquiries_created_at_idx").on(t.created_at.desc()),
  index("inquiries_status_idx").on(t.status),
]);

// ============================================================
// Site lock
// ============================================================

export const siteState = pgTable("site_state", {
  id: text("id").primaryKey().default("singleton"),
  state: text("state").notNull().default("off"), // 'off' | 'maintenance' | 'lockdown'
  note: text("note"),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

// ============================================================
// WhatsApp agent
// ============================================================

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone_number_id: text("phone_number_id").notNull().unique(),
  timezone: text("timezone").notNull().default("Africa/Accra"),
  supported_languages: text("supported_languages").array().notNull().default(["en"]),
  brand_voice: text("brand_voice").notNull()
    .default('Friendly, warm, and helpful. Use "we" instead of the venue name. Keep responses concise.'),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  venue_id: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const closures = pgTable("closures", {
  id: uuid("id").primaryKey().defaultRandom(),
  venue_id: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  closure_date: date("closure_date").notNull(),
  reason: text("reason").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  venue_id: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  customer_phone: text("customer_phone").notNull(),
  customer_name: text("customer_name"),
  language: text("language").notNull().default("en"),
  status: text("status").notNull().default("active"), // 'active' | 'closed'
  started_at: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  last_message_at: timestamp("last_message_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  index("idx_conversations_venue_phone").on(t.venue_id, t.customer_phone),
  index("idx_conversations_last_message").on(t.last_message_at.desc()),
]);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // 'inbound' | 'outbound'
  body: text("body").notNull(),
  intent: text("intent"), // 'faq' | 'booking' | 'complaint' | 'order_status' | 'availability' | 'other'
  language: text("language"),
  confidence: numeric("confidence", { precision: 3, scale: 2, mode: "number" }),
  category: text("category"),
  sent_by: text("sent_by").notNull(), // 'customer' | 'ai' | 'staff'
  wa_message_id: text("wa_message_id"),
  sent_at: timestamp("sent_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  index("idx_messages_conversation").on(t.conversation_id, t.sent_at),
]);

export const escalations = pgTable("escalations", {
  id: uuid("id").primaryKey().defaultRandom(),
  message_id: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  venue_id: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending' | 'assigned' | 'resolved'
  assigned_to: uuid("assigned_to").references(() => users.id),
  draft_reply: text("draft_reply"),
  resolved_at: timestamp("resolved_at", { withTimezone: true, mode: "string" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  index("idx_escalations_venue_status").on(t.venue_id, t.status),
]);

export const staffWhatsapp = pgTable("staff_whatsapp", {
  id: uuid("id").primaryKey().defaultRandom(),
  venue_id: uuid("venue_id").notNull().references(() => venues.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("agent"), // 'admin' | 'agent'
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("staff_whatsapp_venue_user_unique").on(t.venue_id, t.user_id),
]);
