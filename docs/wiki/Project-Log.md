# Project notes

October 1, 2026, America/New_York.

This is a historical record of the initial release. For current project permissions and attribution, see [copyright and permissions](../../LICENSE).

## Why I made this

I wanted a small OB/GYN bed demo that I could understand, submit, and give to others. The project includes published examples and a record of what actually passed.

## What I put together

- Research links for 10 procedure categories, 22 made-up histories, and six current-patient snapshots.
- A simple 20-bed page with status codes, times, pain scores, and milestone counts.
- A Jev server connection for classifying a made-up nurse note.
- A screenshot walkthrough with cursor markers.
- Docker files in their own folder, a dependency lock, and portable tests. The initial release included an MIT license; see the notice above for current project permissions.

The first frontend used bed cards. I simplified the submission to a plain table and one app file. Tests and packaging stay outside that file.

## Problems I found and fixed

The first connection attempt with a user-supplied key failed because the slim container lacked trusted system certificates. I added pinned certificates and OpenSSL. A check using an intentionally invalid test key then reached TypeSafe and got the expected rejection.

The packages were also owned by root while the app ran as a regular user. That caused `EACCES` when Wrangler tried to create its cache. I corrected ownership, reproduced the problem against the old image, and made the startup check reject permission errors.

An independent agent reviewed the app with maximum reasoning effort. It found that incomplete Choice probabilities could pass as a valid answer. I fixed that validation. All five added behavior tests now pass.

## Make it easy to run

I added one launch command: `docker compose -f container/compose.yaml up --build`. It builds and starts the whole app. The board works without a key. A key can be supplied in the app or from the terminal environment.

## Quick testing and cleaning

I made 28 real Jev calls. Two vague notes failed with the original questions; revised questions matched 8 retests and 10 fresh cases. I added three ready-made notes, written expected answers, and a detail prompt for unclear notes.

Room cleaning now has its own small timer file. It records start and finish in this browser, resumes on reload, and leaves staff release to confirm. The research explains why cleaning time and full room turnover are different.

## Still to verify

- Broader independent testing beyond the small fictional-note set.
- A measured comparison with the cheaper model.
- Clinical accuracy and a real hospital workflow.
- A physical Windows run.

See [what was tested](Verification.md). I will keep the claims tied to the evidence.
