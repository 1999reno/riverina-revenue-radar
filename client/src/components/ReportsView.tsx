import { useMemo, useState, useEffect } from "react";
import { ClipboardCheck, Printer, RotateCcw } from "lucide-react";
import type { Prospect } from "@/lib/prospects";
import { CopyButton } from "./CopyButton";
import { Button } from "@/components/ui/button";

type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
type PestEvidence = "Rodent activity" | "Cockroach activity" | "Ant trails" | "Stored-product insects" | "Flying insects" | "Bird pressure" | "Spider activity" | "No active evidence observed";

type ChemicalProduct = {
  id: string;
  name: string;
  category: "Residual insecticide" | "Gel bait" | "Dust / wettable powder" | "Rodenticide";
  active: string;
  sdsUrl: string;
  labelUrl?: string;
  defaultUse: string;
  safetyNotes: string;
};

type ChemicalEntry = {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  apvmaNumber: string;
  targetPest: string;
  treatmentLocation: string;
  applicationMethod: string;
  rateQuantity: string;
  sdsChecked: boolean;
  labelChecked: boolean;
};

type FormState = {
  prospectId: string;
  reportType: "Initial inspection" | "Routine service" | "Corrective action review" | "Pre-audit check";
  inspectionDate: string;
  inspectorName: string;
  siteContact: string;
  areasInspected: string;
  riskLevel: RiskLevel;
  evidence: PestEvidence[];
  siteFindings: string;
  hygieneFindings: string;
  accessFindings: string;
  correctiveActions: string;
  recommendedProgram: string;
  nextService: string;
  selectedChemicalId: string;
  selectedChemicalIds: string[];
  chemicalEntries: ChemicalEntry[];
  technicianLicence: string;
  chemicalsUsed: string;
  sdsStatus: string;
  apvmaStatus: string;
  ppeControls: string;
  foodSafetyControls: string;
  storageDisposal: string;
  withholdingReentry: string;
  chemicalNotes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_EVIDENCE: PestEvidence[] = [
  "Rodent activity",
  "Cockroach activity",
  "Ant trails",
  "Stored-product insects",
  "Flying insects",
  "Bird pressure",
  "Spider activity",
  "No active evidence observed",
];

const CHEMICAL_PRODUCTS: ChemicalProduct[] = [
  {
    id: "biflex-ultra",
    name: "Biflex Ultra-Lo-Odour",
    category: "Residual insecticide",
    active: "Bifenthrin 100 g/L EC",
    sdsUrl: "https://www.assets.envu.com/-/media/prfaustralia/gss-web-downloads/biflex-ultra-lo-odour/biflex-ultra-sds-50001561_ext_sds_au_6n.ashx",
    labelUrl: "https://www.assets.envu.com/-/media/prfaustralia/gss-web-downloads/biflex-ultra-lo-odour/biflex-ultra-sds-50001561_ext_sds_au_6n.ashx",
    defaultUse: "Residual insecticide treatment where permitted by label directions, usually external perimeter, entry points, cracks, crevices and non-food-contact harbourage areas.",
    safetyNotes: "Keep away from drains, waterways, food, packaging and food-contact surfaces. Follow label/SDS PPE, ventilation and environmental controls.",
  },
  {
    id: "temprid-75",
    name: "Temprid 75 Residual Insecticide",
    category: "Residual insecticide",
    active: "Imidacloprid + beta-cyfluthrin",
    sdsUrl: "https://www.assets.envu.com/-/media/prfaustralia/product-sds-and-labels/temprid-75-residual-insecticide-sds-ghs-nz.ashx",
    defaultUse: "Residual insecticide for cockroach and general insect management where the label permits use for the target pest and surface.",
    safetyNotes: "Do not apply where spray, drift or residues may contact food, food-contact surfaces, packaging, utensils or processing equipment.",
  },
  {
    id: "advion-cockroach-gel",
    name: "Advion Cockroach Gel",
    category: "Gel bait",
    active: "Indoxacarb gel bait",
    sdsUrl: "https://www.syngentappm.com.au/sites/g/files/kgtney601/files/media/document/2024/02/16/advion_cockroach_gel_sds.pdf",
    labelUrl: "https://www.syngentappm.com.au/product/ppm/insecticide/advion-cockroach-gel",
    defaultUse: "Targeted cockroach gel bait placement in cracks, crevices and harbourage points away from wash-down and food-contact areas.",
    safetyNotes: "Place bait so it cannot contaminate food, packaging or food-contact surfaces and cannot be accessed by unauthorised persons.",
  },
  {
    id: "maxforce-gold",
    name: "Maxforce Gold Cockroach Gel",
    category: "Gel bait",
    active: "Fipronil 0.3 g/kg gel bait",
    sdsUrl: "https://rebelpest.com.au/wp-content/uploads/2023/03/Maxforce-Gold-Cockroach-Gel.pdf",
    labelUrl: "https://www.assets.envu.com/-/media/prfaustralia/product-sds-and-labels/maxforce-gold-gel-insecticide-label.ashx",
    defaultUse: "Targeted cockroach baiting in inaccessible harbourage areas and cracks/crevices where label directions permit.",
    safetyNotes: "Avoid exposed placement on food preparation benches, food-contact surfaces, packaging, utensils or areas subject to wash-down.",
  },
  {
    id: "coopex-residual",
    name: "Coopex Residual Insecticide",
    category: "Dust / wettable powder",
    active: "Permethrin 25% w/w wettable powder",
    sdsUrl: "https://www.assets.envu.com/-/media/prfaustralia/product-sds-and-labels/coopex-residual-insecticide-sds-ghs_ver2-1.ashx",
    defaultUse: "Residual insecticide treatment where a wettable powder is appropriate and label directions allow use for the pest and surface.",
    safetyNotes: "Very toxic to aquatic life. Avoid contamination of drains, waterways, food, food-contact surfaces, packaging and processing equipment.",
  },
  {
    id: "selontra-soft-bait",
    name: "Selontra Soft Bait",
    category: "Rodenticide",
    active: "Cholecalciferol rodenticide bait",
    sdsUrl: "https://download.basf.com/p1/000000000030640413_SDS_GEN_AU/en_AU/Selontra_Soft_Bait_30640413_SDS_GEN_AU_en_3-0.pdf",
    labelUrl: "https://www.agserv.com.au/products/selontra-soft-bait-rodenticide/",
    defaultUse: "Rodent baiting inside secured, tamper-resistant bait stations or protected placements according to label directions and site rules.",
    safetyNotes: "Keep bait inaccessible to children, staff, livestock, pets, wildlife and non-target species. Record bait station numbers and bait condition.",
  },
  {
    id: "talon-wax-blocks",
    name: "Talon Rat & Mouse Killer Wax Blocks",
    category: "Rodenticide",
    active: "Rodenticide wax block bait",
    sdsUrl: "https://go.lupinsys.com/duluxgroup/harms/public/materials/04ce021ad189a86fddabe30dfcaad978-published/attachments_api/f6d6efaef2d3c59222d9e233d8781596/search_api/TALON_RAT___MOUSE_KILLER_WAX_BLOCKS-NZ_SDS.pdf",
    defaultUse: "Rodent baiting in secured bait stations, focused on external perimeters, loading areas, waste areas and other label-permitted locations.",
    safetyNotes: "Use only where non-target access is controlled. Check and record bait take, dead rodents, station integrity and environmental exposure.",
  },
  {
    id: "contrac-blox",
    name: "Contrac Blox",
    category: "Rodenticide",
    active: "Bromadiolone rodenticide bait",
    sdsUrl: "https://possumpiper.com.au/pages/contrac-blox-sds",
    labelUrl: "https://www.belllabs.com/downloads/safety-data-sheets/",
    defaultUse: "Rodent baiting in secured, labelled bait stations or protected placements according to product label and site requirements.",
    safetyNotes: "Prevent non-target access and contamination of food, packaging, raw materials and food-contact surfaces. Maintain bait-station records.",
  },
  {
    id: "racumin-blocks",
    name: "Racumin Rat and Mouse Blocks",
    category: "Rodenticide",
    active: "Coumatetralyl rodenticide bait",
    sdsUrl: "https://assets.elanco.com/7eafa302-37b3-00f8-2e74-bb902d1a0ba2/5dd57c63-e195-42b6-949c-f32a8a24d5e5/Racumin%20Rat%20and%20Mouse%20Blocks_1.0_AU_EN%20120824.pdf",
    defaultUse: "Rodent baiting program using secured bait stations or protected bait placements in accordance with label directions.",
    safetyNotes: "Record placement, bait take and non-target controls. Ensure client understands any site-specific handling and access restrictions.",
  },
];

const COMPLIANCE_ITEMS = [
  "Food Standards Code Standard 3.2.2 clause 24: take practicable measures to prevent pest entry, eradicate pests, and prevent pest harbourage.",
  "Food Standards Code Standard 3.2.3: premises, fixtures and fittings should support cleaning, maintenance and pest exclusion.",
  "Safe Food Australia Appendix 7: pest plans should identify target pests, treatment/inspection areas, device locations and service frequency.",
  "NSW Food Authority guidance: food premises should keep written treatment reports, pest activity records and ensure chemicals/baits do not contaminate food or food-contact surfaces.",
  "APVMA requirements: pesticides must be registered or covered by permit and used strictly in accordance with approved label directions, restraints, withholding periods and safety directions.",
  "Safe Work Australia / WHS: current Safety Data Sheets must be available for hazardous chemicals used or stored at the workplace.",
  "NSW EPA: prescribed pest management work must be completed by an appropriately licensed technician or permit holder where required.",
  "Food Safety Program / HACCP support: records should help demonstrate monitoring, corrective action, trend review and due diligence during customer or regulator audits.",
];

const defaultForm = (prospectId = ""): FormState => ({
  prospectId,
  reportType: "Initial inspection",
  inspectionDate: today(),
  inspectorName: "",
  siteContact: "",
  areasInspected: "External perimeter, receival/loading area, production/packing zones, storage areas, staff amenities, waste area, plant rooms and roof/access points where available.",
  riskLevel: "Moderate",
  evidence: ["No active evidence observed"],
  siteFindings: "",
  hygieneFindings: "",
  accessFindings: "",
  correctiveActions: "",
  recommendedProgram: "Integrated Pest Management program with external rodent stations, internal monitoring points, insect light traps where appropriate, device map, trend reporting, corrective-action register and audit-ready service records.",
  nextService: "Monthly service for the first quarter, then review frequency against pest activity trends and audit requirements.",
  selectedChemicalId: "",
  selectedChemicalIds: [],
  chemicalEntries: [],
  technicianLicence: "",
  chemicalsUsed: "No chemical treatment recorded in this inspection report unless listed below.",
  sdsStatus: "Current SDS to be supplied or held for every hazardous chemical used or stored for the service.",
  apvmaStatus: "Only APVMA-registered products, or products covered by a current permit, are to be used. All applications must follow approved label directions.",
  ppeControls: "Technician to follow product label, SDS and site PPE requirements before handling or applying any pesticide.",
  foodSafetyControls: "Do not place pesticides, baits, insect light units or dead-pest collection points where contamination of food, packaging, raw materials or food-contact surfaces may occur.",
  storageDisposal: "Chemicals to be transported, stored and disposed of according to label, SDS, WHS and environmental requirements. No chemicals to be left on site unless authorised and documented.",
  withholdingReentry: "Observe all label restraints, re-entry directions, ventilation requirements and withholding periods where applicable.",
  chemicalNotes: "",
});

const segmentDefaults = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes("winery") || c.includes("brewery") || c.includes("distillery")) {
    return {
      areas: "Cellar door and hospitality areas, grape receival, tank farm, barrel/storage areas, bottling/packaging line, dry goods store, waste area and external perimeter.",
      program: "Winery IPM program covering rodent exclusion, bird pressure around receival areas, stored-product insect monitoring in dry goods, and audit-ready service documentation.",
    };
  }
  if (c.includes("meat") || c.includes("beef") || c.includes("poultry")) {
    return {
      areas: "External perimeter, livestock/receival areas, processing surrounds, amenities, waste/offal zones, loading docks, plant rooms and boundary vegetation.",
      program: "High-care food-processing pest program with intensive external rodent control, fly pressure reduction, strict chemical-use controls and corrective-action reporting for QA files.",
    };
  }
  if (c.includes("dairy") || c.includes("cheese")) {
    return {
      areas: "Milk receival, production rooms, cold rooms, packaging, dry store, waste area, staff amenities, external doors and service penetrations.",
      program: "Dairy-safe IPM program focused on fly, rodent and stored-product insect prevention with low-contamination treatment methods suitable for high-care food zones.",
    };
  }
  if (c.includes("grain") || c.includes("feed") || c.includes("rice")) {
    return {
      areas: "Silos, receival pits, grain/rice storage, bagging/packing line, dry store, loading docks, external perimeter and spillage zones.",
      program: "Stored-product pest and rodent monitoring program with grain-zone inspection, proofing recommendations, bait-station mapping and harvest-season escalation triggers.",
    };
  }
  if (c.includes("citrus") || c.includes("packing")) {
    return {
      areas: "Packing line, cool rooms, receival docks, export staging area, chemical store, waste bins, external perimeter and fruit-fly monitoring points.",
      program: "Packing-shed pest program covering rodent control, flying insect reduction, fruit-fly monitoring support and export-compliance documentation.",
    };
  }
  return {
    areas: "External perimeter, loading/receival areas, production or storage zones, amenities, waste areas, plant rooms and access points.",
    program: "Commercial IPM program with monitoring devices, service records, proofing recommendations and scheduled risk reviews.",
  };
};

