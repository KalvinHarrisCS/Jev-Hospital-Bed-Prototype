# Demo security and a path to production

I built this as a demo, not a production hospital system. Use made-up patients and notes only. Do not enter real patient information or connect it to a hospital record system. This project has not been assessed for HIPAA compliance or clinical use.

The release is provided as is, without warranties, with liability disclaimed to the extent permitted by applicable law. See the [demo use and liability notice](Demo-Use-and-Liability.md) and [copyright and permissions notice](../../LICENSE).

## What is protected in this demo

- The Docker port is bound to localhost, and the container runs as a non-root user. It uses Wrangler's development server.
- The server checks request origin, limits input size, validates Jev's answer and times out the provider request. API responses use `Cache-Control: no-store`.
- The setup check reports whether a server key exists without returning it. A pasted key stays in this tab's memory; reload clears it. Environment files are excluded from Git and the submission.
- The cleaning log stores only fictional room IDs and start/finish times in this browser. Model answers and timers never release a bed.

These are small safeguards. The app has no staff login, role permissions, audit trail, managed patient database or production monitoring. A same-origin check is not authentication. Browser cleaning storage is editable and is not a trusted hospital record. Docker alone does not make the app secure or HIPAA compliant.

## Where HIPAA needs to be addressed

HIPAA applies to covered entities and business associates handling protected health information. Before a hospital uses an adapted version with electronic PHI, its privacy and security team needs to assess the complete workflow: users, workstations, application, database, logs, backups, hosting and external services. Risk analysis and appropriate administrative, physical and technical safeguards are part of that work. [HHS Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html) and [risk-analysis guidance](https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html).

There is no required HHS HIPAA certification for this app. HHS does not recognize private Security Rule certifications as proof of compliance. I would describe a future deployment as needing a documented compliance evaluation, not add a "HIPAA certified" badge. [HHS certification FAQ](https://www.hhs.gov/hipaa/for-professionals/faq/are-we-required-to-certify-our-organizations-compliance-with-the-standards/index.html).

**The Jev call leaves this computer.** `worker/index.js` sends the submitted note, procedure, pain score and milestone snapshot to TypeSafe over HTTPS. This project has not verified a business associate agreement (BAA) or PHI handling terms for TypeSafe/Jev or any hosting service. Do not send PHI through this demo. Where a provider creates, receives, maintains or transmits ePHI on a covered entity's behalf, appropriate BAAs and the rest of the HIPAA requirements must be addressed before use. HTTPS and an API key do not replace that review. [HHS cloud guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html).

## What I would update and where

These are proposed changes, not features already built.

| Area | Where I would change it | What needs to happen before real use |
|---|---|---|
| Staff access | `worker/index.js`, before serving records or handling `/api/jev` and `/api/config` | Add hospital identity, individual accounts, role checks on every protected request, session controls and appropriate MFA. |
| Patient and bed records | Replace the `beds` fixture array in `worker/index.js`; add a backend data layer | Use an approved hospital integration and protected database, with validated updates, access controls and minimum necessary data. Keep model output separate from staff-approved bed state. |
| Model and secrets | The provider request and `questions` in `worker/index.js`; deployment secret configuration | Review provider agreements, retention and access; use managed server-side secrets and rotation; remove browser key entry from the staff workflow; add rate limits and spending controls. |
| Cleaning and audit records | Replace browser storage in `worker/cleaning.js`; add server endpoints | Record authenticated staff actions, departure, cleaning and release times in shared storage. Protect audit records and define retention. Add safe concurrency and clock handling. |
| Deployment | `container/Dockerfile`, `container/compose.yaml`, and a new production deployment configuration | Replace the development server, enforce HTTPS, review network access, encrypt stored data and backups, restrict secrets access, patch dependencies and monitor failures. |
| Reliability and clinical workflow | `scripts/` and a hospital-approved validation plan | Test permissions, failure modes, restore procedures and integrations. Evaluate the model with approved data and staff review. Keep discharge and bed release under authorized staff control. |
| Policies and operations | Hospital procedures outside this small app | Assign privacy/security owners, train users, control workstation access and establish incident response, breach handling and recovery procedures. |

The hospital's team should evaluate the finished deployment before any real patient use. This table is a starting plan, not a complete HIPAA checklist or a compliance claim. For safe changes to the fictional demo, start with [Make it your own](Customization.md).
