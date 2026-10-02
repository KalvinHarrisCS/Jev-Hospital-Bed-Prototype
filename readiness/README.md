# Bed-readiness tests first

I wrote the expected answers before building the timing function. The fixtures use made-up rooms, departures, staff records and cleaning times. Every case includes its complete input and expected output.

This is a draft change. `forecast.mjs` is a placeholder, so the forecast tests intentionally fail. It is not connected to the bedboard and must not merge until the function passes them.

## Run the tests

From the project root with Node.js 22 or newer:

```sh
npm run test:readiness
```

Check the fixture file separately:

```sh
npm run test:readiness:fixtures
```

With Docker Desktop running:

```sh
docker compose -f container/compose.yaml run --rm --build bedboard npm run test:readiness
```

The first Docker build needs internet. The tests need no network or TypeSafe key and make no Jev calls. `npm run test:app` and `npm run test:pipeline` still run the existing checks separately.

## What the tests establish

`forecastBeds(input)` will take one ward, one cleaner and a same-day shift. [cases.json](fixtures/cases.json) gives complete examples of its input and output. It must return the same actual bed statuses, with a separate estimate, sorted reasons and explicit assumptions. Invalid requests must throw `INVALID_INPUT` with structured issues rather than inventing a forecast status.

Cases cover busy cleaners, breaks, shift boundaries, update age, holds, missing information, queue order and note-label failure. Held rooms leave the queue; a queued room with an untrusted completion blocks later estimates. Earliest and latest scenarios are checked separately, including their no-overlap rules.

Both scenarios need enough uninterrupted time for the maximum cleaning duration. The queue advances using each scenario's own assumed duration. A task may finish exactly at break start or shift end. A partially elapsed departure window is still usable until its latest bound has passed.

Travel and conditional release delay are explicitly zero for this demo. Estimated readiness is **pending staff release**. The tests do not dispatch staff, authorize discharge, change bed status or certify clinical accuracy or HIPAA compliance.

Next: implement the small timing function against these tests, run the existing checks too, then review the pull request before merging.
