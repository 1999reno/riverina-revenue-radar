import type { Prospect } from "./prospects";

// Pick the cleanest version of the buyer title — first slash variant, no "/".
const primaryTitle = (title: string) => title.split(" / ")[0].trim();

export type OutreachKit = {
  email: { subject: string; body: string };
  phoneOpener: string;
  linkedInNote: string;
};

export const generateOutreach = (
  p: Prospect,
  buyerTitle: string,
): OutreachKit => {
  const role = primaryTitle(buyerTitle); // e.g. "Head of Operations"
  const roleLower = role.toLowerCase();
  const town = p.town;
  const angle = p.outreachAngle.trim();

  const subject = `${p.companyName} — 15-minute pest-risk audit for your ${town} site`;

  const email = `Hi there,

I'm with Telios Pest Management — we work with food-grade and export-licensed sites across the Riverina, and I wanted to send this directly to whoever is acting as ${roleLower} at ${p.companyName}.

${angle ? `Quick reason for the note: ${angle.charAt(0).toLowerCase() + angle.slice(1)}` : `Quick reason for the note: ${p.whyGoodFit.split(".")[0]}.`}

I'd like to offer ${p.companyName} a free 15-minute pest-risk audit at your ${town} site — walk-through, photo log, and a written summary you can drop straight into your QA file. No obligation, no callback chain.

Worth a 15-minute walk next time you're on site?

Cheers,
[Your name]
Telios Pest Management
[Phone] · [Email]`;

  const phoneOpener = `Hi, this is [Your name] from Telios Pest Management — I work with food-grade sites across the Riverina. I was reading about ${p.companyName} at ${town} and wanted to put 15 minutes of free pest-risk auditing in front of your ${roleLower}. Is that you, or is there a better person at the site to send it to?`;

  const linkedInNote = `Hi — I run accounts for Telios Pest Management across the Riverina. Working with a few sites near ${town} on documented IPM for retailer / export audits. Happy to share a free 15-minute pest-risk audit for ${p.companyName} if it's useful.`;

  return {
    email: { subject, body: email },
    phoneOpener,
    linkedInNote,
  };
};

export const auditOfferTemplate = (
  p?: Prospect,
) => `Subject: Free 15-minute on-site pest-risk audit — ${p?.companyName ?? "your site"}

Hi [Name],

I'm with Telios Pest Management. We're offering QA managers and site managers across the Riverina a free 15-minute on-site pest-risk audit — no sales pitch, no fees.

What you get in 15 minutes:
• A walk of receival, storage, and packing zones
• A photo log of any current evidence (rodent, insect, bird)
• A short written summary you can file against your HACCP / FSANZ / retailer audit documents
• A risk rating and any quick-win remediation we'd recommend

We do this because most ${p?.categoryGroup?.toLowerCase() ?? "food-grade"} sites in the region only get pest documentation looked at when an auditor is already on the floor. We'd rather find issues 90 days before that happens.

If it's useful, reply with two times this week or next that suit, and I'll come to ${p?.town ?? "site"}.

Cheers,
[Your name]
Telios Pest Management
[Phone] · [Email]`;
