# Fictional Patient Histories

I made up every patient below. These examples help explain and test the project; they do not prove that a clinical predictor works.

## Fictional completed patient histories

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
