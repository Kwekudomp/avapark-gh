import { createServerSupabase } from "./supabase-server";
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
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return staticExperiences.map(adaptStatic);
    return data as CMSExperience[];
  } catch {
    return staticExperiences.map(adaptStatic);
  }
}

export async function getCMSExperienceBySlug(slug: string): Promise<CMSExperience | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error || !data) {
      const fallback = staticExperiences.find(e => e.slug === slug);
      return fallback ? adaptStatic(fallback) : null;
    }
    return data as CMSExperience;
  } catch {
    const fallback = staticExperiences.find(e => e.slug === slug);
    return fallback ? adaptStatic(fallback) : null;
  }
}

export async function getFeaturedCMSExperiences(): Promise<CMSExperience[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(6);
    if (error || !data?.length) return getStaticFeatured().map(adaptStatic);
    return data as CMSExperience[];
  } catch {
    return getStaticFeatured().map(adaptStatic);
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return [];
    return data as GalleryItem[];
  } catch {
    return [];
  }
}

export async function getUpcomingEvents(): Promise<CMSEvent[]> {
  try {
    const supabase = await createServerSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(6);
    if (error || !data?.length) return [];
    return data as CMSEvent[];
  } catch {
    return [];
  }
}

export async function getVideos(): Promise<CMSVideo[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(6);
    if (error || !data?.length) return [];
    return data as CMSVideo[];
  } catch {
    return [];
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, guest_name, experience_name, rating, comment, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[getApprovedReviews] Supabase error:", error.message, error.code);
      return [];
    }
    if (!data?.length) {
      console.warn("[getApprovedReviews] No approved reviews returned (data length 0)");
      return [];
    }
    console.info(`[getApprovedReviews] Returned ${data.length} approved review(s)`);
    return data as Review[];
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
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[getPublicMenuItems] Supabase error:", error.message);
      return staticMenuAsRows();
    }
    if (!data?.length) return staticMenuAsRows();
    return data as MenuItemRow[];
  } catch (e) {
    console.error("[getPublicMenuItems] Threw:", e instanceof Error ? e.message : e);
    return staticMenuAsRows();
  }
}

export async function getAccommodationPartners(): Promise<AccommodationPartner[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("accommodation_partners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[cms] accommodation_partners error:", error.message);
      return [];
    }
    return (data ?? []) as AccommodationPartner[];
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
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error || !data?.length) return defaults;
    const settings = { ...defaults };
    data.forEach(({ key, value }) => { settings[key] = value; });
    return settings;
  } catch {
    return defaults;
  }
}
