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

Copy [two-rooms.json](examples/two-rooms.json) to a new file, adjust its fictional inputs, then run:

```sh
npm run readiness:demo -- --input my-rooms.json
```

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

An occupied bed needs an estimated departure. A bed awaiting cleaning needs an observed departure, recorded at or after the event. Contradictions need review. Departure records, including observed events, also need review when their update age exceeds `maxUpdateAgeMinutes`; exactly the limit passes. This flags record freshness and keeps the observed event intact. Staff records use the same age rule. A decimal limit of 4.1 minutes includes an update exactly 246000 milliseconds old; one millisecond older needs review.

Queue order needs departure bounds with the matching approved demo source and a departure kind consistent with the actual bed status, or an explicit staff-entered override. An observed record whose update timestamp is before its event cannot establish queue order. With more than one non-held room, a missing bound, unapproved/missing source or either contradiction makes the queue unknown. Changing a model-supplied or contradictory departure time cannot move another room ahead of it. Rooms with trusted bounds receive `upstream_queue_unknown`; rooms lacking those bounds keep their direct reasons. A single room still has a known position, but unapproved, contradictory or missing inputs cannot produce a time. An override can establish order without making those inputs trustworthy. A missing update or stale update alone keeps an otherwise consistent observed event in queue order, while still blocking its forecast and dependent forecasts.

Cases cover busy cleaners, breaks, shift boundaries, update age, holds, missing information, queue order and note-label failure. Held rooms leave the queue; a queued room with an untrusted completion blocks later estimates. Earliest and latest scenarios are checked separately, including their no-overlap rules.

Both scenarios need enough uninterrupted time for the maximum cleaning duration. The queue advances using each scenario's own assumed duration. A task may finish exactly at break start or shift end. A partially elapsed departure window is still usable until its latest bound has passed.

Cleaning starts at or after the snapshot, even when departure and the earliest busy-task finish are earlier. A busy-task window whose latest finish is before the snapshot still needs review, even with fresh updates.

Travel and conditional release delay are explicitly zero for this demo. Estimated readiness is **pending staff release**. The tests do not dispatch staff, authorize discharge, change bed status or certify clinical accuracy or HIPAA compliance.

Cleaning durations use minutes, including decimals such as 16.1 and 32.7. Conversion allows floating-point rounding noise at a whole millisecond, while rejecting sub-millisecond and genuinely fractional-millisecond durations. This version supports occupied/awaiting-cleaning rooms, one same-day New York shift and the snapshot's date/offset. Overnight shifts, handovers and other bed states need their own rules before use.

`forecast.mjs` combines input validation, direct reasons, fixed queue order and scheduling. The smaller modules keep those rules easy to read and change. Next is connecting the result to the fictional bedboard while keeping staff-confirmed state separate.
