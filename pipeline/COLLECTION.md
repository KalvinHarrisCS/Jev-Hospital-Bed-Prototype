# Public-data collection

This step collects statewide discharge counts for the three procedures in the stay-summary contract, for 2023 and 2024. It uses only the two approved public SPARCS releases.

Before querying counts, check the dataset ID, release year, public de-identification description, required column names/types and the reviewed data dictionary. A changed dictionary needs review before updating its recorded hash and coding version.

For each year, request one grouped histogram and a separate `count(*)` for each procedure. The API does the grouping. Never request `select *`, individual discharge rows, facilities, demographics or patient notes. Request up to 361 histogram rows and reject more than 360 valid groups. Every returned field and group must match the requested scope.

An empty cohort needs an explicit zero from its separate count query and no histogram rows. Missing counts, errors and malformed responses must fail. Totals must reconcile through the existing summary function. Check the dataset revision again after the queries and stop if it changed.

Finish both years before saving anything. Write a new output folder containing validated cohorts, JSON/CSV summaries and a manifest with exact query URLs, retrieval times, dataset revisions, coding evidence, terms links and file hashes. Refuse to replace an existing output folder. A failed run must not leave a partial final snapshot.

Normal tests use simulated API replies and need no internet or key. A live collection is a separate check. These statewide admission lengths are historical context, not patient recovery times or bed-release predictions.
