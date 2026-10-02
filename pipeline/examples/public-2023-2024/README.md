# Saved public example: 2023 and 2024

These are statewide aggregate counts from the New York State Department of Health's [2023 SPARCS release](https://health.data.ny.gov/d/46xm-urtu) and [2024 release](https://health.data.ny.gov/d/sf4k-39ay), collected October 2, 2026. The collector requested grouped counts and separate totals. It did not download individual discharge rows.

| Procedure | 2023 discharges | 2024 discharges | Median patient days, both years | Middle half, both years |
| --- | ---: | ---: | ---: | --- |
| C-section | 65,515 | 65,817 | 3 | 2–4 |
| Spontaneous vaginal delivery | 114,301 | 115,706 | 2 | 2–3 |
| Hysterectomy | 5,826 | 5,257 | 2 | 1–3 |

The discharge counts changed. The median and middle-half stay range stayed the same for these groups. Both years have already been examined, so this is a historical comparison, not a blind test.

Patient days cover the **whole admission**, including time before a procedure. They are not recovery times or exact bed-release forecasts. Reporting completeness and patient mix can affect comparisons. The public releases exclude individual secondary diagnoses and procedures, and these three groups do not cover all OB/GYN care. Read the release overviews and dictionaries linked in the manifest before extending the analysis.

## What is saved

- [cohorts.json](cohorts.json): grouped counts and query provenance.
- [summaries.json](summaries.json): calculated measures and censored-stay counts.
- [summaries.csv](summaries.csv): the six-row comparison table.
- [manifest.json](manifest.json): source URLs, coding version, revisions, document hashes, response hashes and saved-file hashes.

Each histogram total matched its separate count query. Dataset revisions matched before and after collection. That check detects reported revision changes; it is not a transactional database snapshot. The source label `120 +` is mapped to `120+`, with the mapping recorded in the manifest.

[Run the saved example](../../README.md) without internet or an API key. The saved-file hashes detect changes to these files relative to the manifest. They do not authenticate the publisher or certify HIPAA compliance.

## Source terms

Source: New York State Department of Health, SPARCS De-Identified Public Use Files, 2023 and 2024. [Open NY terms](https://data.ny.gov/download/77gx-ii52/application/pdf) were reviewed October 2, 2026 and their hash is recorded in the manifest. External source data remains subject to those terms and is outside the project's MIT grant. No State endorsement is implied.

The releases describe their data as de-identified and containing no PHI. That statement describes the source files; it does not make this demo ready for real patient information.
