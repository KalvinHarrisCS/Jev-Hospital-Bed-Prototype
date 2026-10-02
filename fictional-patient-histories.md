# OB/GYN bed availability: fictional patient histories and milestones

Prepared: October 1, 2026  
Project: basic hospital bed availability demonstration using TypeSafe AI's Jev

## What this file contains

A small collection of **entirely fictional patients**, published hospital-stay references, a custom nurse-recorded 1–5 pain scale, progress milestones, and examples of how a bed forecast changes. There are no real patient records here.

Published ranges describe typical stays in specific care settings; they are not measured historical averages for our fictional hospital. The selected starting times and every patient outcome below are simulation assumptions. This file supports a learning prototype, not clinical discharge decisions.

The project answers: **When might this particular bed become free, and when is it actually ready for another patient?** Hospital stay and full recovery at home are different time periods.

## 1. Published background and selected simulation starting times

These references mainly cover UK care pathways, with a US reference also included for cesarean birth. Practices vary by hospital, surgical route, complexity, and patient circumstances. Do not combine these references into a single claimed population average.

| Procedure ID | Procedure | Published hospital-stay guidance | Selected simulation starting time | Reference |
|---|---|---|---|---|
| `CS` | Cesarean section / C-section | US MedlinePlus: usually 2–3 days; UK NHS: usually 1–2 days | 48 hours / 2 days | [MedlinePlus](https://medlineplus.gov/ency/patientinstructions/000620.htm), [NHS](https://www.nhs.uk/tests-and-treatments/caesarean-section/recovery/) |
| `AH` | Abdominal hysterectomy | Most patients can go home 2–4 days after surgery | 72 hours / 3 days | [RCOG abdominal hysterectomy](https://www.rcog.org.uk/for-the-public/browse-our-patient-information/abdominal-hysterectomy-recovering-well/) |
| `LH` | Laparoscopic hysterectomy | Discharge may be within 24 hours; some patients stay 1–3 days | 48 hours / 2 days | [RCOG laparoscopic hysterectomy](https://www.rcog.org.uk/for-the-public/browse-our-patient-information/laparoscopic-hysterectomy-recovering-well/) |
| `VH` | Vaginal hysterectomy | Discharge may be within 24 hours; some patients stay 2–3 days | 48 hours / 2 days | [RCOG vaginal hysterectomy](https://www.rcog.org.uk/for-the-public/browse-our-patient-information/vaginal-hysterectomy-recovering-well/) |
| `LM` | Laparoscopic myomectomy: fibroid removal | UCLH describes same-day or following-day discharge | 24 hours / 1 day | [UCLH fibroids](https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/fibroids) |
| `OM` | Open myomectomy | UCLH describes 1–3 nights | 48 hours / 2 days; nights are not exact 24-hour blocks | [UCLH fibroids](https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/fibroids) |
| `OC` | Laparoscopic ovarian cyst removal | Same-day or following-day discharge is described for keyhole removal; open surgery can require several days | 24 hours / 1 day; keyhole cases only | [NHS 111 Wales ovarian cyst](https://111.wales.nhs.uk/ovariancyst/?locale=en) |
| `DL` | Diagnostic gynecologic laparoscopy | Usually a day case, with discharge after postoperative assessment | 6 hours; an invented day-case allocation, not a published average | [RCOG laparoscopy](https://www.rcog.org.uk/for-the-public/browse-our-patient-information/laparoscopy-recovering-well/) |
| `HY` | Diagnostic hysteroscopy | Usually same-day discharge; anesthesia can require additional observation | 4 hours; an invented day-case allocation, not a published average | [NHS inform hysteroscopy](https://www.nhsinform.scot/tests-and-treatments/non-surgical-procedures/hysteroscopy/) |
| `EB` | Complex endometriosis surgery with planned bowel surgery | Norfolk and Norwich describes 3–10 days in uncomplicated cases involving bowel surgery | 120 hours / 5 days | [NNUH complex endometriosis leaflet](https://www.nnuh.nhs.uk/wp-content/uploads/2023/11/Surgery-for-Complex-Endometriosis23439.1.pdf) |

### Bowel injury is a separate complication

Keep `bowel_injury` separate from the planned-bowel-surgery procedure `EB`. A complication can occur during an otherwise different operation, including a C-section in our invented scenarios.

The sources above do **not** establish a universal five-day stay after bowel injury. Repair type, further surgery, and postoperative progress affect the course. One NHS provider explains that bowel injury may require keyhole repair, open surgery, or stoma formation. [Worcestershire Acute Hospitals](https://www.worcsacute.nhs.uk/leaflets/endometriosis-deep-disease/)

We include your **five-day example as a fictional outcome**, alongside an eight-day outcome to show variability. For a current patient with this complication, the departure estimate must come from the treating team's entered plan. Feeling better and a lower pain score alone do not clear the patient for discharge.

## 2. Pain ratings: the custom 1–5 project scale

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

## 3. Patient progress milestones

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

## 4. Fictional completed patient histories

**All rows are invented.** They are examples for testing the application, not real historical evidence and not a training dataset that validates a predictor.

`baseline_h` is the selected starting time from section 1. `actual_bed_h` is invented elapsed time from assignment to the modeled postoperative bed until the patient physically leaves it. For simplicity, the mock assignment is at surgery completion; a real application must record these events separately. Published postoperative hospital stay is not necessarily the occupancy time of one bed.

Pain columns are nurse-recorded fictional reports at three assessments: first, later reassessment, and before departure. The detailed examples below supply the assessment times for selected rows. No claim is made that these three columns are daily readings.

| Patient ID | Procedure | Bed class | Baseline h | Actual bed h | Pain: first | Pain: reassessment | Pain: final | Fictional history / reason for variation |
|---|---|---|---:|---:|---:|---:|---:|---|
| `H001` | `CS` | Maternity inpatient | 48 | 48 | 3 | 2 | 2 | Routine progress; clinician authorizes discharge |
| `H002` | `CS` | Maternity inpatient | 48 | 60 | 4 | 3 | 2 | Pain affected mobility; staff revised departure estimate |
| `H003` | `CS` | Maternity inpatient | 48 | 72 | 3 | 2 | 2 | Maternal clearance recorded; departure coordination delayed |
| `H004` | `CS` + repaired bowel injury | Maternity inpatient | 48 | 120 | 5 | 3 | 2 | Your five-day example; surgical-team clearance recorded at the end |
| `H005` | `CS` + repaired bowel injury | Maternity inpatient | 48 | 192 | 5 | 4 | 2 | Longer individualized course; team revises plan twice |
| `H006` | `AH` | Gynecology inpatient | 72 | 72 | 4 | 3 | 2 | Routine progression for this invented patient |
| `H007` | `AH` | Gynecology inpatient | 72 | 108 | 4 | 4 | 2 | Oral-intake and pain-plan milestones delayed |
| `H008` | `LH` | Gynecology inpatient | 48 | 24 | 3 | 2 | 1 | Team authorizes earlier departure after assessment |
| `H009` | `LH` | Gynecology inpatient | 48 | 60 | 3 | 3 | 2 | Bladder-plan assessment delayed |
| `H010` | `VH` | Gynecology inpatient | 48 | 48 | 3 | 2 | 2 | Routine progress |
| `H011` | `VH` | Gynecology inpatient | 48 | 72 | 4 | 3 | 2 | Mobility and home arrangements delayed |
| `H012` | `LM` | Gynecology postoperative | 24 | 24 | 3 | 2 | 2 | Routine progress |
| `H013` | `LM` | Gynecology postoperative | 24 | 36 | 4 | 3 | 2 | Staff delay departure to reassess pain and oral intake |
| `H014` | `OM` | Gynecology inpatient | 48 | 48 | 4 | 3 | 2 | Routine progress |
| `H015` | `OM` | Gynecology inpatient | 48 | 84 | 4 | 3 | 2 | Bleeding/wound review and mobility reassessment delayed |
| `H016` | `OC` | Gynecology postoperative | 24 | 12 | 3 | 2 | 1 | Earlier departure authorized |
| `H017` | `OC` | Gynecology postoperative | 24 | 36 | 3 | 3 | 2 | Nausea delayed the oral-intake milestone |
| `H018` | `DL` | Day-case recovery | 6 | 6 | 2 | 2 | 1 | Routine same-day departure |
| `H019` | `DL` | Day-case recovery | 6 | 10 | 2 | 1 | 1 | Clinically cleared; escort arrives later |
| `H020` | `HY` | Day-case recovery | 4 | 4 | 2 | 1 | 1 | Routine same-day departure |
| `H021` | `EB` | Gynecology surgical inpatient | 120 | 120 | 4 | 3 | 2 | Planned bowel procedure; team authorizes departure on day 5 |
| `H022` | `EB` | Gynecology surgical inpatient | 120 | 168 | 4 | 3 | 2 | Bowel-care milestones delayed; clearance on day 7 |

### H001: cesarean section, two-day course

| Hours since bed assignment | Pain report | Recorded progress | Bed implication |
|---:|---:|---|---|
| 0 | 3 | Postoperative bed assigned; remaining milestones pending | Occupied; provisional baseline is 48 hours |
| 24 | 2 | Oral-intake and mobility milestones recorded as met; team review pending | Occupied; 48-hour planning estimate remains provisional |
| 46 | 2 | Applicable assessments complete; discharge authorized; transport arranged | Occupied; staff-entered departure estimate is hour 48 |
| 48 | — | Patient physically leaves bed | Empty; awaiting cleaning |
| 49 | — | Cleaning completed and release checks confirmed | Available now; the one-hour turnaround is a simulation assumption |

### H002: cesarean section, pain-related delay

| Hours since bed assignment | Pain report | Recorded progress | Bed implication |
|---:|---:|---|---|
| 0 | 4 | Patient reports pain limiting movement; nurse records report | Occupied; forecast flagged for staff review |
| 24 | 3 | Some improvement; mobility and pain-plan milestones remain incomplete | Occupied; no model-generated extension |
| 48 | 3 | Original planning time reached; staff enter revised departure estimate at hour 60 | Occupied; revised forecast displayed |
| 60 | 2 | Team authorization and actual departure both recorded | Empty; awaiting cleaning |

The extra 12 hours is this fictional patient's documented course. It is not a rule that pain level 3 or 4 adds 12 hours.

### H004: cesarean section with repaired bowel injury, five-day course

| Hours since bed assignment | Pain report | Recorded progress | Bed implication |
|---:|---:|---|---|
| 0 | 5 | Repaired bowel injury documented; individualized review required | Occupied; routine CS baseline no longer used as the active forecast |
| 48 | 3 | Patient reports improvement; bowel-care and complication-review milestones still pending | Occupied; improving pain does not establish readiness |
| 96 | 3 | Team records progress and enters a provisional departure estimate at hour 120 | Occupied; forecast is based on the entered plan |
| 118 | 2 | Applicable bowel-care milestones and surgical review recorded as complete; discharge authorized | Occupied until actual departure |
| 120 | 2 | Patient leaves bed | Empty; awaiting cleaning |

### H005: same complication, longer course

At hour 48, a pain rating of 4 and incomplete surgical milestones trigger staff review. A fictional team estimate of hour 144 is entered at hour 96, then revised to hour 192 at hour 144 because the care-plan milestones remain incomplete. Departure occurs at hour 192 after authorization, with a final pain report of 2. This demonstrates why complication name or pain rating cannot establish a fixed stay.

## 5. Fictional current patients: progress snapshot

Snapshot: **October 1, 2026, 10:00 a.m. America/New_York**. All times below use the same timezone. These are separate patients from the completed histories.

Every occupied bed remains occupied regardless of its forecast. Milestones omitted from the table must still exist in the full record as assessed, unknown, or not applicable.

| Current ID / bed | Procedure | Mock bed assignment | Current progress | Latest recorded pain | Current planning estimate |
|---|---|---|---|---|---|
| `C101` / `MAT-01` | `CS` | Sep 29, 10:00 a.m. | Intake/mobility assessed; discharge authorized; transport pending | 2, Oct 1 at 9:00 a.m. | Staff-entered departure: Oct 1 at noon |
| `C102` / `MAT-02` | `CS` | Sep 29, 10:00 a.m. | Mobility and pain-plan milestones incomplete; authorization pending | 4, Oct 1 at 9:30 a.m. | Baseline time has passed; revised estimate unknown, staff review needed |
| `C103` / `MAT-03` | `CS` + repaired bowel injury | Sep 26, 10:00 a.m. | Patient reports improvement; bowel-care and surgical-review milestones pending | 3, Oct 1 at 9:00 a.m. | Five days elapsed; departure time unknown until team updates plan |
| `C104` / `GYN-01` | `LH` | Sep 30, 10:00 a.m. | Mobility/intake met; bladder plan pending | 2, Oct 1 at 8:30 a.m. | Provisional baseline: Oct 2 at 10:00 a.m.; no authorization yet |
| `C105` / `DAY-01` | `HY` | Oct 1, 8:00 a.m. | Post-anesthesia review met; applicable discharge milestones pending | 2, Oct 1 at 9:30 a.m. | Provisional baseline: Oct 1 at noon; do not mix with inpatient capacity |
| `C106` / `GYN-02` | `OM` | Sep 30, 10:00 a.m. | Several milestones unknown; staff assessment pending | unknown | Baseline: Oct 2 at 10:00 a.m.; estimate needs review because progress is missing |

For `C101`, if staff estimate 30 minutes to start cleaning after departure and 45 minutes to clean, the **provisional bed-ready time is 1:15 p.m.** These two durations are invented. The bed becomes available only when departure, cleaning completion, and release checks are actually recorded.

## 6. Factors that can move the forecast

Store the observed factor and the team-entered response; do not invent a universal time penalty.

| Factor | Project behavior |
|---|---|
| Pain reported as worsening, severe, or limiting activities | Flag for staff review; retain the reported values and timestamps |
| Mobility or oral-intake milestone incomplete | Show the unmet milestone and whether a revised plan exists |
| Bladder or bowel care plan incomplete | Use the team's assessment; do not interpret pain as proof of completion |
| Complication, including documented bowel injury | Use individualized team estimate; show unknown if none exists |
| Wound/bleeding concern or other staff-entered concern | Mark forecast for review without diagnosing the concern |
| Transport, home support, or discharge coordination pending | Track a separate operational departure delay |
| Clinical authorization missing | Keep authorization pending; a statistical baseline does not replace it |
| Actual departure delayed | Keep the bed occupied, even after authorization |
| Cleaning queue or maintenance hold | Delay bed readiness after departure; show the relevant blocker |
| Missing, stale, or contradictory updates | Show uncertainty and request staff review; never default to ready |

## 7. Jev's role in this demonstration

Jev interprets fictional free-text updates into bounded categories. Known structured values such as pain rating, authorization, and milestone status go directly into ordinary code.

Suggested `Choice` question: **Which single category best describes this update?**

Options:

- `routine_progress`: progress reported, with no explicit blocker in this update.
- `pain_related_delay`: pain is explicitly reported as delaying activities or the departure plan.
- `other_clinical_review`: the update explicitly mentions a complication or pending care-team review.
- `operational_delay`: transport, cleaning, equipment, or other logistical blocker.
- `unclear`: the update is missing needed context or is contradictory.

Example input: “Pain is 4 at movement, patient has not met today's walking goal, and the doctor will reassess departure after review.” Expected demonstration category: `pain_related_delay`.

Example input: “Patient says she feels better; bowel review is still pending.” Expected category: `other_clinical_review`, not automatic readiness.

For multiple factors in one update, ask separate narrow questions and keep each result visible. Show the proposed interpretation for staff confirmation. A model probability is not a clinically validated probability of discharge or of a bed being ready.

Jev does not calculate exact durations, set a medical discharge decision, or mark the bed available. TypeSafe documents limitations in numeric and date/time reasoning for Jev 1.13. [Jev introduction](https://docs.typesafe.ai/introduction), [Jev 1.13 limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13)

## 8. Bed states and time calculations

Normal sequence:

**Occupied → patient actually leaves → empty/awaiting cleaning → cleaning → ready**

A maintenance hold can block readiness at any point. Reservation and staffing checks are separate fields.

Initial simulation estimate:

`baseline_departure_at = bed_assigned_at + selected_simulation_baseline_hours`

The use of `bed_assigned_at` here is a mock simplification. In real data, use a baseline measured from the same anchor as the source history and retain separate surgery, recovery-area, ward-assignment, transfer, and hospital-discharge timestamps.

Active forecast:

- Prefer a current, staff-entered departure estimate.
- A routine baseline can remain visible as a provisional planning reference.
- If the baseline time is past, a complication has no updated plan, or an unresolved blocker invalidates the estimate, show **unknown / needs review** rather than a past-time forecast.
- Missing progress must be visible; it is not evidence that milestones have been met.

`estimated_bed_ready_at = active_departure_estimate + cleaning_queue_delay + cleaning_duration`

This estimate also requires a staffing/maintenance/reservation check. If a blocker has no known resolution time, show the estimated readiness as unknown. Do not report more precision than the underlying plan supports.

**Available now** requires recorded actual departure, confirmed cleaning completion, no active maintenance hold, no reservation, and staff confirmation that the bed can accept another patient. Compatibility with a particular patient is a separate feature for a later version.

## 9. Minimum fields for a patient and bed record

| Field | Meaning |
|---|---|
| `patient_id`, `synthetic` | Fictional identifier and `true` |
| `procedure_id`, `surgical_route` | Procedure category and route; keep complication separate |
| `bed_id`, `bed_class` | Particular bed and inpatient/day-case class |
| `surgery_completed_at`, `bed_assigned_at` | Separate event timestamps with timezone offsets |
| `baseline_hours`, `baseline_basis` | Simulation starting value and its provenance |
| `pain_assessments` | Time, patient report, 1–5 category or unknown, context, nurse ID |
| `milestones` | Status, assessment time, recorder, and note for each applicable milestone |
| `complications` | Staff-recorded complication flags and individualized plan |
| `staff_departure_estimate_at`, `estimate_updated_at` | Current team-entered forecast and its freshness |
| `discharge_authorized_at`, `authorized_by` | Explicit team authorization |
| `actual_bed_departure_at` | Observed departure from this specific bed |
| `cleaning_started_at`, `cleaning_completed_at` | Actual turnaround events |
| `maintenance_hold`, `reserved`, `staffing_confirmed` | Operational readiness checks |
| `forecast_status`, `forecast_basis` | Provisional, staff-entered, needs review, unknown, or observed; explain basis |

For live forecasts, only use information recorded by the forecast time. Final outcomes in the historical table are for retrospective checks; do not feed the future departure time or final pain rating into a prediction for an earlier snapshot.

## 10. Demonstration checks

1. A two-day C-section baseline does not free the bed at hour 48 without observed departure.
2. Pain 4 flags review but does not add an automatic fixed stay extension.
3. Pain improves from 5 to 2 but surgical milestones remain pending: bed remains occupied.
4. Bowel injury has no team estimate: departure forecast is unknown, not automatically five days.
5. Patient authorized to leave, transport delayed: bed remains occupied until departure.
6. Patient has left, cleaning incomplete: bed is empty but unavailable.
7. Missing pain or milestone data: preserve unknown; never silently fill favorable values.
8. Day-case recovery capacity is shown separately from maternity and gynecology inpatient beds.
9. A patient transfers to another bed: release the original bed through its cleaning workflow and begin a separate occupancy record for the receiving bed.
10. Conflicting update, such as “patient left” and “still awaiting discharge” at the same time: staff review resolves it before state changes.

These scenarios are acceptance examples for the future application. No Jev calls, model evaluation, or working software are claimed by this document.
