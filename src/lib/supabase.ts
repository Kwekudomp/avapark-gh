export type BookingStatus = "pending" | "confirmed" | "cancelled";

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
