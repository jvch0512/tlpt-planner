# TLPT plan: Banco Ejemplo S.A.

Planned attestation 2028-08-13, cycle deadline 2028-01-17: 209 days over.

## Schedule

| Phase | Milestone | Start | End | Basis |
|---|---|---|---|---|
| Preparation | Notification from the TLPT authority (day zero) | 2027-02-01 | 2027-02-01 | RTS Art. 9 |
| Preparation | Initiation documents: project charter, control team lead, planned use of testers, code name | 2027-02-01 | 2027-05-01 | Due within 3 months of notification, RTS Art. 9(2) |
| Preparation | Select threat intelligence and red team providers | 2027-02-01 | 2027-04-12 | Planning assumption: 10 weeks |
| Preparation | Scope specification document submitted and approved | 2027-02-01 | 2027-08-01 | Due within 6 months of notification, RTS Art. 9(6) |
| Preparation | Authority review of the scope specification | 2027-08-01 | 2027-08-22 | Planning assumption: 3 weeks |
| Testing | Threat intelligence phase: targeted threat intelligence report and scenarios | 2027-08-22 | 2027-10-31 | Planning assumption: 10 weeks, RTS Art. 10 |
| Testing | Red team test plan drafted and approved by control team and authority | 2027-10-31 | 2027-11-21 | Planning assumption: 3 weeks, RTS Art. 11(1) |
| Testing | Active red team test on live production, blue team unaware | 2027-11-21 | 2028-02-27 | At least 12 weeks, RTS Art. 11; planned 14 |
| Closure | Red team test report to the control team | 2028-02-27 | 2028-03-26 | Within 4 weeks of the end of active testing, RTS Art. 12(2) |
| Closure | Blue team informed; replay, purple teaming and blue team report | 2028-02-27 | 2028-05-07 | No later than 10 weeks after the end of active testing, RTS Art. 12 |
| Closure | Authority confirms red and blue team reports are complete | 2028-05-07 | 2028-05-21 | Planning assumption: 2 weeks |
| Closure | Summary of findings and remediation plan submitted to the authority | 2028-05-21 | 2028-07-16 | Within 8 weeks of completeness confirmation, RTS Arts. 12 and 13 |
| Closure | TLPT attestation issued by the authority | 2028-07-16 | 2028-08-13 | Planning assumption: 4 weeks, DORA Art. 26(7), RTS Art. 14 |

## Checks (3 blockers, 9 warnings)

- **BLOCKER** Plan finishes after the three-year cycle deadline: Attestation planned 2028-08-13, cycle deadline 2028-01-17 (209 days late). Agree timing with the authority early. (DORA Art. 26(1))
- **BLOCKER** This test must use external testers: Test number 3: entities that use internal testers must contract external testers at least every third test. (DORA Art. 26(8))
- **BLOCKER** CloudCo: contract does not allow testing: Pooled testing is possible: ask the provider to organise a pooled TLPT under the authority's coordination. (DORA Art. 26(4), RTS Arts. 6 and 8)
- **WARNING** AuthSaaS: contract does not allow testing: Agree contractual terms or a pooled test before the scope specification is submitted. (DORA Art. 26(4), RTS Arts. 6 and 8)
- **WARNING** Treasury settlement: no systems mapped: The scope specification must link each function to its underlying ICT systems and processes. (RTS Art. 9(6))
- **WARNING** Open: Risk management plan for live production testing (impact, rollback, data handling): Not yet confirmed in the profile. (RTS Art. 5)
- **WARNING** Open: Threat intelligence provider selected against the qualification criteria: Not yet confirmed in the profile. (DORA Art. 27, RTS Art. 7)
- **WARNING** Open: Red team provider selected against the qualification criteria: Not yet confirmed in the profile. (DORA Art. 27, RTS Art. 7)
- **WARNING** Open: Contracts with testers include confidentiality, liability and data-handling terms: Not yet confirmed in the profile. (DORA Art. 27, RTS Art. 7)
- **WARNING** Open: Backups and restore procedures verified for in-scope systems: Not yet confirmed in the profile. (RTS Art. 5)
- **WARNING** Open: Purple teaming and replay planned for the closure phase: Not yet confirmed in the profile. (RTS Art. 12)
- **WARNING** Open: Remediation owners and budget identified for the findings: Not yet confirmed in the profile. (RTS Art. 13)

Dates marked RTS follow Commission Delegated Regulation (EU) 2025/1190; dates marked assumption are your planning inputs. Verify article references and deadlines against the Official Journal and your authority's instructions before relying on this plan.