const formatDate = (value: string) => {
  if (!value) return "Not recorded";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "long", year: "numeric" }).format(date);
};

const updateEvidence = (current: PestEvidence[], item: PestEvidence, checked: boolean): PestEvidence[] => {
  if (item === "No active evidence observed" && checked) return [item];
  const withoutNoEvidence = current.filter((e) => e !== "No active evidence observed");
  if (checked) return Array.from(new Set([...withoutNoEvidence, item]));
  return current.filter((e) => e !== item);
};

const selectedProductsFor = (ids: string[]) =>
  ids
    .map((id) => CHEMICAL_PRODUCTS.find((product) => product.id === id))
    .filter((product): product is ChemicalProduct => Boolean(product));

const chemicalEntryDefaults = (productId: string): ChemicalEntry => ({
  productId,
  batchNumber: "",
  expiryDate: "",
  apvmaNumber: "",
  targetPest: "",
  treatmentLocation: "",
  applicationMethod: "",
  rateQuantity: "",
  sdsChecked: true,
  labelChecked: true,
});

const chemicalFieldsForProducts = (products: ChemicalProduct[], entries: ChemicalEntry[] = []) => {
  if (!products.length) {
    return {
      chemicalsUsed: "No chemical treatment recorded in this inspection report unless listed below.",
      sdsStatus: "Current SDS to be supplied or held for every hazardous chemical used or stored for the service.",
      apvmaStatus: "Only APVMA-registered products, or products covered by a current permit, are to be used. All applications must follow approved label directions.",
      ppeControls: "Technician to follow product label, SDS and site PPE requirements before handling or applying any pesticide.",
      foodSafetyControls: "Do not place pesticides, baits, insect light units or dead-pest collection points where contamination of food, packaging, raw materials or food-contact surfaces may occur.",
      storageDisposal: "Chemicals to be transported, stored and disposed of according to label, SDS, WHS and environmental requirements. No chemicals to be left on site unless authorised and documented.",
      withholdingReentry: "Observe all label restraints, re-entry directions, ventilation requirements and withholding periods where applicable.",
    };
  }

  const entryFor = (productId: string) =>
    entries.find((entry) => entry.productId === productId) ?? chemicalEntryDefaults(productId);
  const missing = "Not recorded";

  return {
    chemicalsUsed: products
      .map(
        (product, index) => {
          const entry = entryFor(product.id);
          return `${index + 1}. ${product.name} (${product.active}) | APVMA/permit: ${entry.apvmaNumber || missing} | Batch: ${entry.batchNumber || missing} | Expiry: ${entry.expiryDate || missing} | Pest/location: ${entry.targetPest || missing} / ${entry.treatmentLocation || missing} | Rate/method: ${entry.rateQuantity || missing} / ${entry.applicationMethod || missing}`;
        }
      )
      .join("\n\n"),
    sdsStatus: products
      .map(
        (product, index) => {
          const entry = entryFor(product.id);
          return `${index + 1}. ${product.name}: ${entry.sdsChecked ? "SDS checked / supplied" : "SDS not yet checked"} — ${product.sdsUrl}`;
        }
      )
      .join("\n"),
    apvmaStatus: products
      .map(
        (product, index) => {
          const entry = entryFor(product.id);
          return `${index + 1}. ${product.name}: APVMA/permit ${entry.apvmaNumber || missing}; label ${entry.labelChecked ? "checked" : "not yet checked"}${product.labelUrl ? ` — ${product.labelUrl}` : ""}`;
        }
      )
      .join("\n"),
    ppeControls:
      "Technician followed product label, SDS and site PPE requirements. Record any extra PPE, ventilation or exclusion controls here if required.",
    foodSafetyControls:
      "Treatment must not contaminate food, ingredients, packaging, food-contact surfaces, utensils or processing equipment.",
    storageDisposal: "Transport, storage and disposal to follow product label, SDS, site rules, WHS and environmental requirements.",
    withholdingReentry:
      "Record any label re-entry, ventilation, withholding, notification or exclusion requirement that applies to the treatment.",
  };
};

