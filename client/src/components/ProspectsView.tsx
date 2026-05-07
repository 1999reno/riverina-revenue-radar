import { useMemo, useState } from "react";
import {
  CATEGORY_GROUPS,
  createManualProspect,
  formatAUD,
  type Prospect,
  type CategoryGroup,
  type ManualLeadInput,
} from "@/lib/prospects";
import { Search, X, ExternalLink, ArrowUpDown, Plus, MapPinned } from "lucide-react";
import { tierColor } from "@/lib/scoring";

type Props = {
  prospects: Prospect[];
  onAddProspect: (p: Prospect) => void;
  onOpenProspect: (p: Prospect) => void;
};

type Tier = "all" | 1 | 2 | 3;
type SortKey = "score" | "value" | "name";

const emptyLeadForm = (): ManualLeadInput => ({
  companyName: "",
  category: "",
  categoryGroup: "Other",
  town: "",
  websiteUrl: "",
  publicSourceUrl: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
  leadScore: 72,
  estMonthlyValue: undefined,
});

export const ProspectsView = ({ prospects, onAddProspect, onOpenProspect }: Props) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | CategoryGroup>("all");
  const [town, setTown] = useState<"all" | string>("all");
  const [tier, setTier] = useState<Tier>("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showAddLead, setShowAddLead] = useState(false);
  const [leadForm, setLeadForm] = useState<ManualLeadInput>(() => emptyLeadForm());
  const [searchIndustry, setSearchIndustry] = useState("food processor");
  const [searchTown, setSearchTown] = useState("Griffith");
  const [leadStatus, setLeadStatus] = useState("");

  const towns = useMemo(() => Array.from(new Set(prospects.map((p) => p.town))).sort(), [prospects]);

  const filtered = useMemo(() => {
    let arr = prospects.filter((p) => {
      if (cat !== "all" && p.categoryGroup !== cat) return false;
      if (town !== "all" && p.town !== town) return false;
      if (tier !== "all" && p.tier !== tier) return false;
      if (q) {
        const needle = q.toLowerCase();
        if (
          !p.companyName.toLowerCase().includes(needle) &&
          !p.category.toLowerCase().includes(needle) &&
          !p.town.toLowerCase().includes(needle) &&
          !p.whyGoodFit.toLowerCase().includes(needle)
        )
          return false;
      }
      return true;
    });
    arr = [...arr].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "score") cmp = a.leadScore - b.leadScore;
      else if (sortKey === "value") cmp = a.estMonthlyValue - b.estMonthlyValue;
      else cmp = a.companyName.localeCompare(b.companyName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [prospects, q, cat, town, tier, sortKey, sortDir]);

  const updateLeadForm = <K extends keyof ManualLeadInput>(key: K, value: ManualLeadInput[K]) => {
    setLeadForm((current) => ({ ...current, [key]: value }));
  };

  const addLead = () => {
    if (!leadForm.companyName.trim()) {
      setLeadStatus("Company name is required before a lead can be added.");
      return;
    }
    const prospect = createManualProspect(leadForm, prospects.length);
    onAddProspect(prospect);
    setLeadForm(emptyLeadForm());
    setShowAddLead(false);
    setLeadStatus(`${prospect.companyName} was added to this session's prospect list.`);
  };

  const searchPhrase = `${searchIndustry || "commercial food business"} ${searchTown || "Riverina NSW"}`.trim();
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchPhrase)}`;
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${searchPhrase} company website contact`)}`;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const clearAll = () => {
    setQ("");
    setCat("all");
    setTown("all");
    setTier("all");
  };

  const filtersActive = q || cat !== "all" || town !== "all" || tier !== "all";

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Account list
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Prospects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {prospects.length} prospects · click any row for the full account profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddLead((v) => !v)}
          data-testid="button-toggle-add-lead"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover-elevate"
        >
          <Plus className="h-4 w-4" />
          Add new lead
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-5">
        <section className="xl:col-span-5 rounded-lg border border-card-border bg-card p-4">
          <div className="flex items-start gap-3">
            <MapPinned className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold">Find new leads</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Build a targeted Google or Maps search, then review results before adding a company manually.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <input
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
              placeholder="wineries, packing sheds, food processors"
              data-testid="input-lead-search-industry"
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
            <input
              value={searchTown}
              onChange={(e) => setSearchTown(e.target.value)}
              placeholder="Griffith, Wagga Wagga, Leeton"
              data-testid="input-lead-search-town"
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="link-search-google-maps"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium hover-elevate"
            >
              Search Google Maps <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="link-search-google-web"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium hover-elevate"
            >
              Search web <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>

        {showAddLead && (
          <section className="xl:col-span-7 rounded-lg border border-card-border bg-card p-4" data-testid="panel-add-lead">
            <h2 className="text-sm font-semibold">Add lead manually</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Added leads appear immediately, but permanent saving still needs Emergent/database storage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
              <input value={leadForm.companyName} onChange={(e) => updateLeadForm("companyName", e.target.value)} placeholder="Company name" data-testid="input-new-lead-company" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input value={leadForm.town} onChange={(e) => updateLeadForm("town", e.target.value)} placeholder="Town / area" data-testid="input-new-lead-town" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input value={leadForm.category} onChange={(e) => updateLeadForm("category", e.target.value)} placeholder="Industry type" data-testid="input-new-lead-category" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <select value={leadForm.categoryGroup} onChange={(e) => updateLeadForm("categoryGroup", e.target.value as CategoryGroup)} data-testid="select-new-lead-category-group" className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                {CATEGORY_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
              </select>
              <input value={leadForm.websiteUrl} onChange={(e) => updateLeadForm("websiteUrl", e.target.value)} placeholder="Website URL" data-testid="input-new-lead-website" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input value={leadForm.publicSourceUrl} onChange={(e) => updateLeadForm("publicSourceUrl", e.target.value)} placeholder="Source URL / listing" data-testid="input-new-lead-source" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input value={leadForm.contactName} onChange={(e) => updateLeadForm("contactName", e.target.value)} placeholder="Contact name" data-testid="input-new-lead-contact" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input value={leadForm.contactEmail} onChange={(e) => updateLeadForm("contactEmail", e.target.value)} placeholder="Email" data-testid="input-new-lead-email" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input value={leadForm.contactPhone} onChange={(e) => updateLeadForm("contactPhone", e.target.value)} placeholder="Phone" data-testid="input-new-lead-phone" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input type="number" min={1} max={100} value={leadForm.leadScore || ""} onChange={(e) => updateLeadForm("leadScore", Number(e.target.value))} placeholder="Lead score 1-100" data-testid="input-new-lead-score" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <input type="number" min={0} value={leadForm.estMonthlyValue || ""} onChange={(e) => updateLeadForm("estMonthlyValue", e.target.value ? Number(e.target.value) : undefined)} placeholder="Estimated monthly value" data-testid="input-new-lead-value" className="h-10 px-3 rounded-md border border-input bg-background text-sm" />
              <textarea value={leadForm.notes} onChange={(e) => updateLeadForm("notes", e.target.value)} placeholder="Notes, why they are a good fit, follow-up angle" data-testid="input-new-lead-notes" className="sm:col-span-2 min-h-[78px] px-3 py-2 rounded-md border border-input bg-background text-sm" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <span className="text-xs text-muted-foreground">{leadStatus}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddLead(false)} data-testid="button-cancel-add-lead" className="rounded-md border border-border px-3 py-2 text-xs font-medium hover-elevate">Cancel</button>
                <button type="button" onClick={addLead} data-testid="button-save-new-lead" className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover-elevate">Save lead</button>
              </div>
            </div>
          </section>
        )}
      </div>

      {leadStatus && !showAddLead && (
        <div data-testid="status-new-lead" className="mb-4 rounded-md border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground">
          {leadStatus}
        </div>
      )}

      {/* Filter bar */}
      <div className="rounded-lg border border-card-border bg-card p-3 lg:p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search company, category, town, fit notes…"
              data-testid="input-search"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as any)}
            data-testid="select-category"
            className="md:col-span-3 h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All categories</option>
            {CATEGORY_GROUPS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            data-testid="select-town"
            className="md:col-span-2 h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All towns</option>
            {towns.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={tier === "all" ? "all" : String(tier)}
            onChange={(e) =>
              setTier(e.target.value === "all" ? "all" : (Number(e.target.value) as 1 | 2 | 3))
            }
            data-testid="select-tier"
            className="md:col-span-2 h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All tiers</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
        </div>
        {filtersActive && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {filtered.length} match{filtered.length === 1 ? "" : "es"}
            </span>
            <button
              type="button"
              onClick={clearAll}
              data-testid="button-clear-filters"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs text-muted-foreground">
        <span>Sort:</span>
        <div className="flex items-center gap-1">
          {(["score", "value", "name"] as SortKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleSort(k)}
              data-testid={`button-sort-${k}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border ${
                sortKey === k
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border hover-elevate"
              }`}
            >
              {k === "score" ? "Lead score" : k === "value" ? "Est. monthly" : "Name"}
              <ArrowUpDown className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Table-like list — collapses to cards on mobile */}
      <div className="rounded-lg border border-card-border bg-card overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/40">
          <div className="col-span-4">Company</div>
          <div className="col-span-3">Category · Town</div>
          <div className="col-span-2">Tier</div>
          <div className="col-span-2 text-right">Est. monthly</div>
          <div className="col-span-1 text-right">Score</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No prospects match those filters.
            </div>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenProspect(p)}
              data-testid={`row-prospect-${p.id}`}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 px-4 lg:px-5 py-3.5 text-left hover-elevate"
            >
              <div className="lg:col-span-4 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {p.companyName}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 lg:hidden">
                  {p.category} · {p.town}
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-3 text-xs text-muted-foreground min-w-0">
                <div className="truncate">{p.category}</div>
                <div className="text-[11px] mt-0.5">{p.town}</div>
              </div>
              <div className="lg:col-span-2 flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${tierColor(
                    p.tier
                  )}`}
                >
                  Tier {p.tier}
                </span>
                <span className="text-[11px] text-muted-foreground lg:hidden">
                  {formatAUD(p.estMonthlyValue)}/mo
                </span>
              </div>
              <div className="hidden lg:block lg:col-span-2 text-right">
                <span className="font-mono text-sm">
                  {formatAUD(p.estMonthlyValue)}
                  <span className="text-muted-foreground">/mo</span>
                </span>
              </div>
              <div className="lg:col-span-1 flex lg:justify-end items-center gap-2">
                <div className="lg:hidden flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[160px]">
                  <div
                    style={{ width: `${p.leadScore}%` }}
                    className="h-full bg-[hsl(var(--chart-2))]"
                  />
                </div>
                <span className="font-mono font-semibold text-base tabular-nums">
                  {p.leadScore}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 text-[11px] text-muted-foreground flex items-center gap-2">
          <ExternalLink className="h-3 w-3" />
          Source links open in the detail drawer — every account ships with a public source URL and the company website.
        </div>
      )}
    </div>
  );
};
