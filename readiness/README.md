# Bed-readiness timing

I wrote the expected answers before building the timing function. It now calculates cleaning-start and completion windows from those inputs. The fixtures use made-up rooms, departures, staff records and cleaning times. Every case includes its complete input and expected output.

The function is separate from the bedboard for now. It uses no API key and makes no Jev calls. Run a fictional example from the project root:

```sh
npm run readiness:demo -- two-rooms
```

The demo labels its timezone and shows dates and times in New York time. Both rooms keep their actual occupied status:

| Bed | Actual status | Estimated ready window | Release |
| --- | --- | --- | --- |
| MAT-01 | occupied | October 2, 2026, 10:50–11:00 | pending staff release |
| MAT-02 | occupied | October 2, 2026, 11:10–11:30 | pending staff release |

Add `--json` to print the complete forecast instead. Forecast window endpoints are UTC strings ending in `Z`. The snapshot keeps its original numeric offset, and `timezone` tells the display which clock to use.

```sh
npm run readiness:demo -- two-rooms --json
```

## Change an example

From the project root, copy [two-rooms.json](examples/two-rooms.json) to your own file. On Mac or Linux:

```sh
cp readiness/examples/two-rooms.json my-rooms.json
```

On Windows PowerShell:

```powershell
Copy-Item readiness/examples/two-rooms.json my-rooms.json
```

Adjust the fictional inputs in `my-rooms.json`, then run:

```sh
npm run readiness:demo -- --input my-rooms.json
```

`--json` works before or after a case ID or the `--input file.json` pair. Choose one case ID or one input file per run.

You can also choose another case ID from [cases.json](fixtures/cases.json). Keep that file unchanged when experimenting: it holds the expected answers used by the tests.

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

`forecastBeds(input)` takes one ward, one cleaner and a same-day shift. [cases.json](fixtures/cases.json) gives complete examples of its input and output. It returns the same actual bed statuses, with a separate estimate, sorted reasons and explicit assumptions. Invalid requests throw `INVALID_INPUT` with structured issues rather than inventing a forecast status.

The forecast statuses, in priority order, are:

- `blocked`: the bed has an unresolved hold.
- `needs_review`: a record is stale, contradictory or from an unapproved departure source.
- `unknown`: a required input or upstream completion is missing, or no continuous cleaning slot fits.
- `estimated`: both timing scenarios can be calculated; staff still confirm release.

Departures use two exact demo source labels: `fictional nurse-entered estimate` for estimates and `fictional observed departure` for recorded events. Other labels, including Jev/model output, produce `needs_review` and no time. These labels restrict demo inputs; they do not authenticate who entered a real record.

An occupied bed needs an estimated departure. A bed awaiting cleaning needs an observed departure, recorded at or after the event. Contradictions need review. Departure records, including observed events, also need review when their update age exceeds `maxUpdateAgeMinutes`; exactly the limit passes. This flags record freshness and keeps the observed event intact.

Cases cover busy cleaners, breaks, shift boundaries, update age, holds, missing information, queue order and note-label failure. Held rooms leave the queue; a queued room with an untrusted completion blocks later estimates. Earliest and latest scenarios are checked separately, including their no-overlap rules.

Both scenarios need enough uninterrupted time for the maximum cleaning duration. The queue advances using each scenario's own assumed duration. A task may finish exactly at break start or shift end. A partially elapsed departure window is still usable until its latest bound has passed.

Travel and conditional release delay are explicitly zero for this demo. Estimated readiness is **pending staff release**. The tests do not dispatch staff, authorize discharge, change bed status or certify clinical accuracy or HIPAA compliance.

Cleaning durations use minutes, including decimals such as 16.1 and 32.7. Conversion allows floating-point rounding noise at a whole millisecond, while rejecting sub-millisecond and genuinely fractional-millisecond durations. This version supports occupied/awaiting-cleaning rooms, one same-day New York shift and the snapshot's date/offset. Overnight shifts, handovers and other bed states need their own rules before use.

`forecast.mjs` combines input validation, direct reasons, fixed queue order and scheduling. The smaller modules keep those rules easy to read and change. Next is connecting the result to the fictional bedboard while keeping staff-confirmed state separate.
