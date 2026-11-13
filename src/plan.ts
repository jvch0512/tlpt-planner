import { addDays, addMonths, addWeeks, daysBetween, iso, parseDate } from "./dates.js";

export class ProfileError extends Error {}

export interface ThirdParty { name: string; critical: boolean; inScope: boolean; contractAllowsTesting: boolean; pooledTestingPossible: boolean }
export interface CriticalFunction { name: string; systems: string[]; thirdParties: string[] }
export interface Profile {
  entity: string;
  notification: string;
  lastTlptEnd: string | null;
  cycleDeadlineOverride: string | null;
  completedTests: number;
  internalTesters: boolean;
  criticalFunctions: CriticalFunction[];
  thirdParties: ThirdParty[];
  readiness: Record<string, boolean>;
  planning: { procurementWeeks: number; tiWeeks: number; redTeamWeeks: number; approvalWeeks: number; attestationWeeks: number };
}

export interface Milestone { id: string; phase: "Preparation" | "Testing" | "Closure"; title: string; start: string; end: string; kind: "rts" | "assumption"; basis: string }
export interface Check { id: string; level: "blocker" | "warning" | "ok"; title: string; detail: string; ref: string }
export interface Plan { entity: string; milestones: Milestone[]; checks: Check[]; cycleDeadline: string; finish: string; marginDays: number; fits: boolean }

export const READINESS: { key: string; title: string; ref: string }[] = [
  { key: "controlTeamLead", title: "Control team lead appointed with authority over the test", ref: "RTS Art. 4, 9(2)" },
  { key: "projectCharter", title: "Project charter drafted (scope, governance, code name, communication channels)", ref: "RTS Art. 9(2), Annex I" },
  { key: "riskManagementPlan", title: "Risk management plan for live production testing (impact, rollback, data handling)", ref: "RTS Art. 5" },
  { key: "tiProviderProcured", title: "Threat intelligence provider selected against the qualification criteria", ref: "DORA Art. 27, RTS Art. 7" },
  { key: "redTeamProcured", title: "Red team provider selected against the qualification criteria", ref: "DORA Art. 27, RTS Art. 7" },
  { key: "legalReviewDone", title: "Contracts with testers include confidentiality, liability and data-handling terms", ref: "DORA Art. 27, RTS Art. 7" },
  { key: "criticalFunctionsMapped", title: "Critical or important functions mapped to systems and ICT third parties", ref: "RTS Art. 9(6), Annex II" },
  { key: "blueTeamIsolated", title: "Blue team kept unaware; need-to-know list of the control team is closed", ref: "RTS Art. 4, 11" },
  { key: "backupsVerified", title: "Backups and restore procedures verified for in-scope systems", ref: "RTS Art. 5" },
  { key: "purpleTeamPlanned", title: "Purple teaming and replay planned for the closure phase", ref: "RTS Art. 12" },
  { key: "remediationOwners", title: "Remediation owners and budget identified for the findings", ref: "RTS Art. 13" },
];

function obj(v: unknown, what: string): Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new ProfileError(`${what} must be an object`);
  return v as Record<string, unknown>;
}
const str = (v: unknown, what: string): string => { if (typeof v !== "string" || !v.trim()) throw new ProfileError(`${what} must be a non-empty string`); return v; };
const bool = (v: unknown, d: boolean): boolean => (typeof v === "boolean" ? v : d);
const num = (v: unknown, d: number, what: string, min = 1): number => {
  if (v === undefined) return d;
  if (typeof v !== "number" || !Number.isFinite(v) || v < min) throw new ProfileError(`${what} must be a number >= ${min}`);
  return v;
};

