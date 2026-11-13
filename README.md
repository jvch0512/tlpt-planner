# tlpt-planner

Plan a DORA threat-led penetration test (TLPT). Give it the notification date and your situation and it produces a dated schedule built on the phases of Commission Delegated Regulation (EU) 2025/1190, a readiness checklist and cycle checks. Zero runtime dependencies. CLI and browser tool.

Live demo: https://jvch0512.github.io/tlpt-planner/ (runs in the tab, nothing is uploaded)

## Why

A TLPT runs for well over a year and has hard deadlines that start the day the authority notifies you. Teams discover late that a critical cloud provider has no testing clause, that the third test must use external testers, or that the plan overruns the three-year cycle. tlpt-planner shows that on day one.

## Quick start

```bash
npm install
npm test
node dist/src/cli.js plan examples/bank.json     # exit 1: blockers and a plan 209 days over the cycle
node dist/src/cli.js plan examples/ready.json    # exit 0
npm start                                        # UI on http://127.0.0.1:8787
```

## What it models

| Milestone | Source | Type |
|---|---|---|
| Initiation documents within 3 months of notification | RTS Art. 9(2) | rule |
| Scope specification document within 6 months | RTS Art. 9(6) | rule |
| Active red team test of at least 12 weeks | RTS Art. 11 | rule (planned length is yours, below 12 is a blocker) |
| Red team report within 4 weeks of the end of testing | RTS Art. 12 | rule |
| Blue team report, replay and purple teaming within 10 weeks | RTS Art. 12 | rule |
| Summary and remediation plan within 8 weeks of the authority confirming completeness | RTS Arts. 12, 13 | rule |
| Procurement, authority reviews, threat intelligence duration, attestation lead time | planning block | assumption |
| Test at least every three years | DORA Art. 26(1) | rule |

Checks also cover the external-tester obligation at least every third test when you use internal testers, ICT third parties without a testing clause (with the pooled testing option), functions without mapped systems, and 11 readiness items tied to RTS articles.

## Profile

See `examples/bank.json`. Optional `cycleDeadline` overrides the computed deadline when your authority has set one. Without a previous test the deadline is counted three years from 17 January 2025, which is an indicative reading, confirm it with your authority.

## Limits

Planning aid, not legal advice. Article references and deadlines come from the published RTS as summarised by secondary sources; verify them against the Official Journal and your TLPT authority's instructions. Whether you are required to perform TLPT at all is decided by your authority under RTS Art. 2, not by this tool.

## License

MIT
