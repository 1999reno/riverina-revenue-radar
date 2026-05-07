import { CopyButton } from "./CopyButton";

const PLAYBOOK_TEXT = `Telios Pest Management — Riverina Commercial Playbook

TARGET SEGMENTS (in priority order)
1. Wineries / breweries / distilleries — Griffith, Yenda, Leeton, Wagga
2. Meat processing & poultry — Wagga (Bomen), Hanwood, Jerilderie
3. Rice & grain processing — Leeton, Jerilderie, Wagga
4. Dairy processing — Wagga, Albury / Corowa
5. Citrus & fresh-produce packing sheds — Leeton, Hanwood
6. Cold storage & refrigerated logistics — Wagga, Griffith
7. Animal feed mills, grain receival sites

VALUE PROPOSITION
Telios is the regional Riverina pest management partner that understands export
licences, FSANZ Standard 4.2.x, HACCP, GFSI/SQF/BRC, AQIS/DAFF and supermarket
audits. We deliver documented IPM programs that pass third-party inspections
on the first walk-through.

OFFER LADDER
Step 1 — Free 15-minute on-site pest-risk audit (the wedge offer).
Step 2 — One-page Pest-Risk Summary report, suitable for HACCP file.
Step 3 — Quarterly pest review & service contract.
Step 4 — Annual export-grade IPM program with documentation, training and
         24-hour callout SLA.

OBJECTIONS & RESPONSES
"We already have a pest contractor."
  → "Most do. We're not asking you to switch. The audit is free and gives you
     a second opinion you can drop in your QA file before the next external
     audit. If it's clean, we leave you alone."

"We don't have budget right now."
  → "The audit doesn't cost anything. If we find issues, you decide whether
     to address them with us, with your existing contractor, or in-house."

"Send me information."
  → "Happy to. Quickest way: 15 minutes on site so the report is specific to
     your building, not generic. What day next week works?"

"Our QA team handles this internally."
  → "Many do — and we work alongside QA, not over the top. Most of our clients
     use us as the documented external evidence the auditor wants to see."

WEEKLY ACTIVITY TARGETS (per rep)
- 20 cold emails sent
- 15 phone calls dialled
- 10 LinkedIn connection requests
- 3 on-site audits booked
- 1 quarterly review proposal sent

QUALITY BAR
- Every outreach is plain text, under 120 words
- No urgency language, no fake personalisation
- Every audit produces a written summary inside 48 hours
- Every account file includes: site name, ABN, primary contact, audit date, outcome
`;

export const PlaybookView = () => {
  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Sales motion
        </div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
          Telios commercial playbook
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          A short playbook for the Riverina pursuit. Read it once. Print page two if you want a desk copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-7 rounded-lg border border-card-border bg-card p-6">
          <h2 className="text-sm font-semibold tracking-tight mb-4">Target segments</h2>
          <ol className="space-y-2.5 mb-7">
            {[
              ["Wineries / breweries / distilleries", "Griffith · Yenda · Leeton · Wagga"],
              ["Meat processing & poultry", "Wagga (Bomen) · Hanwood · Jerilderie"],
              ["Rice & grain processing", "Leeton · Jerilderie · Wagga"],
              ["Dairy processing", "Wagga · Albury / Corowa"],
              ["Citrus & fresh-produce packing", "Leeton · Hanwood"],
              ["Cold storage & refrigerated logistics", "Wagga · Griffith"],
              ["Animal feed mills, grain receival sites", "Network sites"],
            ].map(([label, sub], i) => (
              <li key={label} className="flex gap-3">
                <span className="font-mono text-xs text-muted-foreground mt-0.5 w-5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-[11px] text-muted-foreground">{sub}</div>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="text-sm font-semibold tracking-tight mb-3">Value proposition</h2>
          <p className="text-sm text-foreground/85 leading-relaxed mb-7">
            Telios is the regional Riverina pest management partner that understands export
            licences, FSANZ Standard 4.2.x, HACCP, GFSI / SQF / BRC, AQIS / DAFF and supermarket
            audits. We deliver documented IPM programs that pass third-party inspections on the
            first walk-through.
          </p>

          <h2 className="text-sm font-semibold tracking-tight mb-3">Offer ladder</h2>
          <ol className="space-y-3 mb-2">
            {[
              ["Step 1", "Free 15-minute on-site pest-risk audit", "The wedge offer. No callbacks unless they ask."],
              ["Step 2", "One-page Pest-Risk Summary report", "Written within 48 hours, suitable for the HACCP file."],
              ["Step 3", "Quarterly pest review & service contract", "Recurring revenue, documented inspection cadence."],
              ["Step 4", "Annual export-grade IPM program", "Full documentation, on-site training, 24-hour callout SLA."],
            ].map(([step, t, sub]) => (
              <li
                key={step}
                className="rounded-md border border-border bg-muted/20 px-4 py-3 grid grid-cols-12 gap-3 items-start"
              >
                <div className="col-span-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  {step}
                </div>
                <div className="col-span-10">
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-card-border bg-card p-6">
            <h2 className="text-sm font-semibold tracking-tight mb-4">Objections & responses</h2>
            <dl className="space-y-4 text-sm">
              {[
                [
                  '"We already have a pest contractor."',
                  "Most do. We're not asking you to switch. The audit is free and gives you a second opinion you can drop in your QA file before the next external audit. If it's clean, we leave you alone.",
                ],
                [
                  '"We don\'t have budget right now."',
                  "The audit doesn't cost anything. If we find issues, you decide whether to address them with us, with your existing contractor, or in-house.",
                ],
                [
                  '"Send me information."',
                  "Happy to. Quickest way: 15 minutes on site so the report is specific to your building, not generic. What day next week works?",
                ],
                [
                  '"Our QA team handles this internally."',
                  "Many do — and we work alongside QA, not over the top. Most of our clients use us as the documented external evidence the auditor wants to see.",
                ],
              ].map(([q, a], i) => (
                <div key={i} data-testid={`objection-${i}`}>
                  <dt className="text-foreground font-medium">{q}</dt>
                  <dd className="text-muted-foreground mt-1 leading-relaxed">→ {a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-6">
            <h2 className="text-sm font-semibold tracking-tight mb-4">Weekly activity targets</h2>
            <ul className="space-y-2 text-sm">
              {[
                ["20", "cold emails sent"],
                ["15", "phone calls dialled"],
                ["10", "LinkedIn connection requests"],
                ["3", "on-site audits booked"],
                ["1", "quarterly review proposal sent"],
              ].map(([v, l]) => (
                <li key={l} className="flex items-baseline gap-2">
                  <span className="font-mono text-base font-semibold tabular-nums w-8 text-right">
                    {v}
                  </span>
                  <span className="text-muted-foreground">{l}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-6">
            <h2 className="text-sm font-semibold tracking-tight mb-3">Quality bar</h2>
            <ul className="space-y-2 text-sm text-foreground/85">
              {[
                "Every outreach is plain text, under 120 words.",
                "No urgency language, no fake personalisation.",
                "Every audit produces a written summary inside 48 hours.",
                "Every account file logs: site, ABN, primary contact, audit date, outcome.",
              ].map((l) => (
                <li key={l} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 rounded-full bg-foreground/40 flex-shrink-0" />
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-6">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
              Export the playbook
            </h3>
            <CopyButton
              value={PLAYBOOK_TEXT}
              testId="button-copy-playbook"
              label="Copy full playbook"
            />
          </div>
        </section>
      </div>
    </div>
  );
};
