# Public stay-data pipeline

I put the tests in first, then built the collector and summary code around them. This first step uses public New York SPARCS counts for C-section (`PGN003`), spontaneous vaginal delivery (`PGN002`) and hysterectomy (`FRS001`) in 2023 and 2024.

The API groups the data before sending it here. The collector receives discharge counts by procedure, year and stay length. It does not download individual discharge records.

Stay lengths cover the whole admission in **patient days**. They count discharges, so someone admitted twice can be counted twice. These are historical stay distributions; staff still decide when a patient can leave.

## Try the saved example

With Node.js 22 or newer, run this from the project root:

```sh
npm run pipeline:collect -- --from pipeline/examples/public-2023-2024
```

It checks the saved file hashes and source records, then rebuilds all six summaries in a new folder under `pipeline/output/`. It needs no internet, dependencies or API key. [The example](examples/public-2023-2024/README.md) compares both years and explains the limits.

With Docker Desktop running, you can use the same project container:

```sh
docker compose -f container/compose.yaml run --rm --build bedboard npm run pipeline:collect -- --from pipeline/examples/public-2023-2024 --out /tmp/jev-replay
```

This prints the results. Its output files are removed when the temporary container exits. The first image build needs internet.

To keep the output on your computer, create `pipeline/output` first, then run:

```sh
docker compose -f container/compose.yaml run --rm --build --volume "${PWD}/pipeline/output:/data" bedboard npm run pipeline:collect -- --from pipeline/examples/public-2023-2024 --out /data/replay
```

The files appear in `pipeline/output/replay`. Choose a new output name for another run. The mount form works in Mac/Linux shells and Windows PowerShell; on Linux, the folder must be writable by the container's `node` user. These commands do not start the bedboard server.

## Collect a fresh copy

```sh
npm run pipeline:collect
```

This checks the approved source documents, gets aggregate counts and saves a new folder. Use `--out new-folder` to choose its location. For a live Docker collection, remove `--from pipeline/examples/public-2023-2024` from the command above.

Each completed run writes:

- `cohorts.json`: the six validated aggregate inputs.
- `summaries.json`: totals, quartiles, censored counts and small-sample flags.
- `summaries.csv`: the same measures in a table.
- `manifest.json`: exact queries, retrieval time, dataset revisions, source documents, terms and file hashes.

The command refuses to replace an existing output folder. A failed collection does not save a partial snapshot. Hashes help check saved files; they are not a digital signature or a compliance certificate.

## Run the checks

```sh
npm run test:pipeline
```

Tests use made-up counts and simulated API replies. They need no internet or key. [The contract](CONTRACT.md) covers the summary rules, and [collection rules](COLLECTION.md) cover source checks, query limits and saving.

## Change the scope

`sources.mjs` holds the reviewed years, procedure codes, document hashes and query fields. `summarize.mjs` checks one cohort and calculates its stay range. `collect.mjs` gets public totals; `cli.mjs` collects or replays them.

Adding another year or procedure means reviewing its official definition, coding version and terms, then updating the contract and tests. If a source document changes, review it before changing the pinned hash.

Next, we can use these summaries as a reference for the fictional bedboard and test a forecast against a simple baseline. The current pipeline does not predict bed release times.

Sources: [2023 release](https://health.data.ny.gov/d/46xm-urtu), [2024 release](https://health.data.ny.gov/d/sf4k-39ay) and [Open NY terms](https://data.ny.gov/download/77gx-ii52/application/pdf). The project's MIT license does not relicense external data.
