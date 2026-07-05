import { and, asc, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import {
  experiences as experiencesTable,
  galleryItems,
  events as eventsTable,
  videos as videosTable,
  reviews as reviewsTable,
  menuItems,
  accommodationPartners,
  siteSettings,
} from "@/db/schema";
import type { CMSExperience, GalleryItem, CMSEvent, CMSVideo, SiteSettings, Review, AccommodationPartner, MenuItemRow } from "./supabase";
import { experiences as staticExperiences, getFeaturedExperiences as getStaticFeatured } from "@/data/experiences";
import type { Experience } from "@/data/experiences";
import { MENU_ITEMS as staticMenuItems } from "@/data/menu";

export type { CMSExperience, GalleryItem, CMSEvent, CMSVideo, SiteSettings, AccommodationPartner, MenuItemRow };

/** Convert static Experience → CMSExperience shape so components work with either source */
function adaptStatic(e: Experience): CMSExperience {
  return {
    id: e.slug,
    slug: e.slug,
    name: e.name,
    tagline: e.tagline,
    description: e.description,
    schedule: e.schedule,
    time: e.time,
    package_includes: e.packageIncludes,
    activities: e.activities,
    cover_image_url: e.coverImage || null,
    images: e.images,
    category: e.category,
    is_featured: e.isFeatured,
    is_active: true,
    price: e.price,
    deposit_amount: e.depositAmount,
    package_tiers: e.packageTiers ?? null,
    sort_order: 0,
    whatsapp_message: e.whatsappMessage,
  };
}

export async function getCMSExperiences(): Promise<CMSExperience[]> {
  try {
    const data = await getDb()
      .select()
      .from(experiencesTable)
      .where(eq(experiencesTable.is_active, true))
      .orderBy(asc(experiencesTable.sort_order));
    if (!data?.length) return staticExperiences.map(adaptStatic);
    return data as unknown as CMSExperience[];
  } catch {
    return staticExperiences.map(adaptStatic);
  }
}

export async function getCMSExperienceBySlug(slug: string): Promise<CMSExperience | null> {
  try {
    const rows = await getDb()
      .select()
      .from(experiencesTable)
      .where(and(eq(experiencesTable.slug, slug), eq(experiencesTable.is_active, true)))
      .limit(1);
    const data = rows[0];
    if (!data) {
      const fallback = staticExperiences.find(e => e.slug === slug);
      return fallback ? adaptStatic(fallback) : null;
    }
    return data as unknown as CMSExperience;
  } catch {
    const fallback = staticExperiences.find(e => e.slug === slug);
    return fallback ? adaptStatic(fallback) : null;
  }
}

export async function getFeaturedCMSExperiences(): Promise<CMSExperience[]> {
  try {
    const data = await getDb()
      .select()
      .from(experiencesTable)
      .where(and(eq(experiencesTable.is_featured, true), eq(experiencesTable.is_active, true)))
      .orderBy(asc(experiencesTable.sort_order))
      .limit(6);
    if (!data?.length) return getStaticFeatured().map(adaptStatic);
    return data as unknown as CMSExperience[];
  } catch {
    return getStaticFeatured().map(adaptStatic);
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const data = await getDb()
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.is_active, true))
      .orderBy(asc(galleryItems.sort_order));
    if (!data?.length) return [];
    return data as unknown as GalleryItem[];
  } catch {
    return [];
  }
}

export async function getUpcomingEvents(): Promise<CMSEvent[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const data = await getDb()
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.is_active, true), gte(eventsTable.event_date, today)))
      .orderBy(asc(eventsTable.event_date))
      .limit(6);
    if (!data?.length) return [];
    return data as unknown as CMSEvent[];
  } catch {
    return [];
  }
}

export async function getVideos(): Promise<CMSVideo[]> {
  try {
    const data = await getDb()
      .select()
      .from(videosTable)
      .where(eq(videosTable.is_active, true))
      .orderBy(asc(videosTable.sort_order))
      .limit(6);
    if (!data?.length) return [];
    return data as unknown as CMSVideo[];
  } catch {
    return [];
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    const data = await getDb()
      .select({
        id: reviewsTable.id,
        guest_name: reviewsTable.guest_name,
        experience_name: reviewsTable.experience_name,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        created_at: reviewsTable.created_at,
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.status, "approved"))
      .orderBy(desc(reviewsTable.created_at));
    if (!data?.length) {
      console.warn("[getApprovedReviews] No approved reviews returned (data length 0)");
      return [];
    }
    console.info(`[getApprovedReviews] Returned ${data.length} approved review(s)`);
    return data as unknown as Review[];
  } catch (e) {
    console.error("[getApprovedReviews] Threw:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Fall back to the static menu when the DB is empty or unreachable. */
function staticMenuAsRows(): MenuItemRow[] {
  const now = new Date().toISOString();
  return staticMenuItems.map((item, idx) => ({
    id: item.id,
    name: item.name,
    subnote: item.subnote ?? null,
    category: item.category,
    meal: item.meal,
    // Static file has placeholder prices — expose them as NULL so the
    // ordering UI knows to disable "Add to order" until a real price
    // is set via the admin panel.
    price: null,
    tags: (item.tags ?? []) as MenuItemRow["tags"],
    available: true,
    sort_order: idx * 10,
    created_at: now,
    updated_at: now,
  }));
}

/** Public-facing menu fetch. Returns only available items. */
export async function getPublicMenuItems(): Promise<MenuItemRow[]> {
  try {
    const data = await getDb()
      .select()
      .from(menuItems)
      .where(eq(menuItems.available, true))
      .orderBy(asc(menuItems.sort_order));
    if (!data?.length) return staticMenuAsRows();
    return data as unknown as MenuItemRow[];
  } catch (e) {
    console.error("[getPublicMenuItems] Threw:", e instanceof Error ? e.message : e);
    return staticMenuAsRows();
  }
}

export async function getAccommodationPartners(): Promise<AccommodationPartner[]> {
  try {
    const data = await getDb()
      .select()
      .from(accommodationPartners)
      .where(eq(accommodationPartners.is_active, true))
      .orderBy(asc(accommodationPartners.sort_order));
    return (data ?? []) as unknown as AccommodationPartner[];
  } catch (err) {
    console.error("[cms] accommodation_partners exception:", err);
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    phone_primary: "+233 (0) 540 879 700",
    phone_picnic: "+233 (0) 547 352 490",
    email: "info@hiddenparadisegh.com",
    instagram_handle: "hiddenparadise_gh",
    whatsapp_number: "233540879700",
    location_address: "Akuse Road, Okwenya, Eastern/Volta Region, Ghana",
    location_description: "About an hour east of Accra",
    hours_weekday: "9:00 AM – 1:00 AM",
    hours_weekend: "9:00 AM – 3:00 AM",
    tagline: "Your Escape Into Nature",
  };
  try {
    const data = await getDb()
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings);
    if (!data?.length) return defaults;
    const settings = { ...defaults };
    data.forEach(({ key, value }) => { settings[key] = value; });
    return settings;
  } catch {
    return defaults;
  }
}
