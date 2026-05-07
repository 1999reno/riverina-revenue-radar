import { useMemo } from "react";
import { formatAUD, TIER_PRICING, CATEGORY_PRICING, type Prospect } from "@/lib/prospects";
import { TrendingUp, Building2, Target, Sparkles, ArrowRight } from "lucide-react";

type Props = {
  prospects: Prospect[];
  onOpenProspect: (p: Prospect) => void;
  onGoToProspects: () => void;
};

export const Dashboard = ({ prospects, onOpenProspect, onGoToProspects }: Props) => {
  const stats = useMemo(() => {
    const total = prospects.length || 1;
    const tier1 = prospects.filter((p) => p.tier === 1).length;
    const tier2 = prospects.filter((p) => p.tier === 2).length;
    const tier3 = prospects.filter((p) => p.tier === 3).length;
    const avgScore =
      Math.round(prospects.reduce((s, p) => s + p.leadScore, 0) / total);
    // First-month pipeline = sum of estMonthlyValue for Tier 1 + 50% of Tier 2 (a realistic
    // first-month booking assumption — top prospects converting first).
    const tier1Value = prospects.filter((p) => p.tier === 1).reduce((s, p) => s + p.estMonthlyValue, 0);
    const tier2Value = prospects.filter((p) => p.tier === 2).reduce((s, p) => s + p.estMonthlyValue, 0);
    const firstMonth = tier1Value + 0.5 * tier2Value;

    const byCategory = prospects.reduce<Record<string, number>>((acc, p) => {
      acc[p.categoryGroup] = (acc[p.categoryGroup] ?? 0) + 1;
      return acc;
    }, {});
    const categoryMix = Object.entries(byCategory)
      .map(([name, count]) => ({ name, count, pct: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);

    return { total, tier1, tier2, tier3, avgScore, firstMonth, tier1Value, tier2Value, categoryMix };
  }, [prospects]);

  const top5 = useMemo(
    () => [...prospects].sort((a, b) => b.leadScore - a.leadScore).slice(0, 5),
    [prospects]
  );

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Riverina · Commercial accounts
          </div>
          <h1 className="text-xl lg:text-[28px] font-bold tracking-tight leading-tight max-w-2xl">
            Where Telios should spend the next ninety days.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {stats.total} large food-grade and export-licensed sites identified across the Riverina —
            ranked by facility scale, compliance exposure, audit cadence, and decision-maker reach.
          </p>
        </div>
      </div>

      {/* Asymmetric KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 mb-8">
        <Kpi
          className="lg:col-span-4 lg:row-span-2"
          label="Total qualified prospects"
          value={stats.total.toString()}
          sub={`${stats.tier1} Tier 1 · ${stats.tier2} Tier 2 · ${stats.tier3} Tier 3`}
          accent
          testId="kpi-total"
          icon={<Building2 className="h-4 w-4" />}
        >
          <div className="mt-5 space-y-2.5">
            {[
              { label: "Tier 1 — top priority", val: stats.tier1, total: stats.total, tone: "amber" as const },
              { label: "Tier 2 — active", val: stats.tier2, total: stats.total, tone: "primary" as const },
              { label: "Tier 3 — nurture", val: stats.tier3, total: stats.total, tone: "muted" as const },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-primary-foreground/75">{row.label}</span>
                  <span className="font-mono text-primary-foreground/90">{row.val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-primary-foreground/15 overflow-hidden">
                  <div
                    style={{ width: `${(row.val / row.total) * 100}%` }}
                    className={
                      row.tone === "amber"
                        ? "h-full bg-[hsl(36_78%_60%)]"
                        : row.tone === "primary"
                          ? "h-full bg-primary-foreground/80"
                          : "h-full bg-primary-foreground/40"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Kpi>

        <Kpi
          className="lg:col-span-4"
          label="Tier 1 priority accounts"
          value={stats.tier1.toString()}
          sub="Score ≥ 88 — pursue first"
          testId="kpi-tier1"
          icon={<Target className="h-4 w-4" />}
        />

        <Kpi
          className="lg:col-span-4"
          label="Average lead score"
          value={stats.avgScore.toString()}
          sub="Across all qualified targets"
          testId="kpi-avg-score"
          icon={<Sparkles className="h-4 w-4" />}
        />

        <Kpi
          className="lg:col-span-4"
          label="Indicative first-month pipeline"
          value={formatAUD(stats.firstMonth)}
          sub="Tier 1 contracts + 50% of Tier 2 · monthly recurring"
          testId="kpi-pipeline"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <Kpi
          className="lg:col-span-4"
          label="Largest segment"
          value={stats.categoryMix[0]?.name ?? "—"}
          sub={`${stats.categoryMix[0]?.count ?? 0} sites · ${Math.round(stats.categoryMix[0]?.pct ?? 0)}% of book`}
          testId="kpi-top-segment"
        />
      </div>

      {/* Two-up panel: category mix + top accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <section className="lg:col-span-5 rounded-lg border border-card-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">Category mix</h2>
            <span className="text-[11px] text-muted-foreground">% of qualified prospects</span>
          </div>
          <div className="space-y-3">
            {stats.categoryMix.map((c, i) => (
              <div key={c.name} data-testid={`row-category-${i}`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {c.count} · {Math.round(c.pct)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    style={{
                      width: `${c.pct}%`,
                      background: `hsl(var(--chart-${(i % 5) + 1}))`,
                    }}
                    className="h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-7 rounded-lg border border-card-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">Top 5 by lead score</h2>
            <button
              type="button"
              onClick={onGoToProspects}
              data-testid="button-view-all-prospects"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {top5.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => onOpenProspect(p)}
                data-testid={`row-top-${p.id}`}
                className="w-full grid grid-cols-12 gap-3 items-center py-3 text-left hover-elevate rounded-md px-2 -mx-2"
              >
                <div className="col-span-7 lg:col-span-6 min-w-0">
                  <div className="text-sm font-medium truncate">{p.companyName}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {p.category} · {p.town}
                  </div>
                </div>
                <div className="col-span-3 lg:col-span-3 hidden md:block">
                  <div className="text-[11px] text-muted-foreground mb-1">
                    {formatAUD(p.estMonthlyValue)}/mo
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      style={{ width: `${p.leadScore}%` }}
                      className="h-full bg-[hsl(var(--chart-2))]"
                    />
                  </div>
                </div>
                <div className="col-span-5 md:col-span-2 lg:col-span-3 flex items-center justify-end gap-2">
                  <span className="font-mono text-base font-semibold">{p.leadScore}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    score
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-3 rounded-lg border border-card-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">How the monthly value is estimated</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
              These are lead-prioritisation estimates, not fixed quotes. The model starts with a service package by lead tier, then adjusts for industry complexity such as food-safety risk, audit load, pest pressure and service scope.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="font-mono text-foreground text-sm" data-testid="text-pipeline-formula">
              {formatAUD(stats.tier1Value)} + 50% × {formatAUD(stats.tier2Value)} = {formatAUD(stats.firstMonth)}
            </div>
            <div>First-month pipeline assumption</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
              Base service packages
            </div>
            <div className="space-y-2">
              {([1, 2, 3] as const).map((tier) => (
                <div key={tier} className="rounded-md border border-border p-3" data-testid={`pricing-tier-${tier}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{TIER_PRICING[tier].name}</div>
                    <div className="font-mono text-sm">{formatAUD(TIER_PRICING[tier].baseMonthly)}/mo</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {TIER_PRICING[tier].services.slice(0, 2).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
              Industry complexity factors
            </div>
            <div className="space-y-2">
              {Object.entries(CATEGORY_PRICING).map(([name, item]) => (
                <div key={name} className="rounded-md border border-border p-3" data-testid={`pricing-category-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{name}</div>
                    <div className="font-mono text-sm">{item.multiplier.toFixed(2)}×</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Kpi = ({
  label,
  value,
  sub,
  className = "",
  accent = false,
  testId,
  icon,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
  accent?: boolean;
  testId?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div
    data-testid={testId}
    className={`rounded-lg border p-5 ${className} ${
      accent
        ? "bg-primary text-primary-foreground border-primary-border bg-grain"
        : "bg-card border-card-border"
    }`}
  >
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] mb-3 opacity-80">
      {icon}
      {label}
    </div>
    <div className="text-2xl lg:text-[32px] font-bold tracking-tight leading-none">
      {value}
    </div>
    {sub && (
      <div className={`text-xs mt-2 ${accent ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
        {sub}
      </div>
    )}
    {children}
  </div>
);
