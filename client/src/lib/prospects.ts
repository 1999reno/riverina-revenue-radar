import rawData from "../data/prospects.json";

export type ProspectRaw = {
  company_name: string;
  category: string;
  town_or_area: string;
  website_url?: string;
  public_source_url?: string;
  why_good_fit?: string;
  why_good_if?: string; // typo in source data — used as fallback
  suggested_buyer_titles?: string[];
  lead_score: number;
  first_outreach_angle?: string;
};

export type Prospect = {
  id: string;
  companyName: string;
  category: string;
  categoryGroup: CategoryGroup;
  town: string;
  websiteUrl: string;
  publicSourceUrl: string;
  whyGoodFit: string;
  buyerTitles: string[];
  leadScore: number;
  outreachAngle: string;
  tier: 1 | 2 | 3;
  estMonthlyValue: number; // AUD per month indicative pipeline value
};

export type CategoryGroup =
  | "Winery / Brewery / Distillery"
  | "Meat Processing"
  | "Dairy"
  | "Grain & Feed"
  | "Cold Storage & Logistics"
  | "Packing & Citrus"
  | "Rice & Food Manufacturing"
  | "Other";

export type PricingBreakdown = {
  baseMonthly: number;
  categoryMultiplier: number;
  finalMonthly: number;
  tierName: string;
  categoryReason: string;
  formula: string;
  includedServices: string[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const groupForCategory = (cat: string): CategoryGroup => {
  const c = cat.toLowerCase();
  if (c.includes("winery") || c.includes("brewery") || c.includes("distillery"))
    return "Winery / Brewery / Distillery";
  if (c.includes("beef") || c.includes("poultry") || c.includes("meat"))
    return "Meat Processing";
  if (c.includes("dairy")) return "Dairy";
  if (c.includes("grain") || c.includes("feed") || c.includes("rice mill"))
    return "Grain & Feed";
  if (c.includes("cold storage") || c.includes("refrigerated"))
    return "Cold Storage & Logistics";
  if (c.includes("citrus") || c.includes("packing"))
    return "Packing & Citrus";
  if (c.includes("rice processing") || c.includes("food manufacturing"))
    return "Rice & Food Manufacturing";
  return "Other";
};

const tierFor = (score: number): 1 | 2 | 3 => {
  if (score >= 88) return 1;
  if (score >= 75) return 2;
  return 3;
};

// Indicative monthly contract pipeline based on tier and category — not promises.
export const TIER_PRICING: Record<1 | 2 | 3, { name: string; baseMonthly: number; services: string[] }> = {
  1: {
    name: "Tier 1 major compliance site",
    baseMonthly: 2400,
    services: [
      "Monthly commercial pest service with audit-ready report",
      "External rodent station check and internal monitor review",
      "Corrective-action register for QA or site manager",
      "Quarterly trend review and service-frequency recommendation",
      "SDS, APVMA label and chemical-use documentation where treatment is used",
    ],
  },
  2: {
    name: "Tier 2 active commercial site",
    baseMonthly: 1400,
    services: [
      "Monthly or six-weekly pest service depending on activity",
      "Rodent, crawling insect and flying insect monitoring",
      "Written service report and corrective actions",
      "Basic trend review for management file",
    ],
  },
  3: {
    name: "Tier 3 nurture / smaller site",
    baseMonthly: 850,
    services: [
      "Scheduled inspection and preventative pest service",
      "Basic monitoring-device checks",
      "Written service record and recommendations",
      "Escalation quote if activity or audit requirements increase",
    ],
  },
};

export const CATEGORY_PRICING: Record<CategoryGroup, { multiplier: number; reason: string; services: string[] }> = {
  "Meat Processing": {
    multiplier: 1.4,
    reason: "Higher fly, rodent, waste, biosecurity and export-audit exposure.",
    services: ["Fly-pressure controls", "Waste/offal zone review", "Higher-frequency external perimeter checks"],
  },
  "Rice & Food Manufacturing": {
    multiplier: 1.25,
    reason: "Stored-product insect, grain dust, packing-line and supermarket-audit risk.",
    services: ["Stored-product insect monitoring", "Packing-line and dry-store review", "Device map for audit file"],
  },
  Dairy: {
    multiplier: 1.2,
    reason: "High-care food zones, moisture, flies and chemical-contamination sensitivity.",
    services: ["Fly and rodent monitoring", "Chemical-use controls for high-care areas", "Cold-room and receival checks"],
  },
  "Cold Storage & Logistics": {
    multiplier: 1.1,
    reason: "Loading docks, pallet movement and third-party customer audit requirements.",
    services: ["Loading-dock inspection", "Rodent ingress review", "3PL client compliance records"],
  },
  "Grain & Feed": {
    multiplier: 1.15,
    reason: "Rodent, bird and stored-grain insect exposure around receival, silos and bagging.",
    services: ["Receival and spillage-zone inspection", "Stored-grain pest monitoring", "Harvest-season escalation trigger"],
  },
  "Winery / Brewery / Distillery": {
    multiplier: 1,
    reason: "Standard large-site food and beverage pest program with dry goods, hospitality and production zones.",
    services: ["Dry goods inspection", "Cellar/production review", "Hospitality area pest controls where applicable"],
  },
  "Packing & Citrus": {
    multiplier: 0.9,
    reason: "Strong compliance need, but usually a more targeted program than meat or high-care manufacturing.",
    services: ["Packing-line inspection", "Fruit-fly monitoring support", "Cool-room and waste-area review"],
  },
  Other: {
    multiplier: 0.85,
    reason: "General commercial risk where scope is confirmed after inspection.",
    services: ["General perimeter inspection", "Monitoring-device checks", "Scope confirmation after first site walk"],
  },
};

const estValueFor = (tier: 1 | 2 | 3, group: CategoryGroup): number => {
  const base = TIER_PRICING[tier].baseMonthly;
  const mult = CATEGORY_PRICING[group]?.multiplier ?? 1;
  return Math.round((base * mult) / 50) * 50;
};

export type ManualLeadInput = {
  companyName: string;
  category: string;
  categoryGroup: CategoryGroup;
  town: string;
  websiteUrl?: string;
  publicSourceUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  leadScore?: number;
  estMonthlyValue?: number;
};

export const createManualProspect = (input: ManualLeadInput, existingCount: number): Prospect => {
  const score = Math.max(1, Math.min(100, Math.round(input.leadScore || 72)));
  const tier = tierFor(score);
  const value = input.estMonthlyValue && input.estMonthlyValue > 0
    ? Math.round(input.estMonthlyValue)
    : estValueFor(tier, input.categoryGroup);
  const contactLine = [input.contactName, input.contactEmail, input.contactPhone].filter(Boolean).join(" · ");

  return {
    id: `manual-${slugify(input.companyName)}-${Date.now()}-${existingCount}`,
    companyName: input.companyName.trim(),
    category: input.category.trim() || input.categoryGroup,
    categoryGroup: input.categoryGroup,
    town: input.town.trim() || "Riverina, NSW",
    websiteUrl: input.websiteUrl?.trim() || "",
    publicSourceUrl: input.publicSourceUrl?.trim() || input.websiteUrl?.trim() || "",
    whyGoodFit: input.notes?.trim() || "Manually added lead. Confirm facility size, food-safety requirements, pest pressure, decision maker and service scope during qualification.",
    buyerTitles: contactLine ? [contactLine, "Operations Manager", "QA Manager", "Site Manager"] : ["Operations Manager", "QA Manager", "Site Manager"],
    leadScore: score,
    outreachAngle: input.notes?.trim() || "New manually added lead. Start with a short audit-readiness or pest-risk review offer and confirm the right site contact.",
    tier,
    estMonthlyValue: value,
  };
};

export const pricingBreakdownFor = (p: Prospect): PricingBreakdown => {
  const tier = TIER_PRICING[p.tier];
  const category = CATEGORY_PRICING[p.categoryGroup];
  return {
    baseMonthly: tier.baseMonthly,
    categoryMultiplier: category.multiplier,
    finalMonthly: p.estMonthlyValue,
    tierName: tier.name,
    categoryReason: category.reason,
    formula: `${formatAUD(tier.baseMonthly)} base × ${category.multiplier.toFixed(2)} ${p.categoryGroup} factor = ${formatAUD(p.estMonthlyValue)}/month`,
    includedServices: [...tier.services, ...category.services],
  };
};

export const PROSPECTS: Prospect[] = (rawData as ProspectRaw[]).map((r, idx) => {
  const group = groupForCategory(r.category);
  const tier = tierFor(r.lead_score);
  return {
    id: `${slugify(r.company_name)}-${idx}`,
    companyName: r.company_name,
    category: r.category,
    categoryGroup: group,
    town: r.town_or_area,
    websiteUrl: r.website_url ?? "",
    publicSourceUrl: r.public_source_url ?? "",
    whyGoodFit: r.why_good_fit ?? r.why_good_if ?? "",
    buyerTitles: r.suggested_buyer_titles ?? [],
    leadScore: r.lead_score,
    outreachAngle: r.first_outreach_angle ?? "",
    tier,
    estMonthlyValue: estValueFor(tier, group),
  };
});

export const CATEGORY_GROUPS: CategoryGroup[] = [
  "Winery / Brewery / Distillery",
  "Meat Processing",
  "Dairy",
  "Grain & Feed",
  "Rice & Food Manufacturing",
  "Cold Storage & Logistics",
  "Packing & Citrus",
  "Other",
];

export const TOWNS = Array.from(
  new Set(PROSPECTS.map((p) => p.town))
).sort();

export const formatAUD = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n);