export function parseProfile(text: string): Profile {
  let j: unknown;
  try { j = JSON.parse(text); } catch { throw new ProfileError("profile is not valid JSON"); }
  const o = obj(j, "profile");
  const notification = str(o["notification"], "notification");
  try { parseDate(notification, "notification"); } catch (e) { throw new ProfileError((e as Error).message); }
  const last = o["lastTlptEnd"];
  if (last !== undefined && last !== null) { try { parseDate(str(last, "lastTlptEnd"), "lastTlptEnd"); } catch (e) { throw new ProfileError((e as Error).message); } }
  const cfs = Array.isArray(o["criticalFunctions"]) ? o["criticalFunctions"] : [];
  const tps = Array.isArray(o["thirdParties"]) ? o["thirdParties"] : [];
  const pl = o["planning"] === undefined ? {} : obj(o["planning"], "planning");
  const rd = o["readiness"] === undefined ? {} : obj(o["readiness"], "readiness");
  return {
    entity: str(o["entity"], "entity"),
    notification,
    lastTlptEnd: typeof last === "string" ? last : null,
    cycleDeadlineOverride: typeof o["cycleDeadline"] === "string" ? (parseDate(o["cycleDeadline"], "cycleDeadline"), o["cycleDeadline"]) : null,
    completedTests: num(o["completedTests"], 0, "completedTests", 0),
    internalTesters: bool(o["internalTesters"], false),
    criticalFunctions: cfs.map((c, i) => { const r = obj(c, `criticalFunctions[${i}]`); return { name: str(r["name"], `criticalFunctions[${i}].name`), systems: Array.isArray(r["systems"]) ? r["systems"].map(String) : [], thirdParties: Array.isArray(r["thirdParties"]) ? r["thirdParties"].map(String) : [] }; }),
    thirdParties: tps.map((t, i) => { const r = obj(t, `thirdParties[${i}]`); return { name: str(r["name"], `thirdParties[${i}].name`), critical: bool(r["critical"], false), inScope: bool(r["inScope"], true), contractAllowsTesting: bool(r["contractAllowsTesting"], false), pooledTestingPossible: bool(r["pooledTestingPossible"], false) }; }),
    readiness: Object.fromEntries(Object.entries(rd).map(([k, v]) => [k, v === true])),
    planning: {
      procurementWeeks: num(pl["procurementWeeks"], 10, "planning.procurementWeeks"),
      tiWeeks: num(pl["tiWeeks"], 10, "planning.tiWeeks"),
      redTeamWeeks: num(pl["redTeamWeeks"], 14, "planning.redTeamWeeks"),
      approvalWeeks: num(pl["approvalWeeks"], 3, "planning.approvalWeeks"),
      attestationWeeks: num(pl["attestationWeeks"], 4, "planning.attestationWeeks"),
    },
  };
}

export function cycleDeadline(p: Profile): Date {
  // DORA Art. 26(1): at least every three years. Without a previous test, counted from the DORA application date (17 Jan 2025); authorities may set another date.
  if (p.cycleDeadlineOverride) return parseDate(p.cycleDeadlineOverride);
  return p.lastTlptEnd ? addMonths(parseDate(p.lastTlptEnd), 36) : addMonths(parseDate("2025-01-17"), 36);
}

