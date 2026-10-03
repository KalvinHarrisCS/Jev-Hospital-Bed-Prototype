# Bed-readiness timing

I wrote the expected answers before building the timing function. It now calculates cleaning-start and completion windows from those inputs. The fixtures use made-up rooms, departures, staff records and cleaning times. Every case includes its complete input and expected output.

The function is separate from the bedboard for now. It uses no API key and makes no Jev calls. Run a fictional example from the project root:

```sh
npm run readiness:demo -- two-rooms
```

That prints JSON with two ready windows: 10:50–11:00 and 11:10–11:30 on the fixture's New York date. JSON timestamps are in UTC; the result includes the display timezone. Both rooms keep their actual occupied status. Try another case ID or adjust its full input in [cases.json](fixtures/cases.json).

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

Cases cover busy cleaners, breaks, shift boundaries, update age, holds, missing information, queue order and note-label failure. Held rooms leave the queue; a queued room with an untrusted completion blocks later estimates. Earliest and latest scenarios are checked separately, including their no-overlap rules.

Both scenarios need enough uninterrupted time for the maximum cleaning duration. The queue advances using each scenario's own assumed duration. A task may finish exactly at break start or shift end. A partially elapsed departure window is still usable until its latest bound has passed.

Travel and conditional release delay are explicitly zero for this demo. Estimated readiness is **pending staff release**. The tests do not dispatch staff, authorize discharge, change bed status or certify clinical accuracy or HIPAA compliance.

Cleaning durations use minutes, including fractions that convert to whole milliseconds. Smaller or nonrepresentable intervals are rejected instead of rounded to zero. This version supports occupied/awaiting-cleaning rooms, one same-day New York shift and the snapshot's date/offset. Overnight shifts, handovers and other bed states need their own rules before use.

`forecast.mjs` combines input validation, direct reasons, fixed queue order and scheduling. The smaller modules keep those rules easy to read and change. Next is connecting the result to the fictional bedboard while keeping staff-confirmed state separate.
