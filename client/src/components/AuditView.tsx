import { useMemo, useState } from "react";
import { PROSPECTS } from "@/lib/prospects";
import { auditOfferTemplate } from "@/lib/outreach";
import { CopyButton } from "./CopyButton";

export const AuditView = () => {
  const [prospectId, setProspectId] = useState<string>("");

  const prospect = useMemo(
    () => (prospectId ? PROSPECTS.find((p) => p.id === prospectId) : undefined),
    [prospectId]
  );
  const text = useMemo(() => auditOfferTemplate(prospect), [prospect]);

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
      <div className="mb-6 max-w-2xl">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Wedge offer
        </div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
          Compliance audit offer template
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A free 15-minute on-site pest-risk audit aimed at QA managers and site managers across
          the Riverina. This is the template Telios reps can lead with — no obligation, no
          callbacks unless they ask.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-lg border border-card-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Optional: tailor to a prospect</h3>
            <select
              value={prospectId}
              onChange={(e) => setProspectId(e.target.value)}
              data-testid="select-audit-prospect"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Generic — any Riverina site</option>
              {[...PROSPECTS]
                .sort((a, b) => b.leadScore - a.leadScore)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName} — {p.town}
                  </option>
                ))}
            </select>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Selecting a prospect inserts the company name, town and segment into the offer.
            </p>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
              What's in the audit
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Walk of receival, storage, and packing zones",
                "Photo log of any current pest evidence",
                "Short written summary for HACCP / FSANZ file",
                "Risk rating + quick-win remediation",
              ].map((l) => (
                <li key={l} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 rounded-full bg-foreground/40 flex-shrink-0" />
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
              Who it's for
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground/85">
              <li>QA managers</li>
              <li>Site managers</li>
              <li>Operations / facilities managers</li>
              <li>EHS / compliance managers</li>
            </ul>
          </div>
        </aside>

        <section className="lg:col-span-8 rounded-lg border border-card-border bg-card overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
            <div>
              <div className="text-sm font-semibold">Audit offer template</div>
              <div className="text-[11px] text-muted-foreground">
                {prospect ? `Tailored to ${prospect.companyName}` : "Generic version"}
              </div>
            </div>
            <CopyButton value={text} testId="button-copy-audit" label="Copy template" />
          </header>
          <pre
            data-testid="text-audit-template"
            className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90"
          >
            {text}
          </pre>
        </section>
      </div>
    </div>
  );
};
