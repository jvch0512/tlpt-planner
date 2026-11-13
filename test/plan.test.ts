import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addMonths, parseDate, iso, DateError } from "../src/dates.js";
import { buildPlan, parseProfile, ProfileError } from "../src/plan.js";
import { planMarkdown } from "../src/report.js";

const load = (n: string) => parseProfile(readFileSync(`examples/${n}`, "utf8"));
const ms = (p: ReturnType<typeof buildPlan>, id: string) => p.milestones.find((m) => m.id === id)!;

test("addMonths clamps to month end", () => {
  assert.equal(iso(addMonths(parseDate("2027-08-31"), 6)), "2028-02-29");
  assert.equal(iso(addMonths(parseDate("2025-01-17"), 36)), "2028-01-17");
});

test("parseDate rejects impossible dates", () => {
  assert.throws(() => parseDate("2027-02-30"), DateError);
  assert.throws(() => parseDate("01/02/2027"), DateError);
});

test("RTS deadlines are derived from the notification date", () => {
  const p = buildPlan(load("bank.json"));
  assert.equal(ms(p, "initiation").end, "2027-05-01");
  assert.equal(ms(p, "ssd").end, "2027-08-01");
});

test("closure windows follow the end of the red team phase", () => {
  const p = buildPlan(load("bank.json"));
  const rt = ms(p, "red-team").end;
  const days = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86400000;
  assert.equal(days(rt, ms(p, "rt-report").end), 28);
  assert.equal(days(rt, ms(p, "purple").end), 70);
});

test("third test with internal testers forces external testers", () => {
  const p = buildPlan(load("bank.json"));
  assert.ok(p.checks.some((c) => c.id === "external-third" && c.level === "blocker"));
});

test("third parties without testing clauses block, pooled option is suggested", () => {
  const p = buildPlan(load("bank.json"));
  const c = p.checks.find((x) => x.id === "tp-CloudCo")!;
  assert.equal(c.level, "blocker");
  assert.match(c.detail, /pooled/i);
  assert.equal(p.checks.find((x) => x.id === "tp-AuthSaaS")!.level, "warning");
});

test("function without systems is flagged", () => {
  assert.ok(buildPlan(load("bank.json")).checks.some((c) => c.id === "cf-Treasury settlement"));
});

test("bank plan overruns the first cycle deadline", () => {
  const p = buildPlan(load("bank.json"));
  assert.equal(p.cycleDeadline, "2028-01-17");
  assert.equal(p.fits, false);
  assert.ok(p.marginDays < 0);
});

test("ready profile fits with no blockers", () => {
  const p = buildPlan(load("ready.json"));
  assert.equal(p.fits, true);
  assert.equal(p.checks.filter((c) => c.level === "blocker").length, 0);
});

test("red team shorter than 12 weeks is a blocker", () => {
  const pr = load("ready.json");
  pr.planning.redTeamWeeks = 10;
  assert.ok(buildPlan(pr).checks.some((c) => c.id === "rt-min" && c.level === "blocker"));
});

test("last test end moves the cycle deadline", () => {
  const pr = load("ready.json");
  pr.lastTlptEnd = "2026-06-30";
  assert.equal(buildPlan(pr).cycleDeadline, "2029-06-30");
});

test("profile validation", () => {
  assert.throws(() => parseProfile("{"), ProfileError);
  assert.throws(() => parseProfile("{}"), ProfileError);
  assert.throws(() => parseProfile(JSON.stringify({ entity: "x", notification: "2027-13-01" })), ProfileError);
  assert.throws(() => parseProfile(JSON.stringify({ entity: "x", notification: "2027-01-01", planning: { tiWeeks: -2 } })), ProfileError);
});

test("markdown lists schedule and checks", () => {
  const md = planMarkdown(buildPlan(load("bank.json")));
  assert.match(md, /## Schedule/); assert.match(md, /blockers/); assert.match(md, /over/);
});
