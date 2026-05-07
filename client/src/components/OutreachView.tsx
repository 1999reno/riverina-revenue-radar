import { useMemo, useState, useEffect } from "react";
import { type Prospect } from "@/lib/prospects";
import { generateOutreach } from "@/lib/outreach";
import { CopyButton } from "./CopyButton";
import { Mail, Phone, Linkedin } from "lucide-react";

type Props = {
  prospects: Prospect[];
  initialProspectId?: string | null;
  onPickFromList?: () => void;
};

export const OutreachView = ({ prospects, initialProspectId }: Props) => {
  const [prospectId, setProspectId] = useState<string>(
    initialProspectId ?? prospects[0]?.id ?? ""
  );
  useEffect(() => {
    if (initialProspectId) setProspectId(initialProspectId);
  }, [initialProspectId]);

  useEffect(() => {
    if (!prospects.length) return;
    if (!prospects.some((p) => p.id === prospectId)) {
      setProspectId(prospects[0].id);
    }
  }, [prospects, prospectId]);

  const sortedProspects = useMemo(
    () => [...prospects].sort((a, b) => b.leadScore - a.leadScore),
    [prospects]
  );

  const prospect = useMemo(
    () => prospects.find((p) => p.id === prospectId) ?? prospects[0],
    [prospects, prospectId]
  );

  const [buyerTitle, setBuyerTitle] = useState<string>(prospect?.buyerTitles[0] ?? "Operations Manager");
  useEffect(() => {
    setBuyerTitle(prospect?.buyerTitles[0] ?? "Operations Manager");
  }, [prospect?.id]); // eslint-disable-line

  const kit = useMemo(
    () => (prospect ? generateOutreach(prospect, buyerTitle) : null),
    [prospect, buyerTitle]
  );

  if (!prospect || !kit) {
    return (
      <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
        <p className="text-sm text-muted-foreground">
          Add a prospect on the Prospects tab to generate outreach.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Outreach generator
        </div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
          Email · phone opener · LinkedIn note
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Pick a prospect and a buyer title. Output is plain text, short, and free of spammy
          language — paste straight into your CRM or inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Picker */}
        <div className="lg:col-span-4 rounded-lg border border-card-border bg-card p-5 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-sm font-semibold mb-4">Setup</h2>

          <label className="block text-xs text-muted-foreground mb-1.5">Prospect</label>
          <select
            value={prospectId}
            onChange={(e) => setProspectId(e.target.value)}
            data-testid="select-prospect"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            {sortedProspects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.companyName} — {p.town}
              </option>
            ))}
          </select>

          <label className="block text-xs text-muted-foreground mt-4 mb-1.5">
            Buyer title
          </label>
          <select
            value={buyerTitle}
            onChange={(e) => setBuyerTitle(e.target.value)}
            data-testid="select-buyer-title"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            {prospect.buyerTitles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="mt-5 rounded-md bg-muted/40 border border-border px-3.5 py-3 text-xs leading-relaxed">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              Why this account
            </div>
            <p className="text-foreground/85">{prospect.whyGoodFit.split(".")[0]}.</p>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-8 space-y-4">
          <OutputCard
            icon={<Mail className="h-4 w-4" />}
            title="Cold email"
            subtitle={`Subject: ${kit.email.subject}`}
            body={kit.email.body}
            testId="output-email"
            copyValue={`Subject: ${kit.email.subject}\n\n${kit.email.body}`}
          />
          <OutputCard
            icon={<Phone className="h-4 w-4" />}
            title="Phone opener"
            subtitle="Read in 12–15 seconds. Stop. Wait for them to say a name."
            body={kit.phoneOpener}
            testId="output-phone"
            copyValue={kit.phoneOpener}
          />
          <OutputCard
            icon={<Linkedin className="h-4 w-4" />}
            title="LinkedIn connection note"
            subtitle="Under 300 characters · attach to the request, no pitch in DM #1."
            body={kit.linkedInNote}
            testId="output-linkedin"
            copyValue={kit.linkedInNote}
          />
        </div>
      </div>
    </div>
  );
};

const OutputCard = ({
  icon,
  title,
  subtitle,
  body,
  testId,
  copyValue,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  body: string;
  testId: string;
  copyValue: string;
}) => (
  <section
    className="rounded-lg border border-card-border bg-card overflow-hidden"
    data-testid={testId}
  >
    <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center h-7 w-7 rounded-md bg-background border border-border text-foreground/80">
          {icon}
        </span>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <CopyButton
        value={copyValue}
        testId={`${testId}-copy`}
        label="Copy"
      />
    </header>
    <pre className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
      {body}
    </pre>
  </section>
);