export function buildPlan(p: Profile): Plan {
  const T = parseDate(p.notification, "notification");
  const pl = p.planning;
  const m: Milestone[] = [];
  const add = (id: string, phase: Milestone["phase"], title: string, s: Date, e: Date, kind: Milestone["kind"], basis: string) => m.push({ id, phase, title, start: iso(s), end: iso(e), kind, basis });

  const initDue = addMonths(T, 3);
  const ssdDue = addMonths(T, 6);
  add("notify", "Preparation", "Notification from the TLPT authority (day zero)", T, T, "rts", "RTS Art. 9");
  add("initiation", "Preparation", "Initiation documents: project charter, control team lead, planned use of testers, code name", T, initDue, "rts", "Due within 3 months of notification, RTS Art. 9(2)");
  const procEnd = addWeeks(T, pl.procurementWeeks);
  add("procurement", "Preparation", "Select threat intelligence and red team providers", T, procEnd, "assumption", `Planning assumption: ${pl.procurementWeeks} weeks`);
  add("ssd", "Preparation", "Scope specification document submitted and approved", T, ssdDue, "rts", "Due within 6 months of notification, RTS Art. 9(6)");
  const approved = addWeeks(ssdDue, pl.approvalWeeks);
  add("ssd-approval", "Preparation", "Authority review of the scope specification", ssdDue, approved, "assumption", `Planning assumption: ${pl.approvalWeeks} weeks`);
  const tiEnd = addWeeks(approved, pl.tiWeeks);
  add("ti", "Testing", "Threat intelligence phase: targeted threat intelligence report and scenarios", approved, tiEnd, "assumption", `Planning assumption: ${pl.tiWeeks} weeks, RTS Art. 10`);
  const planEnd = addWeeks(tiEnd, pl.approvalWeeks);
  add("rt-plan", "Testing", "Red team test plan drafted and approved by control team and authority", tiEnd, planEnd, "assumption", `Planning assumption: ${pl.approvalWeeks} weeks, RTS Art. 11(1)`);
  const rtEnd = addWeeks(planEnd, pl.redTeamWeeks);
  add("red-team", "Testing", "Active red team test on live production, blue team unaware", planEnd, rtEnd, "rts", `At least 12 weeks, RTS Art. 11; planned ${pl.redTeamWeeks}`);
  const rtReport = addWeeks(rtEnd, 4);
  add("rt-report", "Closure", "Red team test report to the control team", rtEnd, rtReport, "rts", "Within 4 weeks of the end of active testing, RTS Art. 12(2)");
  const purpleEnd = addWeeks(rtEnd, 10);
  add("purple", "Closure", "Blue team informed; replay, purple teaming and blue team report", rtEnd, purpleEnd, "rts", "No later than 10 weeks after the end of active testing, RTS Art. 12");
  const confirmed = addWeeks(purpleEnd, 2);
  add("confirm", "Closure", "Authority confirms red and blue team reports are complete", purpleEnd, confirmed, "assumption", "Planning assumption: 2 weeks");
  const summaryEnd = addWeeks(confirmed, 8);
  add("summary", "Closure", "Summary of findings and remediation plan submitted to the authority", confirmed, summaryEnd, "rts", "Within 8 weeks of completeness confirmation, RTS Arts. 12 and 13");
  const attest = addWeeks(summaryEnd, pl.attestationWeeks);
  add("attestation", "Closure", "TLPT attestation issued by the authority", summaryEnd, attest, "assumption", `Planning assumption: ${pl.attestationWeeks} weeks, DORA Art. 26(7), RTS Art. 14`);

  const deadline = cycleDeadline(p);
  const margin = daysBetween(attest, deadline);
  const checks: Check[] = [];
  const c = (id: string, level: Check["level"], title: string, detail: string, ref: string) => checks.push({ id, level, title, detail, ref });

  if (pl.redTeamWeeks < 12) c("rt-min", "blocker", "Red team phase shorter than the minimum", `Planned ${pl.redTeamWeeks} weeks, the RTS requires at least 12.`, "RTS Art. 11");
  if (pl.procurementWeeks * 7 > daysBetween(T, ssdDue) - 28) c("procurement-late", "warning", "Provider selection leaves little time before the scope document", `${pl.procurementWeeks} weeks of procurement against a 6 month window; providers should be on board to help scope.`, "RTS Art. 7, 9");
  if (margin < 0) c("cycle", "blocker", "Plan finishes after the three-year cycle deadline", `Attestation planned ${iso(attest)}, cycle deadline ${iso(deadline)} (${-margin} days late). Agree timing with the authority early.`, "DORA Art. 26(1)");
  else if (margin < 90) c("cycle", "warning", "Less than 90 days of slack before the cycle deadline", `Attestation ${iso(attest)}, deadline ${iso(deadline)} (${margin} days of margin).`, "DORA Art. 26(1)");
  else c("cycle", "ok", "Plan fits inside the three-year cycle", `${margin} days of margin before ${iso(deadline)}.`, "DORA Art. 26(1)");

  const next = p.completedTests + 1;
  if (p.internalTesters && next % 3 === 0) c("external-third", "blocker", "This test must use external testers", `Test number ${next}: entities that use internal testers must contract external testers at least every third test.`, "DORA Art. 26(8)");
  else if (p.internalTesters) c("internal", "warning", "Internal testers need authority approval and independence", `Test number ${next}. Document independence from the control team and from the blue team; the next external-tester test is number ${next + (3 - (next % 3))}.`, "DORA Art. 26(8), RTS Art. 15");

  const fnTps = new Set(p.criticalFunctions.flatMap((f) => f.thirdParties));
  for (const t of p.thirdParties) {
    const touches = t.inScope || fnTps.has(t.name);
    if (!touches) continue;
    if (!t.contractAllowsTesting) c(`tp-${t.name}`, t.critical ? "blocker" : "warning", `${t.name}: contract does not allow testing`, t.pooledTestingPossible ? "Pooled testing is possible: ask the provider to organise a pooled TLPT under the authority's coordination." : "Agree contractual terms or a pooled test before the scope specification is submitted.", "DORA Art. 26(4), RTS Arts. 6 and 8");
    else if (t.pooledTestingPossible) c(`tp-${t.name}`, "ok", `${t.name}: testing allowed, pooled option available`, "Consider a pooled TLPT to avoid testing shared infrastructure repeatedly.", "RTS Art. 8");
  }
  for (const f of p.criticalFunctions) if (f.systems.length === 0) c(`cf-${f.name}`, "warning", `${f.name}: no systems mapped`, "The scope specification must link each function to its underlying ICT systems and processes.", "RTS Art. 9(6)");
  if (p.criticalFunctions.length === 0) c("cf-none", "warning", "No critical or important functions listed", "The authority expects the scope specification to list them with their ICT systems and third parties.", "RTS Art. 9(6)");

  for (const r of READINESS) if (p.readiness[r.key] !== true) c(`ready-${r.key}`, "warning", `Open: ${r.title}`, "Not yet confirmed in the profile.", r.ref);

  const order = { blocker: 0, warning: 1, ok: 2 } as const;
  checks.sort((a, b) => order[a.level] - order[b.level]);
  return { entity: p.entity, milestones: m, checks, cycleDeadline: iso(deadline), finish: iso(attest), marginDays: margin, fits: margin >= 0 };
}