const chemicalReportSummaryText = (form: FormState) => {
  const products = selectedProductsFor(form.selectedChemicalIds);
  if (!products.length) return "No chemical treatment recorded in this inspection report.";

  const line = (value: string) => value || "Not recorded";
  const productLines = products.map((product, index) => {
    const entry = form.chemicalEntries.find((item) => item.productId === product.id) ?? chemicalEntryDefaults(product.id);
    return `${index + 1}. ${product.name} (${product.active})
APVMA/permit: ${line(entry.apvmaNumber)}
Batch/expiry: ${line(entry.batchNumber)} / ${line(entry.expiryDate)}
Target/location: ${line(entry.targetPest)} / ${line(entry.treatmentLocation)}
Rate/method: ${line(entry.rateQuantity)} / ${line(entry.applicationMethod)}
SDS: ${entry.sdsChecked ? "checked/supplied" : "not checked"} | Label: ${entry.labelChecked ? "checked" : "not checked"}`;
  });

  return `Technician licence / permit: ${form.technicianLicence || "Not recorded"}

${productLines.join("\n\n")}

Controls: Follow current label directions, SDS, site PPE rules and food-safety controls. Do not contaminate food, packaging, raw materials, food-contact surfaces or processing equipment.${form.chemicalNotes ? `\n\nAdditional notes: ${form.chemicalNotes}` : ""}`;
};

