# Public-data collection

This step collects statewide discharge counts for the three procedures in the stay-summary contract, for 2023 and 2024. It uses only the two approved public SPARCS releases.

Before querying counts, check the Open NY terms hash, dataset ID, release year, publisher's explicit de-identification/no-PHI description, required column names/types and both reviewed documents. The release overview supplies the coding version; the dictionary supplies the patient-day and censoring rules. Changed documents need review before updating their recorded hashes or coding version.

For each year, request one grouped histogram and a separate `count(*)` for each procedure. The API does the grouping. Never request `select *`, individual discharge rows, facilities, demographics or patient notes. Request up to 361 histogram rows and reject more than 360 valid groups. Every returned field and group must match the requested scope.

Only the documented source label `120 +` maps to the contract's `120+`. Record that mapping in the manifest; reject other unexpected labels.

Use sequential public API requests without credentials. Restrict requests to the approved HTTPS origins, cap response bodies at 2 MiB and use a 45-second timeout. The terms download may follow its one reviewed redirect; other redirects fail.

An empty cohort needs an explicit zero from its separate count query and no histogram rows. Missing counts, errors and malformed responses must fail. Totals must reconcile through the existing summary function. Check the dataset revision again after the queries and stop if it changed.

This revision guard is not a transactional database snapshot. A publisher could delay updating revision metadata; separate queries do not guarantee one database transaction.

Finish both years before saving anything. Write a new output folder containing validated cohorts, JSON/CSV summaries and a manifest with exact query URLs, retrieval times, dataset revisions, coding evidence, terms links and file hashes. Refuse to replace an existing output folder. A failed run must not leave a partial final snapshot.

Replay checks all three saved data-file hashes, then validates the six cohorts and their matching source records, queries, terms and retrieval time before saving fresh summaries. Missing or inconsistent provenance must fail. Hashes provide integrity relative to the saved manifest, not an authenticated signature.

Normal tests use simulated API replies and need no internet or key. A live collection is a separate check. These statewide admission lengths are historical context, not patient recovery times or bed-release predictions.
