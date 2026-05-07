import { type ReactNode } from "react";
import { LayoutDashboard, Building2, Send, ListChecks, BookOpen, FileText, Sun, Moon, Menu, ClipboardCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useTheme } from "@/lib/theme";
import { useState } from "react";

export type SectionKey = "dashboard" | "prospects" | "outreach" | "followups" | "reports" | "playbook" | "audit";

type Props = {
  section: SectionKey;
  onSection: (s: SectionKey) => void;
  children: ReactNode;
};

const NAV: { key: SectionKey; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { key: "dashboard", label: "Overview", icon: LayoutDashboard, hint: "Pipeline + tier mix" },
  { key: "prospects", label: "Prospects", icon: Building2, hint: "Filter, sort & open" },
  { key: "outreach", label: "Outreach", icon: Send, hint: "Email · phone · LinkedIn" },
  { key: "followups", label: "Follow-ups", icon: ListChecks, hint: "21-day cadence" },
  { key: "reports", label: "Inspection reports", icon: ClipboardCheck, hint: "Fill, copy & print" },
  { key: "audit", label: "Audit offer", icon: FileText, hint: "Free 15-minute walk" },
  { key: "playbook", label: "Playbook", icon: BookOpen, hint: "Telios sales motion" },
];

export const Shell = ({ section, onSection, children }: Props) => {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Logo size={24} />
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">Riverina Revenue Radar</div>
            <div className="text-[11px] text-muted-foreground">Telios Pest Management</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="button-theme-toggle-mobile"
            onClick={toggle}
            className="h-9 w-9 grid place-items-center rounded-md border border-border hover-elevate"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            data-testid="button-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            className="h-9 w-9 grid place-items-center rounded-md border border-border hover-elevate"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sidebar (desktop) + mobile drawer-style top */}
      <aside
        className={`lg:w-72 lg:min-h-screen lg:sticky lg:top-0 bg-sidebar text-sidebar-foreground bg-grain ${
          mobileOpen ? "block" : "hidden"
        } lg:block border-b lg:border-b-0 lg:border-r border-sidebar-border`}
        data-testid="nav-sidebar"
      >
        <div className="hidden lg:flex items-center gap-3 px-6 pt-7 pb-5">
          <Logo size={32} />
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Telios Pest Management
            </div>
            <div className="text-base font-bold tracking-tight">Riverina Revenue Radar</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 lg:px-4 py-3 lg:py-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.key === section;
            return (
              <button
                key={n.key}
                type="button"
                data-testid={`nav-${n.key}`}
                onClick={() => {
                  onSection(n.key);
                  setMobileOpen(false);
                }}
                className={`group flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover-elevate ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/85"
                }`}
              >
                <Icon
                  className={`h-4 w-4 mt-0.5 ${
                    active ? "text-sidebar-primary" : "text-sidebar-foreground/55"
                  }`}
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium leading-tight">{n.label}</span>
                  <span className="block text-[11px] text-sidebar-foreground/55 leading-tight mt-0.5">
                    {n.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block px-6 py-5 mt-2 border-t border-sidebar-border">
          <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/55 mb-2">
            Region
          </div>
          <div className="text-sm font-medium">Riverina, NSW</div>
          <div className="text-xs text-sidebar-foreground/60 mt-0.5">
            Griffith · Leeton · Wagga · Albury
          </div>

          <button
            type="button"
            data-testid="button-theme-toggle"
            onClick={toggle}
            className="mt-5 w-full inline-flex items-center justify-between gap-2 rounded-md border border-sidebar-border px-3 py-2 text-xs hover-elevate"
            aria-label="Toggle theme"
          >
            <span className="text-sidebar-foreground/80">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};
