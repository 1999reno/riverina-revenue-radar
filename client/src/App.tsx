import { useState } from "react";
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
import type { Prospect } from "@/lib/prospects";

function App() {
  const [section, setSection] = useState<SectionKey>("dashboard");
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);
  const [outreachInitial, setOutreachInitial] = useState<string | null>(null);
  const [followupInitial, setFollowupInitial] = useState<string | null>(null);

  return (
    <ThemeProvider>
      <Shell section={section} onSection={setSection}>
        {section === "dashboard" && (
          <Dashboard
            onOpenProspect={setActiveProspect}
            onGoToProspects={() => setSection("prospects")}
          />
        )}
        {section === "prospects" && (
          <ProspectsView onOpenProspect={setActiveProspect} />
        )}
        {section === "outreach" && (
          <OutreachView initialProspectId={outreachInitial} />
        )}
        {section === "followups" && (
          <FollowupsView initialProspectId={followupInitial} />
        )}
        {section === "reports" && <ReportsView />}
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
