import { buildPlan, parseProfile } from "/lib/plan.js";
import { planMarkdown } from "/lib/report.js";

const $ = (id) => document.getElementById(id);
function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
function table(headers, rows, classes = []) {
  const t = document.createElement("table");
  const h = document.createElement("tr");
  headers.forEach((x) => h.append(el("th", x)));
  t.append(h);
  rows.forEach((r) => { const tr = document.createElement("tr"); r.forEach((c, i) => tr.append(el("td", String(c), classes[i] ? classes[i](c) : undefined))); t.append(tr); });
  return t;
}
function cards(items) {
  const box = el("div", undefined, "cards");
  for (const [label, value, cls] of items) { const c = el("div", undefined, `card ${cls ?? ""}`); c.append(el("b", String(value)), el("span", label)); box.append(c); }
  return box;
}
function panel(title, ...kids) { const p = el("div", undefined, "panel"); p.append(el("h2", title), ...kids); return p; }
function copyButton(getMd) {
  const b = el("button", "Copy markdown");
  b.type = "button";
  b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(getMd()); b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy markdown"; }, 1500); } catch { /* clipboard blocked */ } });
  return b;
}
function downloadButton(getMd, name) {
  const b = el("button", "Download .md");
  b.type = "button";
  b.addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([getMd()], { type: "text/markdown" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); });
  return b;
}
async function sample(name) { return (await fetch(`/examples/${name}`)).text(); }
function showError(box, e) { box.replaceChildren(el("p", String(e.message ?? e), "err")); }
function setupTabs() {
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".tab").forEach((s) => { s.hidden = s.id !== `p-${b.dataset.tab}`; });
  }));
}
const cls = (map) => (v) => map[v] ?? "";


function run() {
  const out = $("out");
  out.replaceChildren();
  const t = $("profile").value.trim();
  if (!t) return;
  try {
    const p = buildPlan(parseProfile(t));
    const md = planMarkdown(p);
    const blockers = p.checks.filter((c) => c.level === "blocker").length;
    const warns = p.checks.filter((c) => c.level === "warning").length;
    out.append(cards([["Attestation", p.finish], ["Cycle deadline", p.cycleDeadline], ["Margin", `${p.marginDays} d`, p.fits ? "ok" : "bad"], ["Blockers", blockers, blockers ? "bad" : "ok"], ["Warnings", warns, warns ? "warn" : "ok"]]));
    const lo = Date.parse(p.milestones[0].start), hi = Math.max(Date.parse(p.finish), Date.parse(p.cycleDeadline));
    const span = Math.max(1, hi - lo);
    const gantt = el("div");
    for (const m of p.milestones) {
      const row = el("div");
      row.append(el("small", `${m.title} (${m.start} to ${m.end})`));
      const bar = el("span", undefined, m.kind === "rts" ? "bar" : "bar after");
      bar.style.marginLeft = `${((Date.parse(m.start) - lo) / span) * 100}%`;
      bar.style.width = `${Math.max(1, ((Date.parse(m.end) - Date.parse(m.start)) / span) * 100)}%`;
      row.append(bar);
      gantt.append(row);
    }
    out.append(panel("Timeline (blue: set by the RTS, green: your planning assumption)", gantt));
    out.append(panel("Schedule", table(["Phase", "Milestone", "Start", "End", "Basis"], p.milestones.map((m) => [m.phase, m.title, m.start, m.end, m.basis]))));
    out.append(panel("Checks", table(["Level", "Check", "Detail", "Reference"], p.checks.map((c) => [c.level, c.title, c.detail, c.ref]), [cls({ blocker: "s-high", warning: "s-medium", ok: "s-low" })])));
    const row = el("div", undefined, "row");
    row.append(copyButton(() => md), downloadButton(() => md, "tlpt-plan.md"));
    out.append(row);
  } catch (e) { showError(out, e); }
}

for (const b of document.querySelectorAll("[data-sample]")) b.addEventListener("click", async () => { $("profile").value = await sample(b.dataset.sample); run(); });
$("profile").addEventListener("input", run);
