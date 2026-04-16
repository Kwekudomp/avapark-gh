import { createAdminSupabase } from "@/lib/supabase-server";
import type { CMSExperience, MenuItemRow } from "@/lib/supabase";
import type { ResolvedContext, Intent } from "./types";

export function buildFactsFromExperiences(
  experiences: CMSExperience[]
): Array<{ key: string; value: string }> {
  return experiences.flatMap((exp) => {
    const facts: Array<{ key: string; value: string }> = [];
    facts.push({
      key: exp.name,
      value: `${exp.schedule}, ${exp.time}. ${exp.tagline || ""}`.trim(),
    });
    if (exp.price) {
      facts.push({ key: `${exp.name} price`, value: `GHC ${exp.price}` });
    }
    if (exp.package_tiers?.length) {
      const tiers = exp.package_tiers
        .map((t) => `${t.name}: GHC ${t.price}`)
        .join(", ");
      facts.push({ key: `${exp.name} tiers`, value: tiers });
    }
    if (exp.package_includes?.length) {
      facts.push({
        key: `${exp.name} includes`,
        value: exp.package_includes.join(", "),
      });
    }
    return facts;
  });
}

export function buildFactsFromMenu(
  items: MenuItemRow[]
): Array<{ key: string; value: string }> {
  const byCategory = new Map<string, string[]>();
  for (const item of items) {
    if (!item.available) continue;
    const list = byCategory.get(item.category) ?? [];
    list.push(`${item.name}: GHC ${item.price ?? "N/A"}`);
    byCategory.set(item.category, list);
  }

  return Array.from(byCategory.entries()).map(([category, items]) => ({
    key: category,
    value: items.join("; "),
  }));
}

export async function resolveContext(
  intent: Intent,
  category: string,
  venueId: string
): Promise<ResolvedContext> {
  const supabase = createAdminSupabase();
  const facts: Array<{ key: string; value: string }> = [];
  let source = "database";

  if (intent === "faq") {
    const { data: faqs } = await supabase
      .from("faqs")
      .select("question, answer")
      .eq("venue_id", venueId)
      .eq("is_active", true);

    if (faqs?.length) {
      facts.push(...faqs.map((f) => ({ key: f.question, value: f.answer })));
    }

    if (["pricing", "events", "experiences", "activities", "schedule", "hours"].includes(category)) {
      const { data: experiences } = await supabase
        .from("experiences")
        .select("*")
        .eq("is_active", true);

      if (experiences?.length) {
        facts.push(...buildFactsFromExperiences(experiences as CMSExperience[]));
        source = "experiences";
      }
    }

    if (["menu", "food", "drinks", "restaurant"].includes(category)) {
      const { data: menuItems } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true);

      if (menuItems?.length) {
        facts.push(...buildFactsFromMenu(menuItems as MenuItemRow[]));
        source = "menu";
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const { data: closures } = await supabase
      .from("closures")
      .select("closure_date, reason")
      .eq("venue_id", venueId)
      .gte("closure_date", today)
      .order("closure_date", { ascending: true })
      .limit(5);

    if (closures?.length) {
      facts.push({
        key: "upcoming_closures",
        value: closures.map((c) => `${c.closure_date}: ${c.reason}`).join("; "),
      });
    }
  }

  if (intent === "availability") {
    const { data: experiences } = await supabase
      .from("experiences")
      .select("name, schedule, time")
      .eq("is_active", true);

    if (experiences?.length) {
      facts.push(
        ...experiences.map((e) => ({
          key: e.name,
          value: `${e.schedule}, ${e.time}`,
        }))
      );
    }

    const { data: closures } = await supabase
      .from("closures")
      .select("closure_date, reason")
      .eq("venue_id", venueId);

    if (closures?.length) {
      facts.push({
        key: "closures",
        value: closures.map((c) => `${c.closure_date}: ${c.reason}`).join("; "),
      });
    }

    source = "availability";
  }

  if (intent === "order_status") {
    source = "orders";
  }

  return {
    facts,
    source,
    isEmpty: facts.length === 0,
  };
}
