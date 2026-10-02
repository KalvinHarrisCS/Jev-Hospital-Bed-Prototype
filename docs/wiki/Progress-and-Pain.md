# Progress Milestones and Pain

I wanted the progress fields to show what staff assessed and what the patient reported. Missing information stays unknown. The current app shows a fixed milestone count; the detailed fields below are a plan for a larger version.

## Pain ratings: the custom 1–5 project scale

This is a deliberately simplified simulation scale requested for this project. It is not presented as a validated clinical pain instrument, and it has no automatic conversion to another pain scale.

The patient reports their pain; the nurse records the report, the project's category, the time, and any effect on activities. A nurse's observation can be recorded separately. Do not replace a patient's report with a model-inferred rating.

| Rating | Fictional category | Example of what is recorded |
|---|---|---|
| 1 | None or minimal | Patient reports little or no discomfort |
| 2 | Mild | Patient reports discomfort with little effect on activities |
| 3 | Moderate | Patient reports discomfort affecting some activities |
| 4 | Severe | Patient reports substantial discomfort or difficulty moving |
| 5 | Very severe | Patient reports intense discomfort or inability to do usual recovery activities |
| `unknown` | Not recorded | No current rating is available; never substitute 1 |

Record pain at rest and during movement separately when available. Keep previous assessments so the display can show improving, unchanged, or worsening reports. Reassessment timing is set by staff; this file does not prescribe an interval.

For the demonstration, a rating of 4–5, a worsening report, or a pain-related activity limitation flags the forecast for staff review. This is an **invented workflow rule**, not a clinical threshold. It does not automatically add a fixed number of hours or days. Ratings of 1–3 do not automatically mean the patient can leave.

Pain can affect movement and recovery activities, but those effects and discharge readiness require assessment. [UCLH recovery guidance](https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/preparing-gynaecology-surgery-and-your-recovery)

## Patient progress milestones

Each milestone has `met`, `not_met`, `unknown`, or `not_applicable`, plus `assessed_at`, `recorded_by`, and an optional note. The treating team selects which milestones apply. These are fields for tracking their assessments, not a universal checklist that independently authorizes discharge.

| ID | Milestone | What the project records |
|---|---|---|
| `M01` | Post-anesthesia assessment completed | Staff assessment and any ongoing monitoring requirement |
| `M02` | Observations reviewed | Whether staff have reviewed current observations and unresolved concerns |
| `M03` | Pain plan assessed | Patient-reported pain and whether staff consider the current plan suitable for discharge |
| `M04` | Oral intake assessed | Whether eating/drinking meets this patient's care plan; note nausea/vomiting if documented |
| `M05` | Mobility assessed | Whether movement meets the care team's plan, including assistance needs |
| `M06` | Bladder plan assessed | Urination assessment or an approved catheter discharge plan |
| `M07` | Bleeding/wound assessment completed | Staff review and whether a concern is still unresolved |
| `M08` | Bowel recovery assessed, when applicable | Surgical team's assessment against the individual bowel-care plan |
| `M09` | Complication review completed, when applicable | Relevant team has assessed the complication and recorded the current plan |
| `M10` | Discharge information prepared | Instructions, medication arrangements, and follow-up plan recorded |
| `M11` | Departure arrangements ready | Transport/home support and any documented discharge coordination dependencies |
| `M12` | Discharge authorized | Explicit authorization by the responsible clinician/team |
| `M13` | Patient actually left this bed | Observed departure/transfer time; begins this bed's turnaround process |

Mobility, oral intake, pain management, bladder assessment, and home arrangements appear in published recovery guidance. The numbered grouping here is our own project design. A catheter discharge plan can be appropriate; the project must not require catheter removal in every case. [UCLH recovery guidance](https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/preparing-gynaecology-surgery-and-your-recovery), [RCOG vaginal hysterectomy](https://www.rcog.org.uk/for-the-public/browse-our-patient-information/vaginal-hysterectomy-recovering-well/)

### Procedure-specific additions

- **Cesarean section:** track maternal recovery and any documented coordination with newborn care. Store maternal and newborn readiness separately; one does not prove the other. The newborn has a separate patient record, not a gynecology bed record.
- **Hysterectomy/myomectomy:** staff select applicable bladder, wound/bleeding, mobility, oral-intake, and pain-plan milestones.
- **Day-case procedures:** staff select relevant post-anesthesia milestones and escort arrangements. Do not count these as overnight inpatient beds.
- **Planned bowel surgery or bowel injury:** add the individual surgical team's bowel-care milestones and an explicit complication review when applicable. Do not infer bowel recovery from pain alone.

These additions are simulation fields. Detailed clinical criteria belong to the treating team's care plan.
