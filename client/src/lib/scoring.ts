// Lead-scoring weight rubric used to explain each score on the detail panel.
// These numbers are descriptive of how Telios should think about scoring,
// not derived from the raw data field — the dataset already provides a final score.

export const SCORE_WEIGHTS = [
  {
    key: "facility_scale",
    label: "Facility scale",
    weight: 0.4,
    description:
      "Footprint, throughput volume, number of buildings, presence of grain receival or bulk storage. Bigger = more harborage and more compliance pressure.",
  },
  {
    key: "compliance_exposure",
    label: "Compliance exposure",
    weight: 0.3,
    description:
      "Export licences, FSANZ standards, HACCP, GFSI / SQF / BRC, AQIS / DAFF, retailer audits. More regulatory load = stronger need for documented IPM.",
  },
  {
    key: "audit_frequency",
    label: "Food-safety audit frequency",
    weight: 0.2,
    description:
      "Number of third-party audits per year. Sites with quarterly retailer or export audits need clean, well-documented pest records on file at all times.",
  },
  {
    key: "decision_accessibility",
    label: "Decision-maker accessibility",
    weight: 0.1,
    description:
      "Whether a regional QA / Site / Operations manager is named or reachable through publicly listed structures. Higher accessibility shortens the cycle.",
  },
] as const;

export const tierLabel = (tier: 1 | 2 | 3) =>
  tier === 1 ? "Tier 1 — Top priority" : tier === 2 ? "Tier 2 — Active" : "Tier 3 — Nurture";

export const tierColor = (tier: 1 | 2 | 3) =>
  tier === 1
    ? "bg-[hsl(36_78%_48%/0.18)] text-[hsl(36_78%_28%)] dark:text-[hsl(42_70%_72%)] border-[hsl(36_78%_48%/0.3)]"
    : tier === 2
      ? "bg-secondary text-secondary-foreground border-secondary-border"
      : "bg-muted text-muted-foreground border-muted-border";
