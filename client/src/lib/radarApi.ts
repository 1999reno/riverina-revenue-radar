import type { Prospect } from "./prospects";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

const PROSPECTS_PATH = "/api/admin/radar/prospects";
const SCRIPTS_PATH = "/api/admin/radar/outreach-scripts";

export type OutreachScriptOverride = {
  prospectId: string;
  buyerTitle: string;
  emailSubject: string;
  emailBody: string;
  phoneOpener: string;
  linkedInNote: string;
  updatedAt?: string;
};

export type ApiAvailability = "available" | "unavailable";

const isJson = (res: Response) =>
  (res.headers.get("content-type") || "").toLowerCase().includes("application/json");

const safeFetch = async (input: string, init?: RequestInit): Promise<Response | null> => {
  try {
    return await fetch(`${API_BASE}${input}`, init);
  } catch {
    return null;
  }
};

export const fetchProspects = async (): Promise<
  { status: "available"; prospects: Prospect[] } | { status: "unavailable" }
> => {
  const res = await safeFetch(PROSPECTS_PATH, { method: "GET" });
  if (!res || !res.ok || !isJson(res)) return { status: "unavailable" };
  try {
    const data = await res.json();
    if (!Array.isArray(data)) return { status: "unavailable" };
    return { status: "available", prospects: data as Prospect[] };
  } catch {
    return { status: "unavailable" };
  }
};

export const createProspect = async (
  prospect: Prospect,
): Promise<{ status: "saved"; prospect: Prospect } | { status: "session-only" }> => {
  const res = await safeFetch(PROSPECTS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prospect),
  });
  if (!res || !res.ok) return { status: "session-only" };
  if (!isJson(res)) return { status: "saved", prospect };
  try {
    const data = (await res.json()) as Prospect;
    return { status: "saved", prospect: { ...prospect, ...data } };
  } catch {
    return { status: "saved", prospect };
  }
};

export const fetchOutreachScript = async (
  prospectId: string,
  buyerTitle: string,
): Promise<
  | { status: "available"; override: OutreachScriptOverride | null }
  | { status: "unavailable" }
> => {
  const url = `${SCRIPTS_PATH}?prospectId=${encodeURIComponent(prospectId)}&buyerTitle=${encodeURIComponent(buyerTitle)}`;
  const res = await safeFetch(url, { method: "GET" });
  if (!res || !isJson(res)) return { status: "unavailable" };
  if (res.status === 404) return { status: "available", override: null };
  if (!res.ok) return { status: "unavailable" };
  try {
    const data = await res.json();
    if (!data || typeof data !== "object") return { status: "available", override: null };
    return { status: "available", override: data as OutreachScriptOverride };
  } catch {
    return { status: "unavailable" };
  }
};

export const saveOutreachScript = async (
  override: OutreachScriptOverride,
): Promise<{ status: "saved"; override: OutreachScriptOverride } | { status: "session-only" }> => {
  const res = await safeFetch(SCRIPTS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(override),
  });
  if (!res || !res.ok) return { status: "session-only" };
  if (!isJson(res)) return { status: "saved", override };
  try {
    const data = (await res.json()) as OutreachScriptOverride;
    return { status: "saved", override: { ...override, ...data } };
  } catch {
    return { status: "saved", override };
  }
};
