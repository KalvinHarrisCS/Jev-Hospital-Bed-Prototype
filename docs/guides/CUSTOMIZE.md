# Make it your own

I kept the app in one file so you can see what it does and change it: `worker/index.js`. Open it in any text editor. Keep a working copy before trying changes. Docker files stay in `container/`.

## Change a fictional bed

The `beds` array at the top of the file holds the displayed records. For example, replace the `MAT-06` entry with this fictional review scenario:

```js
{id:'MAT-06',patient:'C107',procedure:'Cesarean section',status:'OCC',ready:null,pain:3,progress:'6/8 milestones met',note:'Pain limits walking. Reassessment pending.'},
```

| Field | What to change |
|---|---|
| `id` | Unique bed ID. Do not repeat an ID. |
| `patient` | Fictional patient ID; omit it for an empty bed. |
| `procedure` | Procedure or operational label. |
| `status` | `AVL`, `OCC`, `CLN`, `DUE`, or `HLD`. |
| `ready` | ISO date with timezone offset, or `null` for unknown. This is a fixture estimate, not a model output. |
| `pain` | Patient-reported rating recorded by a nurse: 1-5 for this demo, or `null` for missing. |
| `progress` | Human-readable milestone snapshot. Keep it consistent with the fictional case. |
| `note` | Initial fictional progress note. The on-page note can be edited, but it is not saved. |

After changing a record, press Ctrl+C to stop the app, then rebuild and start it with the same launch command. Editing a file outside the container does not update the running copy by itself.

```sh
docker compose -f container/compose.yaml up --build
```

The new `MAT-06` should show pain 3/5 and an unknown readiness time. To check your changes, run `docker compose -f container/compose.yaml run --rm bedboard npm test` from another terminal. With local Node.js, restart `npm run dev` if needed.

## Change the board size or timeline

Add or remove fictional records in `beds`. The header counts, bed rows and selection menu all use that array. Total beds counts every record; Available counts `AVL`, Occupied counts `OCC`, In turnaround counts `CLN` and `DUE`, and On hold counts `HLD`. Rebuild and restart the app to load your changes.

The browser script's `base` value sets the fictional demo clock. If you change the scenario date, update that value and all `ready` dates together. The default clock starts October 1, 2026 at 10 a.m. New York time and resets on reload. `format` displays New York time; change its timezone if adapting the scenario to another location. A countdown reaching zero shows **Confirm readiness** and does not change the bed status.

## Change what Jev asks

The server's `questions` object defines a progress Choice and a delay Noul question. Edit the descriptions to fit your fictional use case. If you change question names, allowed categories or response types, also update the response validation immediately below the provider call and the fixture checks in `scripts/`.

The provider request currently uses `jev-latest`. For a controlled model comparison, choose an exact version supported by TypeSafe, record that version and keep the same notes/questions. The displayed `model` identifies the version the provider actually returned. A successful software setup does not guarantee identical model probabilities or clinical accuracy. Do not add a key to the source.

## Change the research examples

Edit `docs/research/fictional-patient-histories.md` or the pages in `docs/wiki/`. Keep invented stays and patient cases labeled fictional, and preserve source links for published guidance. The histories are documentation fixtures; changing them does not train Jev or automatically change the board.

## Check and share your changes

Run `npm test` with Node.js, or use the Docker test command above. Checks use made-up `MAT-02` and `C102` examples; if you replace those cases, update the tests too. The tests need no key and make no TypeSafe calls. They check the software, not clinical correctness.

Share the source, README, lockfile, container folder, tests and license together. Exclude `.env`, `.dev.vars`, Git history and local credentials. Include a short note describing your changes and what you actually tested. You are free to expand your own copy.

## If I took this toward hospital use

I would keep this fictional demo separate and build a reviewed production version with staff access, protected records, audit logs, managed secrets and an approved provider arrangement. [Demo security and a path to production](../security/DEMO-SECURITY.md) maps each proposed change to the files I would update. This version is not ready for real patient information.

## Cleaning records

The timer is `worker/cleaning.js`. It chooses the beds already marked DUE or CLN. Change those fictional records in the core if you want different example rooms. Timings use local browser storage under `obgyn-cleaning-demo-v1` and the computer clock; no patient notes or keys go into that log. The current average is only start-to-finish elapsed minutes. Request, departure and release timestamps are future work, described in the [research](../wiki/Cleaning-Research.md).
