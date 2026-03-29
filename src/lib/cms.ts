import { createServerSupabase } from "./supabase-server";
import type { CMSExperience, GalleryItem, CMSEvent, CMSVideo, SiteSettings } from "./supabase";

export type { CMSExperience, GalleryItem, CMSEvent, CMSVideo, SiteSettings };

export async function getCMSExperiences(): Promise<CMSExperience[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return [];
    return data as CMSExperience[];
  } catch {
    return [];
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
    if (error || !data) return null;
    return data as CMSExperience;
  } catch {
    return null;
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
    if (error || !data?.length) return [];
    return data as CMSExperience[];
  } catch {
    return [];
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

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    phone_primary: "+233 (0) 540 879 700",
    phone_picnic: "+233 (0) 547 352 490",
    email: "info@hiddenparadisegh.com",
    instagram_handle: "hiddenparadisegh",
    whatsapp_number: "233540879700",
    location_address: "Akuse Road, Okwenya, Eastern Region, Ghana",
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