const complianceReportSummaryText =
  "Report supports the site pest-management file for food safety, QA, supplier audit and due-diligence records. Chemical use must be checked against current SDS, product label directions, APVMA registration or permit status, site rules and any required NSW technician licensing.";

const reportTextFor = (form: FormState, prospect: Prospect | undefined) => {
  const evidence = form.evidence.length ? form.evidence.join(", ") : "Not recorded";

  const chemicalSummary = chemicalReportSummaryText(form);

  const companyName = prospect?.companyName ?? "Selected client site";
  const town = prospect?.town ?? "Not recorded";
  const category = prospect?.category ?? "Not recorded";

  return `TELIOS PEST MANAGEMENT
Commercial Pest Inspection Report

Client site: ${companyName}
Site area: ${town}
Industry segment: ${category}
Report type: ${form.reportType}
Inspection date: ${formatDate(form.inspectionDate)}
Inspector: ${form.inspectorName || "Telios Pest Management"}
Site contact: ${form.siteContact || "Not recorded"}

Overall pest risk rating: ${form.riskLevel}

Areas inspected
${form.areasInspected || "Not recorded"}

Pest evidence observed
${evidence}

Site findings
${form.siteFindings || "No additional site findings recorded."}

Hygiene, sanitation and housekeeping findings
${form.hygieneFindings || "No hygiene or housekeeping issues recorded during this inspection."}

Access, proofing and harbourage findings
${form.accessFindings || "No access, proofing or harbourage issues recorded during this inspection."}

Corrective actions recommended
${form.correctiveActions || "No corrective actions recorded. Continue routine monitoring and review trend data at the next service."}

Recommended pest management program
${form.recommendedProgram || "Integrated Pest Management program with monitoring, treatment records and periodic review."}

Suggested next service or review
${form.nextService || "Confirm the next service date with the site contact."}

Chemical safety and documentation
${chemicalSummary}

Compliance alignment
${complianceReportSummaryText}

Important note
This report supports the site pest-management file for food safety, quality assurance, supplier audit and general due-diligence purposes. It does not replace site-specific legal, regulator, HACCP auditor or certification-body advice. Treatment methods, chemical use and monitoring locations must be confirmed against site rules, product-safety requirements, safety data sheets and current label directions before any service work is completed.

Prepared by Telios Pest Management.`;
};

const ReportSection = ({ title, children }: { title: string; children: string }) => (
  <section className="report-section">
    <h3>{title}</h3>
    <p className="whitespace-pre-line">{children}</p>
  </section>
);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const paragraphHtml = (value: string) =>
  escapeHtml(value)
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("") || "<p>Not recorded</p>";

