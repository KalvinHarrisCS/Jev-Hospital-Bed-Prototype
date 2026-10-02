# Research and References

I looked up the stay guidance below on October 1, 2026. I kept published ranges separate from the starting times I chose for the made-up cases.

## Published background and selected simulation starting times

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
