import { useEffect, useState } from "react";
import { ThemeProvider } from "@/lib/theme";
import { Shell, type SectionKey } from "@/components/Shell";
import { Dashboard } from "@/components/Dashboard";
import { ProspectsView } from "@/components/ProspectsView";
import { ProspectDrawer } from "@/components/ProspectDrawer";
import { OutreachView } from "@/components/OutreachView";
import { FollowupsView } from "@/components/FollowupsView";
import { PlaybookView } from "@/components/PlaybookView";
import { AuditView } from "@/components/AuditView";
import { ReportsView } from "@/components/ReportsView";
import { PROSPECTS, type Prospect } from "@/lib/prospects";
import { createProspect, fetchProspects } from "@/lib/radarApi";

export type AddProspectResult = "saved" | "session-only";

function App() {
  const [section, setSection] = useState<SectionKey>("dashboard");
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);
  const [outreachInitial, setOutreachInitial] = useState<string | null>(null);
  const [followupInitial, setFollowupInitial] = useState<string | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>(() => PROSPECTS);
  const [persistenceAvailable, setPersistenceAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProspects().then((result) => {
      if (cancelled) return;
      if (result.status === "available") {
        setPersistenceAvailable(true);
        if (result.prospects.length > 0) setProspects(result.prospects);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddProspect = async (prospect: Prospect): Promise<AddProspectResult> => {
    setProspects((current) => [prospect, ...current]);
    const result = await createProspect(prospect);
    if (result.status === "saved") {
      setProspects((current) =>
        current.map((p) => (p.id === prospect.id ? { ...p, ...result.prospect } : p)),
      );
      return "saved";
    }
    return "session-only";
  };

  return (
    <ThemeProvider>
      <Shell section={section} onSection={setSection}>
        {section === "dashboard" && (
          <Dashboard
            prospects={prospects}
            onOpenProspect={setActiveProspect}
            onGoToProspects={() => setSection("prospects")}
          />
        )}
        {section === "prospects" && (
          <ProspectsView
            prospects={prospects}
            onAddProspect={handleAddProspect}
            persistenceAvailable={persistenceAvailable}
            onOpenProspect={setActiveProspect}
          />
        )}
        {section === "outreach" && (
          <OutreachView prospects={prospects} initialProspectId={outreachInitial} />
        )}
        {section === "followups" && (
          <FollowupsView prospects={prospects} initialProspectId={followupInitial} />
        )}
        {section === "reports" && <ReportsView prospects={prospects} />}
        {section === "audit" && <AuditView />}
        {section === "playbook" && <PlaybookView />}
      </Shell>

      <ProspectDrawer
        prospect={activeProspect}
        onClose={() => setActiveProspect(null)}
        onStartOutreach={(p) => {
          setOutreachInitial(p.id);
          setActiveProspect(null);
          setSection("outreach");
        }}
        onStartFollowup={(p) => {
          setFollowupInitial(p.id);
          setActiveProspect(null);
          setSection("followups");
        }}
      />
    </ThemeProvider>
  );
}

export default App;