const standaloneReportHtml = (form: FormState, prospect: Prospect | undefined) => {
  const companyName = prospect?.companyName ?? "Selected client site";
  const town = prospect?.town ?? "Not recorded";
  const category = prospect?.category ?? "Not recorded";
  const evidence = form.evidence.length ? form.evidence.join(", ") : "Not recorded";
  const chemicalSummary = chemicalReportSummaryText(form);
  const section = (title: string, body: string) => `
    <section class="section">
      <h3>${escapeHtml(title)}</h3>
      ${paragraphHtml(body)}
    </section>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Telios Pest Inspection Report - ${escapeHtml(companyName)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; background: #f3f0e8; font-family: Arial, sans-serif; line-height: 1.45; }
    .toolbar { position: sticky; top: 0; display: flex; gap: 8px; justify-content: flex-end; padding: 12px; background: #173d33; }
    .toolbar button { border: 0; border-radius: 6px; padding: 9px 12px; background: #f1d18c; color: #102820; font-weight: 700; cursor: pointer; }
    .page { width: 210mm; min-height: 297mm; margin: 18px auto; padding: 14mm; background: #fff; box-shadow: 0 12px 36px rgba(0,0,0,.12); }
    .letterhead { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 3px solid #173d33; margin-bottom: 14px; }
    .brand { font-size: 11px; letter-spacing: .18em; color: #555; font-weight: 700; }
    h1 { margin: 4px 0 0; font-size: 24px; line-height: 1.1; }
    .badge { border: 1px solid #8a6a24; background: #f8f4e8; border-radius: 8px; padding: 8px 10px; font-size: 12px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); border: 1px solid #bbb; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
    .grid div { min-height: 58px; padding: 9px 10px; border-right: 1px solid #bbb; border-bottom: 1px solid #bbb; }
    .grid div:nth-child(even) { border-right: 0; }
    .grid div:nth-last-child(-n+2) { border-bottom: 0; }
    .grid span, .section h3 { display: block; font-size: 10px; letter-spacing: .12em; color: #555; font-weight: 800; text-transform: uppercase; }
    .grid strong { display: block; margin-top: 4px; font-size: 13px; }
    .section { border: 1px solid #bbb; border-radius: 8px; padding: 10px; margin-bottom: 10px; break-inside: avoid; }
    .section h3 { margin: 0 0 6px; }
    .section p, .section li { margin: 0 0 5px; font-size: 13px; }
    .section ul { margin: 0; padding-left: 18px; }
    .note { border: 1px solid #8a6a24; background: #f8f4e8; border-radius: 8px; padding: 10px; margin-top: 10px; font-size: 12px; break-inside: avoid; }
    .signoff { display: flex; justify-content: space-between; gap: 18px; border-top: 1px solid #bbb; margin-top: 18px; padding-top: 12px; font-weight: 700; font-size: 13px; }
    @media print {
      body { background: #fff; }
      .toolbar { display: none; }
      .page { width: auto; min-height: auto; margin: 0; padding: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Print / Save as PDF</button>
    <button onclick="window.close()">Close</button>
  </div>
  <main class="page">
    <div class="letterhead">
      <div>
        <div class="brand">TELIOS PEST MANAGEMENT</div>
        <h1>Commercial Pest Inspection Report</h1>
      </div>
      <div class="badge">${escapeHtml(form.riskLevel)} risk</div>
    </div>
    <div class="grid">
      <div><span>Client site</span><strong>${escapeHtml(companyName)}</strong></div>
      <div><span>Site area</span><strong>${escapeHtml(town)}</strong></div>
      <div><span>Industry segment</span><strong>${escapeHtml(category)}</strong></div>
      <div><span>Report type</span><strong>${escapeHtml(form.reportType)}</strong></div>
      <div><span>Inspection date</span><strong>${escapeHtml(formatDate(form.inspectionDate))}</strong></div>
      <div><span>Inspector</span><strong>${escapeHtml(form.inspectorName || "Telios Pest Management")}</strong></div>
      <div><span>Site contact</span><strong>${escapeHtml(form.siteContact || "Not recorded")}</strong></div>
      <div><span>Pest evidence</span><strong>${escapeHtml(evidence)}</strong></div>
    </div>
    ${section("Areas inspected", form.areasInspected || "Not recorded")}
    ${section("Site findings", form.siteFindings || "No additional site findings recorded.")}
    ${section("Hygiene, sanitation and housekeeping findings", form.hygieneFindings || "No hygiene or housekeeping issues recorded during this inspection.")}
    ${section("Access, proofing and harbourage findings", form.accessFindings || "No access, proofing or harbourage issues recorded during this inspection.")}
    ${section("Corrective actions recommended", form.correctiveActions || "No corrective actions recorded. Continue routine monitoring and review trend data at the next service.")}
    ${section("Recommended pest management program", form.recommendedProgram || "Integrated Pest Management program with monitoring, treatment records and periodic review.")}
    ${section("Suggested next service or review", form.nextService || "Confirm the next service date with the site contact.")}
    ${section("Chemical safety and documentation", chemicalSummary)}
    ${section("Compliance alignment", complianceReportSummaryText)}
    <section class="note">This report supports the site pest-management file for food safety, quality assurance, supplier audit and due-diligence purposes. It does not replace site-specific legal, regulator, HACCP auditor or certification-body advice. Treatment methods, chemical use and monitoring locations must be confirmed against site rules, product-safety requirements, safety data sheets and current label directions before service work is completed.</section>
    <div class="signoff">
      <div>Prepared by Telios Pest Management</div>
      <div>Signature: ____________________________</div>
    </div>
  </main>
  <script>
    setTimeout(function () { window.focus(); window.print(); }, 400);
  </script>
</body>
</html>`;
};

type ReportsViewProps = {
  prospects: Prospect[];
};

