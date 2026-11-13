import { Plan } from "./plan.js";

export function planMarkdown(p: Plan): string {
  const L: string[] = [];
  L.push(`# TLPT plan: ${p.entity}`, "");
  L.push(`Planned attestation ${p.finish}, cycle deadline ${p.cycleDeadline}: ${p.fits ? `${p.marginDays} days of margin` : `${-p.marginDays} days over`}.`, "");
  L.push("## Schedule", "", "| Phase | Milestone | Start | End | Basis |", "|---|---|---|---|---|");
  for (const m of p.milestones) L.push(`| ${m.phase} | ${m.title} | ${m.start} | ${m.end} | ${m.basis} |`);
  const blockers = p.checks.filter((c) => c.level === "blocker");
  const warns = p.checks.filter((c) => c.level === "warning");
  L.push("", `## Checks (${blockers.length} blockers, ${warns.length} warnings)`, "");
  for (const c of p.checks) L.push(`- **${c.level.toUpperCase()}** ${c.title}: ${c.detail} (${c.ref})`);
  L.push("", "Dates marked RTS follow Commission Delegated Regulation (EU) 2025/1190; dates marked assumption are your planning inputs. Verify article references and deadlines against the Official Journal and your authority's instructions before relying on this plan.");
  return L.join("\n") + "\n";
}
