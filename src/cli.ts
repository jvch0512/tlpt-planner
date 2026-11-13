#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { DateError } from "./dates.js";
import { buildPlan, parseProfile, ProfileError } from "./plan.js";
import { planMarkdown } from "./report.js";

const USAGE = `tlpt-planner

  tlpt-planner plan <profile.json> [--json]

Exit codes: 0 plan fits and no blockers, 1 blockers or the plan overruns the cycle deadline, 2 bad input.`;

function main(argv: string[]): number {
  const [cmd, file] = argv;
  if (cmd !== "plan" || !file) { console.error(USAGE); return 2; }
  try {
    const plan = buildPlan(parseProfile(readFileSync(file, "utf8")));
    process.stdout.write(argv.includes("--json") ? JSON.stringify(plan, null, 2) + "\n" : planMarkdown(plan));
    return !plan.fits || plan.checks.some((c) => c.level === "blocker") ? 1 : 0;
  } catch (e) {
    if (e instanceof ProfileError || e instanceof DateError || (e as NodeJS.ErrnoException).code === "ENOENT") { console.error(`error: ${(e as Error).message}`); return 2; }
    throw e;
  }
}

process.exitCode = main(process.argv.slice(2));
