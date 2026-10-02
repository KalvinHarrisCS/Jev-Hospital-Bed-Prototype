# Data pipeline: tests first

I want the data rules and expected answers in place before writing the pipeline. This first step contains a contract, fictional frequency tables and acceptance tests.

## First scope

- Public SPARCS aggregate counts for 2023 and 2024.
- C-section (`PGN003`), spontaneous vaginal delivery (`PGN002`) and hysterectomy (`FRS001`).
- Whole-admission patient days, discharge counts and historical stay distributions.

These are descriptive references. A discharge count is not a count of unique patients, and a historical stay range does not authorize discharge or predict a particular patient's remaining time.

## Run the checks

Use Node.js 22 or newer from the project root:

```sh
npm run test:pipeline:fixtures
npm run test:pipeline
```

The fixture checks should pass. The acceptance tests should fail with `NOT_IMPLEMENTED` until `summarizeCohort` is written. Nothing is skipped or treated as an expected pass. `npm test` runs the app checks followed by these acceptance tests, so the required GitHub check stays red during this step. Keep the pull request in draft until the implementation passes.

The tests use fictional counts and require no network access, credentials or Jev requests. [The contract](CONTRACT.md) defines the answers they expect.

## Next steps

1. Implement `summarizeCohort` until the acceptance tests pass.
2. Add a separate manual command to collect approved public aggregates and source metadata.
3. Save fixed snapshots and generate CSV/JSON summaries.
4. Compare 2023 with 2024 and document changes. Both years have already been inspected, so this is a retrospective comparison.

Source references: [2023 public release](https://health.data.ny.gov/d/46xm-urtu), [2024 public release](https://health.data.ny.gov/d/sf4k-39ay), and [SPARCS public-use guidance](https://www.health.ny.gov/statistics/sparcs/access/). Source terms will be recorded with the collection step; the project's MIT license does not relicense external data.