export const ReportsView = ({ prospects }: ReportsViewProps) => {
  const [form, setForm] = useState<FormState>(() => defaultForm(prospects[0]?.id ?? ""));
  const [printStatus, setPrintStatus] = useState("");

  const sortedProspects = useMemo(
    () => [...prospects].sort((a, b) => b.leadScore - a.leadScore),
    [prospects]
  );

  const prospect = useMemo(
    () => prospects.find((p) => p.id === form.prospectId) ?? prospects[0],
    [prospects, form.prospectId]
  );

  useEffect(() => {
    if (!prospects.length) return;
    if (!prospects.some((p) => p.id === form.prospectId)) {
      setForm((current) => ({ ...current, prospectId: prospects[0].id }));
    }
  }, [prospects, form.prospectId]);

  const reportText = useMemo(() => reportTextFor(form, prospect), [form, prospect]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyTemplate = () => {
    const defaults = segmentDefaults(prospect?.category ?? "");
    setForm((current) => ({
      ...current,
      areasInspected: defaults.areas,
      recommendedProgram: defaults.program,
      siteFindings: "",
      hygieneFindings: "",
      accessFindings: "",
      correctiveActions: "Record any required proofing, sanitation, harbourage reduction, device relocation, or follow-up treatment actions identified during the inspection.",
    }));
  };

  const reset = () => setForm(defaultForm(form.prospectId));

  const setChemicalSelection = (ids: string[], productId = "") => {
    setForm((current) => ({
      ...current,
      ...(() => {
        const chemicalEntries = ids.map(
          (id) => current.chemicalEntries.find((entry) => entry.productId === id) ?? chemicalEntryDefaults(id)
        );
        const products = selectedProductsFor(ids);
        const generated = chemicalFieldsForProducts(products, chemicalEntries);
        return {
          selectedChemicalId: productId,
          selectedChemicalIds: ids,
          chemicalEntries,
          ...generated,
        };
      })(),
    }));
  };

  const applyChemicalProduct = (productId: string) => {
    if (!productId) {
      update("selectedChemicalId", "");
      return;
    }

    const ids = form.selectedChemicalIds.includes(productId)
      ? form.selectedChemicalIds
      : [...form.selectedChemicalIds, productId];
    setChemicalSelection(ids, productId);
  };

  const removeChemicalProduct = (productId: string) => {
    const ids = form.selectedChemicalIds.filter((id) => id !== productId);
    setChemicalSelection(ids);
  };

  const updateChemicalEntry = <K extends keyof Omit<ChemicalEntry, "productId">>(
    productId: string,
    key: K,
    value: ChemicalEntry[K]
  ) => {
    setForm((current) => {
      const chemicalEntries = current.chemicalEntries.map((entry) =>
        entry.productId === productId ? { ...entry, [key]: value } : entry
      );
      const products = selectedProductsFor(current.selectedChemicalIds);
      const generated = chemicalFieldsForProducts(products, chemicalEntries);
      return { ...current, chemicalEntries, ...generated };
    });
  };

  const selectedChemicalProducts = selectedProductsFor(form.selectedChemicalIds);
  const chemicalReportSummary = chemicalReportSummaryText(form);

  const printReport = () => {
    const html = standaloneReportHtml(form, prospect);
    const printWindow = window.open("", "_blank", "width=900,height=1100");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setPrintStatus("Opened a printable report. Choose Print or Save as PDF in that window.");
      return;
    }

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "telios-pest-inspection-report.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setPrintStatus("Popup was blocked, so I downloaded a printable HTML report instead.");
  };

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Site visit software
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Inspection reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a target account, prefill a food-facility inspection form, then produce a client-ready Telios report you can copy or print after your site walk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={reset} data-testid="button-reset-report" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset form
          </Button>
          <Button type="button" onClick={printReport} data-testid="button-print-report" className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print report
          </Button>
        </div>
      </div>

      {printStatus && (
        <div
          data-testid="status-print-report"
          className="mb-4 rounded-md border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground"
        >
          {printStatus}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <section className="xl:col-span-5 space-y-4 print:hidden">
          <div className="rounded-lg border border-card-border bg-card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold">Report setup</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Prospect details are pulled from the lead database. Inspection fields stay in this browser session only.
                </p>
              </div>
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="md:col-span-2 text-xs font-medium">
                Client site
                <select
                  value={form.prospectId}
                  onChange={(e) => update("prospectId", e.target.value)}
                  data-testid="select-report-prospect"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {sortedProspects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName} — {p.town}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium">
                Report type
                <select
                  value={form.reportType}
                  onChange={(e) => update("reportType", e.target.value as FormState["reportType"])}
                  data-testid="select-report-type"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option>Initial inspection</option>
                  <option>Routine service</option>
                  <option>Corrective action review</option>
                  <option>Pre-audit check</option>
                </select>
              </label>

              <label className="text-xs font-medium">
                Inspection date
                <input
                  type="date"
                  value={form.inspectionDate}
                  onChange={(e) => update("inspectionDate", e.target.value)}
                  data-testid="input-inspection-date"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </label>

              <label className="text-xs font-medium">
                Inspector
                <input
                  value={form.inspectorName}
                  onChange={(e) => update("inspectorName", e.target.value)}
                  placeholder="Your name"
                  data-testid="input-inspector-name"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </label>

              <label className="text-xs font-medium">
                Site contact
                <input
                  value={form.siteContact}
                  onChange={(e) => update("siteContact", e.target.value)}
                  placeholder="QA manager / site manager"
                  data-testid="input-site-contact"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </label>
            </div>

            <div className="mt-4 rounded-md bg-muted/45 p-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Selected account</div>
              <div className="text-sm font-semibold mt-1" data-testid="text-report-company">{prospect?.companyName ?? "No prospect selected"}</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{prospect ? `${prospect.category} · ${prospect.town}` : "Add a prospect from the Prospects tab to begin a report."}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Lead research stays out of the findings section. The report only uses what you enter from the site inspection.
              </p>
              <button
                type="button"
                onClick={applyTemplate}
                data-testid="button-apply-report-template"
                className="mt-3 inline-flex items-center rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover-elevate"
              >
                Prefill form fields only
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold mb-3">Compliance checklist built into report</h2>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              {COMPLIANCE_ITEMS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold mb-4">Inspection findings</h2>
            <div className="space-y-4">
              <label className="block text-xs font-medium">
                Areas inspected
                <textarea
                  value={form.areasInspected}
                  onChange={(e) => update("areasInspected", e.target.value)}
                  data-testid="input-areas-inspected"
                  className="mt-1 w-full min-h-[86px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                />
              </label>

              <fieldset>
                <legend className="text-xs font-medium mb-2">Pest evidence observed</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_EVIDENCE.map((item) => (
                    <label key={item} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.evidence.includes(item)}
                        onChange={(e) => update("evidence", updateEvidence(form.evidence, item, e.target.checked))}
                        data-testid={`checkbox-evidence-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="h-4 w-4"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block text-xs font-medium">
                Overall risk rating
                <select
                  value={form.riskLevel}
                  onChange={(e) => update("riskLevel", e.target.value as RiskLevel)}
                  data-testid="select-risk-level"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>

              {[
                ["siteFindings", "Site findings", "Evidence, pest pressure, device condition, or notable observations."],
                ["hygieneFindings", "Hygiene / sanitation findings", "Spillage, waste, water, housekeeping or cleaning issues."],
                ["accessFindings", "Access / proofing findings", "Gaps under doors, wall penetrations, harbourage, vegetation, bird access."],
                ["correctiveActions", "Corrective actions", "What the client should fix, who owns it, and urgency."],
                ["recommendedProgram", "Recommended program", "Service frequency, monitoring devices, documentation and escalation plan."],
                ["nextService", "Next service / review", "Next appointment, quarterly review or pre-audit check."],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="block text-xs font-medium">
                  {label}
                  <textarea
                    value={form[key as keyof FormState] as string}
                    onChange={(e) => update(key as keyof FormState, e.target.value as never)}
                    placeholder={placeholder}
                    data-testid={`input-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`}
                    className="mt-1 w-full min-h-[82px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-5">
            <h2 className="text-base font-semibold mb-1">Chemical safety pack</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Use this where treatment is completed or proposed. It helps the client keep SDS, APVMA label, PPE, food-safety and licence details with the report.
            </p>
            <div className="space-y-4">
              <label className="block text-xs font-medium">
                Add pesticide / rodenticide to this report
                <select
                  value={form.selectedChemicalId}
                  onChange={(e) => applyChemicalProduct(e.target.value)}
                  data-testid="select-chemical-product"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Add a product to preload SDS and safety fields</option>
                  {CHEMICAL_PRODUCTS.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.category}
                    </option>
                  ))}
                </select>
              </label>

              {selectedChemicalProducts.length > 0 && (
                <div
                  data-testid="list-selected-chemicals"
                  className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Selected chemical pack
                  </div>
                  {selectedChemicalProducts.map((product, index) => {
                    const entry = form.chemicalEntries.find((item) => item.productId === product.id) ?? chemicalEntryDefaults(product.id);
                    return (
                      <div
                        key={product.id}
                        data-testid={`selected-chemical-${product.id}`}
                        className="rounded-md border border-border bg-background p-3 text-xs leading-relaxed"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div
                              className="font-semibold text-foreground"
                              data-testid={index === 0 ? "text-selected-chemical" : `text-selected-chemical-${product.id}`}
                            >
                              {product.name}
                            </div>
                            <div className="text-muted-foreground mt-1">
                              {product.active} · {product.category}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeChemicalProduct(product.id)}
                            data-testid={`button-remove-chemical-${product.id}`}
                            className="rounded-md border border-border px-2.5 py-1 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <a
                            href={product.sdsUrl}
                            target="_blank"
                            rel="noreferrer"
                            data-testid={index === 0 ? "link-selected-sds" : `link-sds-${product.id}`}
                            className="inline-flex rounded-md border border-border bg-card px-2.5 py-1 font-medium hover-elevate"
                          >
                            Open SDS
                          </a>
                          {product.labelUrl && (
                            <a
                              href={product.labelUrl}
                              target="_blank"
                              rel="noreferrer"
                              data-testid={index === 0 ? "link-selected-label" : `link-label-${product.id}`}
                              className="inline-flex rounded-md border border-border bg-card px-2.5 py-1 font-medium hover-elevate"
                            >
                              Open label / product doc
                            </a>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            ["batchNumber", "Batch / lot no.", "e.g. BFU24091"],
                            ["expiryDate", "Expiry date", ""],
                            ["apvmaNumber", "APVMA reg / permit", "Reg or permit number"],
                            ["targetPest", "Target pest", "Rodents, cockroaches, ants"],
                            ["treatmentLocation", "Treatment location", "Station IDs, perimeter, dock"],
                            ["rateQuantity", "Rate / quantity", "e.g. 10 g, 25 mL/L"],
                            ["applicationMethod", "Application method", "Bait station, crack/crevice"],
                          ].map(([key, label, placeholder]) => (
                            <label key={key} className="block font-medium text-muted-foreground">
                              {label}
                              <input
                                type={key === "expiryDate" ? "date" : "text"}
                                value={entry[key as keyof Omit<ChemicalEntry, "productId" | "sdsChecked" | "labelChecked">] as string}
                                onChange={(e) =>
                                  updateChemicalEntry(
                                    product.id,
                                    key as keyof Omit<ChemicalEntry, "productId">,
                                    e.target.value as never
                                  )
                                }
                                placeholder={placeholder}
                                data-testid={`input-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}-${product.id}`}
                                className="mt-1 w-full h-9 px-2.5 rounded-md border border-input bg-card text-xs text-foreground"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 font-medium text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={entry.sdsChecked}
                              onChange={(e) => updateChemicalEntry(product.id, "sdsChecked", e.target.checked)}
                              data-testid={`checkbox-sds-checked-${product.id}`}
                              className="h-4 w-4"
                            />
                            SDS checked / supplied
                          </label>
                          <label className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2 font-medium text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={entry.labelChecked}
                              onChange={(e) => updateChemicalEntry(product.id, "labelChecked", e.target.checked)}
                              data-testid={`checkbox-label-checked-${product.id}`}
                              className="h-4 w-4"
                            />
                            Label directions checked
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <label className="block text-xs font-medium">
                Technician licence / permit
                <input
                  value={form.technicianLicence}
                  onChange={(e) => update("technicianLicence", e.target.value)}
                  placeholder="NSW EPA licence number, expiry, or permit details"
                  data-testid="input-technician-licence"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </label>

              {[
                ["chemicalsUsed", "Products or chemicals used", "Product name, active ingredient, APVMA reg/permit number, target pest, location, quantity and application method."],
                ["sdsStatus", "Safety Data Sheets", "Confirm current SDS supplied/available for each hazardous chemical and note where the client can access them."],
                ["apvmaStatus", "APVMA registration and label directions", "Confirm registered/permitted product, label rate, use site, restraints, expiry, and directions followed."],
                ["ppeControls", "PPE and worker safety controls", "PPE, ventilation, exclusion zones, hygiene steps, first aid or emergency controls from SDS/label."],
                ["foodSafetyControls", "Food-safety contamination controls", "Controls to protect food, raw materials, packaging, food-contact surfaces and processing equipment."],
                ["storageDisposal", "Storage, transport and disposal", "Chemical storage, transport, empty container disposal, spill response and no-chemical-left-on-site notes."],
                ["withholdingReentry", "Withholding / re-entry directions", "Re-entry periods, withholding periods, site notification, lockout or ventilation requirements."],
                ["chemicalNotes", "Additional chemical notes", "Anything else the QA manager, site manager or auditor should know."],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="block text-xs font-medium">
                  {label}
                  <textarea
                    value={form[key as keyof FormState] as string}
                    onChange={(e) => update(key as keyof FormState, e.target.value as never)}
                    placeholder={placeholder}
                    data-testid={`input-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`}
                    className="mt-1 w-full min-h-[82px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                  />
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="xl:col-span-7 rounded-lg border border-card-border bg-card overflow-hidden print-report">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30 print:hidden">
            <div>
              <div className="text-sm font-semibold">PDF-style Telios report preview</div>
              <div className="text-[11px] text-muted-foreground">
                Use Print report, then choose “Save as PDF” if you want a PDF file.
              </div>
            </div>
            <CopyButton value={reportText} testId="button-copy-report" label="Copy report" />
          </header>
          <article data-testid="text-generated-report" className="report-page">
            <div className="report-letterhead">
              <div>
                <div className="report-brand">TELIOS PEST MANAGEMENT</div>
                <h2>Commercial Pest Inspection Report</h2>
              </div>
              <div className="report-badge">{form.riskLevel} risk</div>
            </div>

            <div className="report-grid">
              <div><span>Client site</span><strong>{prospect?.companyName ?? "Not recorded"}</strong></div>
              <div><span>Site area</span><strong>{prospect?.town ?? "Not recorded"}</strong></div>
              <div><span>Industry segment</span><strong>{prospect?.category ?? "Not recorded"}</strong></div>
              <div><span>Report type</span><strong>{form.reportType}</strong></div>
              <div><span>Inspection date</span><strong>{formatDate(form.inspectionDate)}</strong></div>
              <div><span>Inspector</span><strong>{form.inspectorName || "Telios Pest Management"}</strong></div>
              <div><span>Site contact</span><strong>{form.siteContact || "Not recorded"}</strong></div>
              <div><span>Pest evidence</span><strong>{form.evidence.length ? form.evidence.join(", ") : "Not recorded"}</strong></div>
            </div>

            <ReportSection title="Areas inspected">{form.areasInspected || "Not recorded"}</ReportSection>
            <ReportSection title="Site findings">{form.siteFindings || "No additional site findings recorded."}</ReportSection>
            <ReportSection title="Hygiene, sanitation and housekeeping findings">{form.hygieneFindings || "No hygiene or housekeeping issues recorded during this inspection."}</ReportSection>
            <ReportSection title="Access, proofing and harbourage findings">{form.accessFindings || "No access, proofing or harbourage issues recorded during this inspection."}</ReportSection>
            <ReportSection title="Corrective actions recommended">{form.correctiveActions || "No corrective actions recorded. Continue routine monitoring and review trend data at the next service."}</ReportSection>
            <ReportSection title="Recommended pest management program">{form.recommendedProgram || "Integrated Pest Management program with monitoring, treatment records and periodic review."}</ReportSection>
            <ReportSection title="Suggested next service or review">{form.nextService || "Confirm the next service date with the site contact."}</ReportSection>
            <ReportSection title="Chemical safety and documentation">{chemicalReportSummary}</ReportSection>
            <ReportSection title="Compliance alignment">{complianceReportSummaryText}</ReportSection>

            <section className="report-note">
              This report supports the site pest-management file for food safety, quality assurance, supplier audit and due-diligence purposes. It does not replace site-specific legal, regulator, HACCP auditor or certification-body advice. Treatment methods, chemical use and monitoring locations must be confirmed against site rules, product-safety requirements, safety data sheets and current label directions before service work is completed.
            </section>

            <div className="report-signoff">
              <div>Prepared by Telios Pest Management</div>
              <div>Signature: ____________________________</div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};
