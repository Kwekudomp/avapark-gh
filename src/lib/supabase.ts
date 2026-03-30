export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface CMSExperience {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  schedule: string;
  time: string;
  package_includes: string[];
  activities: string[];
  cover_image_url: string | null;
  images: string[];
  category: "recurring" | "tour" | "special";
  is_featured: boolean;
  is_active: boolean;
  price: number | null;
  deposit_amount: number | null;
  package_tiers: Array<{
    id: string;
    name: string;
    price: number;
    deposit: number;
    description: string;
  }> | null;
  sort_order: number;
  whatsapp_message: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  alt: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

export interface CMSEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  image_url: string | null;
  price: string | null;
  ticket_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface CMSVideo {
  id: string;
  title: string;
  youtube_url: string | null;
  video_url: string | null;
  source: "youtube" | "upload";
  category: string;
  is_active: boolean;
  sort_order: number;
}

export interface SiteSettings {
  phone_primary: string;
  phone_picnic: string;
  email: string;
  instagram_handle: string;
  whatsapp_number: string;
  location_address: string;
  location_description: string;
  hours_weekday: string;
  hours_weekend: string;
  tagline: string;
  [key: string]: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  guest_name: string;
  guest_email: string;
  experience_name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  admin_note: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  experience_slug: string;
  experience_name: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_date: string;
  group_size: number;
  adults: number;
  children: number;
  package_tier_id: string | null;
  package_tier_name: string | null;
  subtotal: number;
  deposit_amount: number;
  paystack_reference: string | null;
  paystack_status: string | null;
  status: BookingStatus;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
