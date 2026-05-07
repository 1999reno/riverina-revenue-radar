import { useMemo, useState } from "react";
import {
  PROSPECTS,
  CATEGORY_GROUPS,
  TOWNS,
  formatAUD,
  type Prospect,
  type CategoryGroup,
} from "@/lib/prospects";
import { Search, X, ExternalLink, ArrowUpDown } from "lucide-react";
import { tierColor } from "@/lib/scoring";

type Props = {
  onOpenProspect: (p: Prospect) => void;
};

type Tier = "all" | 1 | 2 | 3;
type SortKey = "score" | "value" | "name";

export const ProspectsView = ({ onOpenProspect }: Props) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | CategoryGroup>("all");
  const [town, setTown] = useState<"all" | string>("all");
  const [tier, setTier] = useState<Tier>("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let arr = PROSPECTS.filter((p) => {
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
  }, [q, cat, town, tier, sortKey, sortDir]);

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
            {filtered.length} of {PROSPECTS.length} prospects · click any row for the full account profile.
          </p>
        </div>
      </div>

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
            {TOWNS.map((t) => (
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
