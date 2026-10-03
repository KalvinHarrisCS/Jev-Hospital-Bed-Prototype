# Automated tests

The tests stay with the code so you can run them yourself. GitHub runs the same checks for pull requests and changes to `main`.

The bed-readiness function now passes its tests-first suite, including the complete fictional forecasts and structured invalid-input errors. [Run the readiness tests or a sample](../../readiness/README.md). Existing app and public-data checks remain separate commands.

The data pipeline started with tests before implementation. The stay-summary function, public collector, saving and replay now pass those tests. The checks use fictional counts and simulated API replies. Live public-data collection was checked separately; see the verification record. The existing app checks can be run separately with `npm run test:app`.

## Run them locally

With Node.js 22 or newer installed, open a terminal in the project root:

```sh
npm ci
npm test
```

After building the Docker image, you can also run:

```sh
docker compose -f container/compose.yaml run --rm bedboard npm test
```

## What they cover

| Group | Checks |
| --- | --- |
| API contract | Input validation, origin checks, provider response validation and error handling |
| Key setup | Key presence, server/browser setup and fixture credentials staying out of results |
| Bedboard behavior | Countdown confirmation, submitted-bed context, edited notes and practice answers |
| Cleaning | Elapsed time, reload, multiple tabs, storage failures and recorded fields |
| Data pipeline | Fictional cohorts, weighted stay quantiles, censoring, empty groups, source documents/terms, independent totals, bounded replies, file hashes, provenance and offline command replay |
| Bed readiness | Complete fictional scenarios, clock boundaries, fixed queues, missing/stale records, holds, unchanged actual status and structured invalid-input errors |

The checks use fictional data and simulated provider responses. They need no TypeSafe key and make no live Jev requests. These are software checks; clinical accuracy has not been evaluated.

## Before merging

[The GitHub workflow](../../.github/workflows/tests.yml) installs the locked dependencies and runs the app, pipeline and readiness checks in separate steps on Node.js 22. Together these are the same checks as `npm test`. It runs on pull requests targeting `main`, pushes to `main`, and merge queues if one is configured. You can also start it manually from [Actions](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/actions/workflows/tests.yml).

The `Tests` check must pass before a pull request can merge into `main`. There is no required reviewer approval. Make changes on a branch and open a pull request so the tests can run before merging.

Before merging, check that the change matches the pull request, the tests cover likely mistakes, no keys or private data were added, and the instructions still match the app. Keep unfinished work in draft and fix failing tests before merging.

The workflow has read-only repository permissions, uses pinned GitHub actions and does not deploy the app.

See [the verification record](VERIFICATION.md) for earlier checks and their limits. The setup follows GitHub's [Node.js testing guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) and [required status checks](https://docs.github.com/en/pull-requests/reference/status-checks).
