# What the review found

I asked an independent AI agent to review the app with maximum reasoning effort and add a few tests. It checked the code and ran the tests without using my real key or changing my running container.

## One bug, now fixed

The server could accept a Jev Choice answer even when probabilities or confidence were missing. Those fields are required by the [TypeSafe API](https://docs.typesafe.ai/api).

I tightened the response check. It now requires every requested option probability, confidence, and delay probability to be a finite number from 0 to 1. It also rejects an empty model name. The new test failed before the fix and passes after it. The core is still 100 lines.

## Five added tests

| Test | Result |
|---|---|
| A countdown expires without freeing an occupied or cleaning bed | Passed |
| A caller cannot replace the selected bed's stored pain, procedure, or milestones | Passed |
| Missing or invalid Choice probabilities and confidence are rejected | Passed after the fix |
| The password clears, the tab keeps its key, and a delayed result names the submitted bed | Passed |
| A failed browser request leaves the note editable and allows a retry | Passed |

The existing API and key-setup tests also passed. The review found no other confirmed bug within this small demo's scope.

## What that means

The browser tests run the actual page script with a simulated page and clock. They do not prove real browser layout, accessibility, or model accuracy. The local screenshot guide is a separate check of the actual page.

The bed records and clock are made-up snapshots. Same-origin checks are not staff authentication. Keep the supplied server bound to localhost; a public version with a shared server key would need access controls to protect its quota.

Real-key Jev checks now passed on fictional notes. A physical Windows run and clinical accuracy are still unverified. See [what was tested](VERIFICATION.md).

## Follow-up checks

The same agent found two more demo bugs: an old sample answer stayed visible after editing a note, and a second browser tab could overwrite cleaning records. I clear answers on note input, read the latest stored timings before a change, and listen for changes from other tabs. The regressions now pass. There are seven bedboard behavior tests and four cleaning tests, alongside the contract and key-setup checks. The timer is local browser storage, not a hospital database.
