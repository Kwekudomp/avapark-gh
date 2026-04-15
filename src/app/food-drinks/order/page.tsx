import { getPublicMenuItems } from "@/lib/cms";
import OrderPageClient from "./OrderPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Online | Hidden Paradise Nature Park",
  description:
    "Build your order from the Hidden Paradise kitchen — dine-in, pickup, or delivery. Browse the full menu and send your order straight to the kitchen on WhatsApp.",
};

export default async function OrderPage() {
  const items = await getPublicMenuItems();
  return <OrderPageClient items={items} />;
}
