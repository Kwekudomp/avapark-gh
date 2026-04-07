import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn("[email] RESEND_API_KEY not set, emails will be skipped");
      return null;
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = "Hidden Paradise <noreply@hiddenparadisegh.com>";

/* ── Booking notification to team ─────────────────────────── */

interface BookingData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  experience_name: string;
  booking_date: string;
  adults: number;
  children: number;
  deposit_amount: number;
  package_tier_name: string | null;
  paystack_reference: string | null;
  notes: string | null;
}

export async function sendBookingNotification(booking: BookingData) {
  const paid = booking.paystack_reference
    ? `GHC ${booking.deposit_amount} paid (Ref: ${booking.paystack_reference})`
    : booking.deposit_amount > 0
      ? `GHC ${booking.deposit_amount} to pay at venue`
      : "Free entry";

  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: "bookings@hiddenparadisegh.com",
    subject: `New Booking: ${booking.experience_name} - ${booking.guest_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #D4A843; margin: 0; font-size: 20px;">New Booking Received</h1>
        </div>
        <div style="background: #FEFAF4; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 140px;">Guest</td><td style="padding: 8px 0; font-weight: 600;">${booking.guest_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${booking.guest_email}">${booking.guest_email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;"><a href="tel:${booking.guest_phone}">${booking.guest_phone}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Experience</td><td style="padding: 8px 0; font-weight: 600;">${booking.experience_name}</td></tr>
            ${booking.package_tier_name ? `<tr><td style="padding: 8px 0; color: #666;">Package</td><td style="padding: 8px 0;">${booking.package_tier_name}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0;">${booking.booking_date}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Group</td><td style="padding: 8px 0;">${booking.adults} adult${booking.adults > 1 ? "s" : ""}${booking.children > 0 ? ` + ${booking.children} child${booking.children > 1 ? "ren" : ""}` : ""}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Payment</td><td style="padding: 8px 0; font-weight: 600;">${paid}</td></tr>
            ${booking.notes ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Notes</td><td style="padding: 8px 0;">${booking.notes}</td></tr>` : ""}
          </table>
          <p style="margin-top: 20px; font-size: 13px; color: #888;">
            View all bookings in the <a href="https://www.hiddenparadisegh.com/admin/dashboard">admin dashboard</a>.
          </p>
        </div>
      </div>
    `,
  });
}

/* ── Guest confirmation email ─────────────────────────────── */

export async function sendBookingConfirmation(booking: BookingData) {
  const isPaid = !!booking.paystack_reference;
  const isFree = !booking.deposit_amount || booking.deposit_amount === 0;

  let paymentNote = "";
  if (isFree) {
    paymentNote = "This is a free entry event. No payment is required.";
  } else if (isPaid) {
    paymentNote = `Your deposit of GHC ${booking.deposit_amount} has been received (Ref: ${booking.paystack_reference}). The remaining balance is due on arrival.`;
  } else {
    paymentNote = `Please have GHC ${booking.deposit_amount} ready to pay at the venue on arrival.`;
  }

  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: booking.guest_email,
    replyTo: "bookings@hiddenparadisegh.com",
    subject: `Booking Confirmed: ${booking.experience_name} at Hidden Paradise`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #D4A843; margin: 0; font-size: 22px;">You're Booked!</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Hidden Paradise Nature Park</p>
        </div>
        <div style="background: #FEFAF4; padding: 24px; border: 1px solid #e5e5e5; border-top: none;">
          <p style="font-size: 15px; color: #333;">Hi ${booking.guest_name},</p>
          <p style="font-size: 15px; color: #333;">Thank you for booking with us! Here are your details:</p>

          <div style="background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #666; width: 120px;">Experience</td><td style="padding: 6px 0; font-weight: 600; color: #1B4332;">${booking.experience_name}</td></tr>
              ${booking.package_tier_name ? `<tr><td style="padding: 6px 0; color: #666;">Package</td><td style="padding: 6px 0;">${booking.package_tier_name}</td></tr>` : ""}
              <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0;">${booking.booking_date}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Group Size</td><td style="padding: 6px 0;">${booking.adults} adult${booking.adults > 1 ? "s" : ""}${booking.children > 0 ? ` + ${booking.children} child${booking.children > 1 ? "ren" : ""}` : ""}</td></tr>
            </table>
          </div>

          <div style="background: #f0f7f0; border-left: 3px solid #1B4332; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #333;">${paymentNote}</p>
          </div>

          <h3 style="color: #1B4332; font-size: 16px; margin-top: 24px;">Getting Here</h3>
          <p style="font-size: 14px; color: #555;">
            Hidden Paradise Nature Park, Akuse Road, Okwenya, Eastern/Volta Region.<br>
            About an hour's drive east of Accra.
          </p>

          <h3 style="color: #1B4332; font-size: 16px;">Need Help?</h3>
          <p style="font-size: 14px; color: #555;">
            Reply to this email or reach us on WhatsApp at
            <a href="https://wa.me/233540879700" style="color: #E8722A;">+233 540 879 700</a>.
          </p>
        </div>
        <div style="background: #E8722A; padding: 16px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: white; margin: 0; font-size: 13px;">
            Hidden Paradise Nature Park &bull; Akuse Road, Okwenya &bull;
            <a href="https://www.hiddenparadisegh.com" style="color: white;">hiddenparadisegh.com</a>
          </p>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 12px;">
            <a href="https://www.instagram.com/hiddenparadise_gh" style="color: rgba(255,255,255,0.8);">Instagram</a> &bull;
            <a href="https://www.tiktok.com/@hiddenparadise_gh" style="color: rgba(255,255,255,0.8);">TikTok</a>
          </p>
        </div>
      </div>
    `,
  });
}

/* ── Enquiry notification to team ─────────────────────────── */

interface EnquiryData {
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  dates?: string;
  message: string;
}

export async function sendEnquiryNotification(enquiry: EnquiryData) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: "info@hiddenparadisegh.com",
    replyTo: enquiry.email,
    subject: `New Enquiry from ${enquiry.name}${enquiry.experience ? ` - ${enquiry.experience}` : ""}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1B4332; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #D4A843; margin: 0; font-size: 20px;">New Enquiry</h1>
        </div>
        <div style="background: #FEFAF4; padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${enquiry.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
            ${enquiry.phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;"><a href="tel:${enquiry.phone}">${enquiry.phone}</a></td></tr>` : ""}
            ${enquiry.experience ? `<tr><td style="padding: 8px 0; color: #666;">Interest</td><td style="padding: 8px 0;">${enquiry.experience}</td></tr>` : ""}
            ${enquiry.dates ? `<tr><td style="padding: 8px 0; color: #666;">Dates</td><td style="padding: 8px 0;">${enquiry.dates}</td></tr>` : ""}
          </table>
          <div style="margin-top: 16px; padding: 16px; background: white; border: 1px solid #e5e5e5; border-radius: 8px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Message</p>
            <p style="margin: 0; font-size: 14px; color: #333; white-space: pre-wrap;">${enquiry.message}</p>
          </div>
          <p style="margin-top: 16px; font-size: 13px; color: #888;">
            Reply directly to this email to respond to ${enquiry.name}.
          </p>
        </div>
      </div>
    `,
  });
}
