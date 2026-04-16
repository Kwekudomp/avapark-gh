import { describe, it, expect } from "vitest";
import { buildFactsFromExperiences, buildFactsFromMenu } from "@/lib/whatsapp/resolver";
import type { CMSExperience, MenuItemRow } from "@/lib/supabase";

describe("buildFactsFromExperiences", () => {
  it("extracts key facts from experiences", () => {
    const experiences: Partial<CMSExperience>[] = [
      {
        name: "Party in the Woods",
        schedule: "Every Friday",
        time: "5pm - 3am",
        tagline: "The ultimate Friday night experience",
        price: 150,
        package_tiers: [
          { id: "1", name: "Explorer", price: 150, deposit: 50, description: "General admission" },
          { id: "2", name: "VIP", price: 350, deposit: 100, description: "VIP section" },
        ],
        package_includes: ["Live DJ", "Bonfire", "Dance floor"],
      },
    ];

    const facts = buildFactsFromExperiences(experiences as CMSExperience[]);
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.some((f) => f.value.includes("150"))).toBe(true);
    expect(facts.some((f) => f.value.includes("VIP"))).toBe(true);
    expect(facts.some((f) => f.value.includes("Friday"))).toBe(true);
  });

  it("returns empty for no experiences", () => {
    const facts = buildFactsFromExperiences([]);
    expect(facts).toEqual([]);
  });
});

describe("buildFactsFromMenu", () => {
  it("groups menu items by category", () => {
    const items: Partial<MenuItemRow>[] = [
      { name: "Jollof Rice", category: "Rice Dishes", price: 80, available: true },
      { name: "Fried Rice", category: "Rice Dishes", price: 85, available: true },
      { name: "Grilled Tilapia", category: "Seafood", price: 120, available: true },
    ];

    const facts = buildFactsFromMenu(items as MenuItemRow[]);
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.some((f) => f.key === "Rice Dishes")).toBe(true);
  });
});
