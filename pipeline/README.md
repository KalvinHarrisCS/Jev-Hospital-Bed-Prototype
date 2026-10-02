# Data pipeline: tests first

I put the tests in first so we have a clear target before building the pipeline. The sample counts are made up, and the expected answers are written down so we can check the code against them.

## First scope

- Public SPARCS aggregate counts for 2023 and 2024.
- C-section (`PGN003`), spontaneous vaginal delivery (`PGN002`) and hysterectomy (`FRS001`).
- Whole-admission patient days, discharge counts and historical stay distributions.

These numbers will show how long past hospital stays lasted. They count discharges, so someone admitted twice can be counted twice. They help us understand stay times; staff still decide when a patient can leave.

## Run the checks

Use Node.js 22 or newer from the project root:

```sh
npm run test:pipeline:fixtures
npm run test:pipeline
```

The summary function is now written, and the sample-data and pipeline checks pass. It returns discharge totals, the median and the middle-half stay range. It rejects invalid input or totals that do not match, and keeps `120+` stays labeled instead of treating them as exact times. We wrote the tests first, then built the function against them.

You can run these tests without a key or an internet connection. [The contract](CONTRACT.md) explains what the function needs to return. [The review guide](../docs/testing/CODE-REVIEW.md) explains what to check before merging.

## Next steps

1. Add a command to collect public totals and record where they came from.
2. Save a copy of that data and make CSV/JSON summaries.
3. Compare 2023 with 2024 and explain what changed. We have already looked at both years, so this is a comparison of past data, not a blind test.

Source references: [2023 public release](https://health.data.ny.gov/d/46xm-urtu), [2024 public release](https://health.data.ny.gov/d/sf4k-39ay), and [SPARCS public-use guidance](https://www.health.ny.gov/statistics/sparcs/access/). Source terms will be recorded with the collection step; the project's MIT license does not relicense external data.
