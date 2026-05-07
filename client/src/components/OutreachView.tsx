import { useEffect, useMemo, useState } from "react";
import { type Prospect } from "@/lib/prospects";
import { generateOutreach } from "@/lib/outreach";
import {
  fetchOutreachScript,
  saveOutreachScript,
  type OutreachScriptOverride,
} from "@/lib/radarApi";
import { CopyButton } from "./CopyButton";
import { Mail, Phone, Linkedin } from "lucide-react";

type Props = {
  prospects: Prospect[];
  initialProspectId?: string | null;
  onPickFromList?: () => void;
};

type SaveStatus = "idle" | "saving" | "saved" | "session-only";

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

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phoneOpener, setPhoneOpener] = useState("");
  const [linkedInNote, setLinkedInNote] = useState("");

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [overrideAvailable, setOverrideAvailable] = useState(false);

  // Reset to generated draft when kit changes; then attempt to load saved override.
  useEffect(() => {
    if (!kit) return;
    setEmailSubject(kit.email.subject);
    setEmailBody(kit.email.body);
    setPhoneOpener(kit.phoneOpener);
    setLinkedInNote(kit.linkedInNote);
    setSaveStatus("idle");
    setSaveMessage("");
    setOverrideAvailable(false);
  }, [kit]);

  useEffect(() => {
    if (!prospect || !buyerTitle) return;
    let cancelled = false;
    fetchOutreachScript(prospect.id, buyerTitle).then((result) => {
      if (cancelled) return;
      if (result.status !== "available") return;
      setOverrideAvailable(true);
      if (result.override) {
        setEmailSubject(result.override.emailSubject);
        setEmailBody(result.override.emailBody);
        setPhoneOpener(result.override.phoneOpener);
        setLinkedInNote(result.override.linkedInNote);
        setSaveStatus("saved");
        setSaveMessage(
          `Loaded the saved script for ${prospect.companyName} — ${buyerTitle}.`,
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [prospect?.id, buyerTitle]); // eslint-disable-line

  const resetEdits = () => {
    if (!kit) return;
    setEmailSubject(kit.email.subject);
    setEmailBody(kit.email.body);
    setPhoneOpener(kit.phoneOpener);
    setLinkedInNote(kit.linkedInNote);
    setSaveStatus("idle");
    setSaveMessage("");
  };

  const handleSave = async () => {
    if (!prospect) return;
    setSaveStatus("saving");
    setSaveMessage("Saving script edits…");
    const override: OutreachScriptOverride = {
      prospectId: prospect.id,
      buyerTitle,
      emailSubject,
      emailBody,
      phoneOpener,
      linkedInNote,
    };
    try {
      const result = await saveOutreachScript(override);
      if (result.status === "saved") {
        setSaveStatus("saved");
        setSaveMessage(
          `Saved to the Emergent database — these edits will load again next time you open ${prospect.companyName} for ${buyerTitle}.`,
        );
        setOverrideAvailable(true);
      } else {
        setSaveStatus("session-only");
        setSaveMessage(
          `Could not reach the database. Edits are kept for this session only — copy them now or they will reset on refresh.`,
        );
      }
    } catch {
      setSaveStatus("session-only");
      setSaveMessage(
        `Could not reach the database. Edits are kept for this session only — copy them now or they will reset on refresh.`,
      );
    }
  };

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
          Pick a prospect and a buyer title. Tweak any line below before you copy — the copy
          button always grabs your edited version, not the original draft.
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

          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            data-testid="button-save-outreach"
            className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover-elevate disabled:opacity-60"
          >
            {saveStatus === "saving" ? "Saving…" : "Save script edits"}
          </button>

          <button
            type="button"
            onClick={resetEdits}
            data-testid="button-reset-outreach"
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-xs font-medium hover-elevate"
          >
            Reset to generated draft
          </button>

          {saveStatus !== "idle" && saveMessage && (
            <div
              data-testid={
                saveStatus === "saved"
                  ? "status-outreach-saved"
                  : saveStatus === "saving"
                    ? "status-outreach-saving"
                    : "status-outreach-session-only"
              }
              data-save-status={saveStatus}
              className={`mt-3 rounded-md border px-3 py-2.5 text-xs leading-relaxed ${
                saveStatus === "saved"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : saveStatus === "saving"
                    ? "border-border bg-muted/40"
                    : "border-amber-500/40 bg-amber-500/10"
              }`}
            >
              <strong className="font-semibold">
                {saveStatus === "saved"
                  ? "Saved to database."
                  : saveStatus === "saving"
                    ? "Saving…"
                    : "Saved for this session only."}
              </strong>{" "}
              {saveMessage}
            </div>
          )}

          <div className="mt-5 rounded-md bg-muted/40 border border-border px-3.5 py-3 text-xs leading-relaxed">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
              Why this account
            </div>
            <p className="text-foreground/85">{prospect.whyGoodFit.split(".")[0]}.</p>
          </div>

          {!overrideAvailable && (
            <div
              data-testid="notice-outreach-editable"
              className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3.5 py-3 text-xs leading-relaxed text-foreground"
            >
              <strong className="font-semibold">Edits stay in this session.</strong>{" "}
              Tweak the subject, body, phone script, or LinkedIn note in the boxes on the right —
              then hit Copy or Save script edits. Without the database connected yet, refreshing
              the page will reset edits to the generated draft.
            </div>
          )}
        </div>

        {/* Output — editable */}
        <div className="lg:col-span-8 space-y-4">
          <section
            className="rounded-lg border border-card-border bg-card overflow-hidden"
            data-testid="output-email"
          >
            <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center h-7 w-7 rounded-md bg-background border border-border text-foreground/80">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Cold email</div>
                  <div className="text-[11px] text-muted-foreground">
                    Edit the subject and body, then copy.
                  </div>
                </div>
              </div>
              <CopyButton
                value={`Subject: ${emailSubject}\n\n${emailBody}`}
                testId="output-email-copy"
                label="Copy"
              />
            </header>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label
                  htmlFor="outreach-email-subject"
                  className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5"
                >
                  Subject
                </label>
                <input
                  id="outreach-email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  data-testid="input-email-subject"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="outreach-email-body"
                  className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5"
                >
                  Body
                </label>
                <textarea
                  id="outreach-email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  data-testid="textarea-email-body"
                  className="w-full min-h-[220px] px-3 py-2 rounded-md border border-input bg-background text-sm leading-relaxed font-sans"
                />
              </div>
            </div>
          </section>

          <section
            className="rounded-lg border border-card-border bg-card overflow-hidden"
            data-testid="output-phone"
          >
            <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center h-7 w-7 rounded-md bg-background border border-border text-foreground/80">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Phone opener</div>
                  <div className="text-[11px] text-muted-foreground">
                    Read in 12–15 seconds. Edit it to sound like you.
                  </div>
                </div>
              </div>
              <CopyButton
                value={phoneOpener}
                testId="output-phone-copy"
                label="Copy"
              />
            </header>
            <div className="px-5 py-4">
              <textarea
                value={phoneOpener}
                onChange={(e) => setPhoneOpener(e.target.value)}
                data-testid="textarea-phone-opener"
                className="w-full min-h-[140px] px-3 py-2 rounded-md border border-input bg-background text-sm leading-relaxed font-sans"
              />
            </div>
          </section>

          <section
            className="rounded-lg border border-card-border bg-card overflow-hidden"
            data-testid="output-linkedin"
          >
            <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center h-7 w-7 rounded-md bg-background border border-border text-foreground/80">
                  <Linkedin className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">LinkedIn connection note</div>
                  <div className="text-[11px] text-muted-foreground">
                    Under 300 characters · attach to the request, no pitch in DM #1.
                  </div>
                </div>
              </div>
              <CopyButton
                value={linkedInNote}
                testId="output-linkedin-copy"
                label="Copy"
              />
            </header>
            <div className="px-5 py-4">
              <textarea
                value={linkedInNote}
                onChange={(e) => setLinkedInNote(e.target.value)}
                maxLength={300}
                data-testid="textarea-linkedin-note"
                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm leading-relaxed font-sans"
              />
              <div className="mt-1.5 text-[11px] text-muted-foreground text-right">
                {linkedInNote.length}/300
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
