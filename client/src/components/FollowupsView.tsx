import { useMemo, useState, useEffect } from "react";
import { type Prospect } from "@/lib/prospects";
import { Check, Mail, Phone, Linkedin, ClipboardCheck, FileText } from "lucide-react";

export const FOLLOWUP_STAGES = [
  {
    id: "day1-email",
    day: 1,
    label: "Day 1 — Cold email",
    description: "Send the personalised email with the free 15-min audit offer. Plain text, no tracking links.",
    icon: Mail,
  },
  {
    id: "day2-call",
    day: 2,
    label: "Day 2 — Phone follow-up",
    description: "Call the site reception or named buyer between 9:30–11:00. Use the phone opener verbatim.",
    icon: Phone,
  },
  {
    id: "day5-linkedin",
    day: 5,
    label: "Day 5 — LinkedIn connect",
    description: "Send the connection request with the short note. Do NOT pitch in the first DM.",
    icon: Linkedin,
  },
  {
    id: "day10-audit",
    day: 10,
    label: "Day 10 — Compliance audit offer",
    description: "Resend the free 15-minute pest-risk audit, attach the one-page audit-offer template.",
    icon: ClipboardCheck,
  },
  {
    id: "day21-quarterly",
    day: 21,
    label: "Day 21 — Quarterly pest review proposal",
    description: "Send a one-page quarterly pest review proposal with your service tiers and indicative pricing.",
    icon: FileText,
  },
] as const;

type StageId = (typeof FOLLOWUP_STAGES)[number]["id"];
type Progress = Record<string, Record<StageId, boolean>>;

type Props = {
  prospects: Prospect[];
  initialProspectId?: string | null;
};

export const FollowupsView = ({ prospects, initialProspectId }: Props) => {
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

  const [progress, setProgress] = useState<Progress>({});
  const stages = progress[prospectId] ?? ({} as Record<StageId, boolean>);

  const toggle = (stageId: StageId) => {
    setProgress((prev) => ({
      ...prev,
      [prospectId]: {
        ...(prev[prospectId] ?? ({} as Record<StageId, boolean>)),
        [stageId]: !(prev[prospectId]?.[stageId] ?? false),
      },
    }));
  };

  const completed = FOLLOWUP_STAGES.filter((s) => stages[s.id]).length;
  const pct = (completed / FOLLOWUP_STAGES.length) * 100;

  const accountStats = useMemo(() => {
    let started = 0;
    let done = 0;
    Object.values(progress).forEach((stages) => {
      const c = Object.values(stages).filter(Boolean).length;
      if (c > 0) started++;
      if (c === FOLLOWUP_STAGES.length) done++;
    });
    return { started, done };
  }, [progress]);

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Follow-up cadence
        </div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">21-day workflow</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          A simple staged checklist Telios reps can run per account. Mark stages complete as you go —
          progress is held in this session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-4 space-y-3">
          <div className="rounded-lg border border-card-border bg-card p-5">
            <label className="block text-xs text-muted-foreground mb-1.5">
              Account
            </label>
            <select
              value={prospectId}
              onChange={(e) => setProspectId(e.target.value)}
              data-testid="select-followup-prospect"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {sortedProspects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.companyName} — {p.town}
                </option>
              ))}
            </select>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Stage progress</span>
                <span className="font-mono text-foreground">
                  {completed} / {FOLLOWUP_STAGES.length}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className="h-full bg-[hsl(var(--chart-1))] transition-[width] duration-300"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5 text-sm">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
              Across all accounts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Mini
                label="Sequences started"
                value={accountStats.started.toString()}
                testId="metric-sequences-started"
              />
              <Mini
                label="Sequences completed"
                value={accountStats.done.toString()}
                testId="metric-sequences-done"
              />
            </div>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
              Weekly activity targets
            </h3>
            <ul className="space-y-2 text-sm">
              <Target value="20" label="cold emails sent" />
              <Target value="15" label="phone calls dialled" />
              <Target value="10" label="LinkedIn connection requests" />
              <Target value="3" label="on-site audits booked" />
              <Target value="1" label="quarterly review proposal sent" />
            </ul>
          </div>
        </aside>

        {/* Timeline */}
        <div className="lg:col-span-8 rounded-lg border border-card-border bg-card p-5 lg:p-7">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">{prospect?.companyName ?? "No prospect selected"}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {prospect ? `${prospect.category} · ${prospect.town}` : "Add a prospect to begin a sequence."}
              </p>
            </div>
          </div>

          <ol className="relative pl-7 space-y-2">
            <span className="absolute left-[11px] top-3 bottom-3 w-px bg-border" aria-hidden />
            {FOLLOWUP_STAGES.map((s) => {
              const Icon = s.icon;
              const done = stages[s.id] ?? false;
              return (
                <li key={s.id} className="relative">
                  <span
                    className={`absolute -left-7 top-3 grid place-items-center h-6 w-6 rounded-full border ${
                      done
                        ? "bg-[hsl(var(--chart-1))] border-[hsl(var(--chart-1))] text-primary-foreground"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    data-testid={`button-stage-${s.id}`}
                    aria-pressed={done}
                    className={`w-full text-left rounded-md border px-4 py-3 hover-elevate ${
                      done
                        ? "border-[hsl(var(--chart-1))/40] bg-[hsl(var(--chart-1))/0.08]"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{s.label}</div>
                      <span
                        className={`text-[10px] uppercase tracking-wider ${
                          done ? "text-[hsl(var(--chart-1))]" : "text-muted-foreground"
                        }`}
                      >
                        {done ? "Done" : `Day ${s.day}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {s.description}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};

const Mini = ({ label, value, testId }: { label: string; value: string; testId?: string }) => (
  <div data-testid={testId} className="rounded-md border border-border bg-background px-3 py-2">
    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-0.5">
      {label}
    </div>
    <div className="text-lg font-bold tabular-nums">{value}</div>
  </div>
);

const Target = ({ value, label }: { value: string; label: string }) => (
  <li className="flex items-baseline gap-2">
    <span className="font-mono font-semibold text-foreground tabular-nums">{value}</span>
    <span className="text-muted-foreground">{label}</span>
  </li>
);
