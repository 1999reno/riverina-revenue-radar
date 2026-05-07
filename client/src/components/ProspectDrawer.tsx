import { useEffect } from "react";
import { X, ExternalLink, Send, ListChecks } from "lucide-react";
import type { Prospect } from "@/lib/prospects";
import { formatAUD, pricingBreakdownFor } from "@/lib/prospects";
import { SCORE_WEIGHTS, tierColor, tierLabel } from "@/lib/scoring";

type Props = {
  prospect: Prospect | null;
  onClose: () => void;
  onStartOutreach: (p: Prospect) => void;
  onStartFollowup: (p: Prospect) => void;
};

export const ProspectDrawer = ({
  prospect,
  onClose,
  onStartOutreach,
  onStartFollowup,
}: Props) => {
  useEffect(() => {
    if (!prospect) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prospect, onClose]);

  if (!prospect) return null;
  const p = prospect;
  const pricing = pricingBreakdownFor(p);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={`${p.companyName} detail`}
      data-testid="drawer-prospect"
    >
      <button
        type="button"
        aria-label="Close drawer"
        data-testid="button-close-drawer-overlay"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-[1px]"
      />
      <aside className="w-full sm:w-[560px] lg:w-[640px] max-w-full bg-background border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${tierColor(
                  p.tier
                )}`}
              >
                {tierLabel(p.tier)}
              </span>
              <span className="text-[11px] text-muted-foreground">{p.town}</span>
            </div>
            <h2
              className="text-lg lg:text-xl font-bold tracking-tight truncate"
              data-testid="text-prospect-name"
            >
              {p.companyName}
            </h2>
            <div className="text-xs text-muted-foreground mt-1">{p.category}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="button-close-drawer"
            className="h-9 w-9 grid place-items-center rounded-md border border-border hover-elevate"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-7">
          {/* Top metrics */}
          <div className="grid grid-cols-3 gap-3">
            <Metric
              label="Lead score"
              value={p.leadScore.toString()}
              testId="metric-score"
              accent
            />
            <Metric
              label="Est. monthly"
              value={formatAUD(p.estMonthlyValue)}
              testId="metric-value"
            />
            <Metric label="Tier" value={`Tier ${p.tier}`} testId="metric-tier" />
          </div>

          {/* Why good fit */}
          <Section title="Why this is a good fit">
            <p
              className="text-sm leading-relaxed text-foreground/90"
              data-testid="text-why-good-fit"
            >
              {p.whyGoodFit}
            </p>
          </Section>

          {/* Suggested buyers */}
          <Section title="Suggested buyer titles">
            <ul className="space-y-1.5">
              {p.buyerTitles.map((t, i) => (
                <li
                  key={i}
                  data-testid={`item-buyer-${i}`}
                  className="text-sm flex items-start gap-2"
                >
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/40 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          {/* First outreach angle */}
          <Section title="First outreach angle">
            <div className="rounded-md border-l-2 border-[hsl(var(--chart-2))] bg-muted/40 px-4 py-3">
              <p
                className="text-sm leading-relaxed text-foreground/90 italic"
                data-testid="text-outreach-angle"
              >
                {p.outreachAngle}
              </p>
            </div>
          </Section>

          {/* Lead score breakdown */}
          <Section title="How the score is composed">
            <div className="space-y-3">
              {SCORE_WEIGHTS.map((w) => (
                <div key={w.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{w.label}</span>
                    <span className="font-mono text-muted-foreground">
                      {Math.round(w.weight * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                    <div
                      style={{ width: `${w.weight * 100}%` }}
                      className="h-full bg-[hsl(var(--chart-1))]"
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    {w.description}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Estimated monthly price breakdown">
            <div className="rounded-lg border border-border bg-muted/25 p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Metric
                  label="Base package"
                  value={formatAUD(pricing.baseMonthly)}
                  testId="metric-pricing-base"
                />
                <Metric
                  label="Industry factor"
                  value={`${pricing.categoryMultiplier.toFixed(2)}×`}
                  testId="metric-pricing-factor"
                />
                <Metric
                  label="Monthly estimate"
                  value={formatAUD(pricing.finalMonthly)}
                  testId="metric-pricing-final"
                  accent
                />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
                  Formula
                </div>
                <p className="text-sm font-medium" data-testid="text-pricing-formula">
                  {pricing.formula}
                </p>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
                  Why this factor applies
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {pricing.categoryReason}
                </p>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
                  Services assumed in the estimate
                </div>
                <ul className="space-y-1.5">
                  {pricing.includedServices.map((service, i) => (
                    <li key={`${service}-${i}`} className="text-sm flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/40 flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  This is an indicative monthly recurring service estimate for lead prioritisation, not a fixed quote. Final pricing should be confirmed after the site walk, device count, chemical restrictions, service frequency, travel, access requirements and audit scope are known.
                </p>
              </div>
            </div>
          </Section>

          {/* Source links */}
          <Section title="Sources">
            <div className="grid grid-cols-1 gap-2">
              {p.websiteUrl && (
                <a
                  href={p.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="link-website"
                  className="group flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm hover-elevate"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Company website
                    </span>
                    <span className="block truncate">{p.websiteUrl}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-2" />
                </a>
              )}
              {p.publicSourceUrl && (
                <a
                  href={p.publicSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="link-public-source"
                  className="group flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm hover-elevate"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Public source
                    </span>
                    <span className="block truncate">{p.publicSourceUrl}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-2" />
                </a>
              )}
            </div>
          </Section>

          {/* Next actions */}
          <Section title="Next action">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStartOutreach(p)}
                data-testid="button-start-outreach"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground border border-primary-border px-4 py-2.5 text-sm font-medium hover-elevate"
              >
                <Send className="h-4 w-4" /> Generate outreach
              </button>
              <button
                type="button"
                onClick={() => onStartFollowup(p)}
                data-testid="button-start-followup"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover-elevate"
              >
                <ListChecks className="h-4 w-4" /> Start follow-up cadence
              </button>
            </div>
          </Section>
        </div>
      </aside>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
      {title}
    </h3>
    {children}
  </section>
);

const Metric = ({
  label,
  value,
  accent = false,
  testId,
}: {
  label: string;
  value: string;
  accent?: boolean;
  testId?: string;
}) => (
  <div
    data-testid={testId}
    className={`rounded-md border p-3 ${
      accent ? "border-primary/40 bg-primary/8" : "border-border bg-card"
    }`}
  >
    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
      {label}
    </div>
    <div className="text-base lg:text-lg font-bold tabular-nums">{value}</div>
  </div>
);
