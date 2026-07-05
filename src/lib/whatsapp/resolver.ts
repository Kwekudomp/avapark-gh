import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { closures, experiences, faqs, menuItems } from "@/db/schema";
import type { CMSExperience, MenuItemRow } from "@/lib/types";
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
  const db = getDb();
  const facts: Array<{ key: string; value: string }> = [];
  let source = "database";

  if (intent === "faq") {
    const faqRows = await db
      .select({ question: faqs.question, answer: faqs.answer })
      .from(faqs)
      .where(and(eq(faqs.venue_id, venueId), eq(faqs.is_active, true)));

    if (faqRows.length) {
      facts.push(...faqRows.map((f) => ({ key: f.question, value: f.answer })));
    }

    if (["pricing", "events", "experiences", "activities", "schedule", "hours"].includes(category)) {
      const experienceRows = await db
        .select()
        .from(experiences)
        .where(eq(experiences.is_active, true));

      if (experienceRows.length) {
        facts.push(...buildFactsFromExperiences(experienceRows as unknown as CMSExperience[]));
        source = "experiences";
      }
    }

    if (["menu", "food", "drinks", "restaurant"].includes(category)) {
      const menuRows = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.available, true));

      if (menuRows.length) {
        facts.push(...buildFactsFromMenu(menuRows as unknown as MenuItemRow[]));
        source = "menu";
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const closureRows = await db
      .select({ closure_date: closures.closure_date, reason: closures.reason })
      .from(closures)
      .where(and(eq(closures.venue_id, venueId), gte(closures.closure_date, today)))
      .orderBy(asc(closures.closure_date))
      .limit(5);

    if (closureRows.length) {
      facts.push({
        key: "upcoming_closures",
        value: closureRows.map((c) => `${c.closure_date}: ${c.reason}`).join("; "),
      });
    }
  }

  if (intent === "availability") {
    const experienceRows = await db
      .select({
        name: experiences.name,
        schedule: experiences.schedule,
        time: experiences.time,
      })
      .from(experiences)
      .where(eq(experiences.is_active, true));

    if (experienceRows.length) {
      facts.push(
        ...experienceRows.map((e) => ({
          key: e.name,
          value: `${e.schedule}, ${e.time}`,
        }))
      );
    }

    const closureRows = await db
      .select({ closure_date: closures.closure_date, reason: closures.reason })
      .from(closures)
      .where(eq(closures.venue_id, venueId));

    if (closureRows.length) {
      facts.push({
        key: "closures",
        value: closureRows.map((c) => `${c.closure_date}: ${c.reason}`).join("; "),
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
