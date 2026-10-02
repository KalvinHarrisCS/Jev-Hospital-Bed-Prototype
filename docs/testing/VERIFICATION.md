# Verification record

Here is what I checked, what passed, and what I still cannot claim. Checked October 1, 2026, America/New_York. The core is a JavaScript Worker with a separate cleaning module; tests and Docker setup are separate files.

| Evidence | Result | Limit |
|---|---|---|
| Clean ZIP unpacked into a different folder | Portable fixture tests passed; no author filesystem paths in text files; local documentation links resolved. | Does not prove a future recipient's computer setup. |
| One-command Docker launch from that ZIP | Compose built and started the full app; the page loaded and key presence was false without a key. Included tests and HTTPS check passed. | Checked on Mac Docker using Linux ARM64 and a separate test port. |
| Locked Docker builds | Linux ARM64 and Linux AMD64 builds passed from the supplied source and lockfile. | AMD64 was emulated on this Mac; no physical Windows run. |
| Local runtime | HTML and boolean-only key presence checked with and without a fixture key; non-root user verified. | Development server using fictional fixtures. |
| Container permissions | The new startup check reproduced the old image's `EACCES` error. The corrected image passed without runtime permission errors on both tested architectures. | Applies to the supplied Docker image; does not fix unrelated host permissions. |
| Provider wiring | Request/response validation, origin checks and error paths passed with a simulated provider. | No inference-quality measurement. |
| Independent review and five new behavior tests | Fixed acceptance of incomplete or invalid Choice probabilities/confidence. All five tests pass. | Browser behavior uses a simulated DOM, not a full browser test. |
| Actual Worker HTTPS | TypeSafe rejected an invalid fixture key over verified HTTPS on both tested architectures. | Establishes connectivity/authentication error handling, not a successful model evaluation. |
| Browser UI | Bed selection, fictional note entry, setup check and missing-key behavior checked in the local browser. | Patient notes are not saved; cleaning timings have separate local storage. No clinical workflow approval. |
| Successful valid-key inference | 28 real calls recorded: 8 baseline, 8 tuned retests, 10 fresh notes and 2 browser calls. Returned model `jev-1.13.0`. | All notes fictional; see [results](EVALUATION.md). This is not clinical validation. |
| Fast practice flow and note guidance | Seven behavior tests pass; sample results make no provider calls; editing clears old answers. Actual browser showed detail guidance after Jev. | Expected examples are written labels; no inference occurs in sample mode. |
| Cleaning timings | Four fixture tests pass: elapsed duration, reload, two-tab updates, storage failures and validated fields. | Local browser log and device clock; no shared hospital database or measured cleaning-quality outcome. |
| Clinical or forecasting accuracy | Not evaluated. | Synthetic category agreement is not clinical validation. |

The first connection attempt with a user-supplied key failed because the slim container lacked the certificate bundle used by workerd. I added pinned Debian CA certificates and OpenSSL while keeping HTTPS verification enabled.

I also left the packages owned by root after installation, which prevented the regular app user from creating `/app/node_modules/.mf`. I fixed ownership in the Dockerfile. The old check missed this because it checked the response and ignored startup logs. The updated check reads the logs and fails on permission errors.

Commands recipients can repeat:

```sh
docker compose -f container/compose.yaml up --build
docker compose -f container/compose.yaml run --rm bedboard npm test
docker compose -f container/compose.yaml run --rm bedboard npm run check:https
```

The last command sends only an invalid fixture key and fictional note to TypeSafe. It requires network access. Ordinary `npm test` makes no provider calls.

## Hospital form and narrated walkthrough

The form layout was checked in the actual local browser at desktop size and at 390 pixels wide, with 20 bed rows and no page-level horizontal overflow. The same seven behavior and four cleaning tests passed after the markup changes. One additional live fictional-note request returned `unclear`; it is recorded separately from the original 28-call evaluation.

Audio/video format and full decoding were checked for the eight-part screenshot walkthrough. Listening quality still requires a listener's review.

## Stay-summary pipeline

Checked October 2, 2026. The summary function passes 106 pipeline tests, and the existing app checks still pass. The same checks pass in the supplied Docker image on Node.js 22.23.3 with network access turned off.

The tests cover discharge totals, weighted nearest-rank quartiles, `120+` stays, empty groups, small samples, input validation and source metadata. Extra cases cover whitespace in stay labels, missing rows, inherited fields and keeping output edits separate from input records. No existing acceptance test was removed or skipped.

Those summary checks used fictional counts. Public collection and replay were checked separately below.

## Public collection and replay

Checked October 2, 2026. All 163 pipeline tests pass, with no skipped tests, and the existing app checks still pass. Both pass in Docker on Node.js 22.23.3 with network access turned off. Tests use fictional counts and simulated replies.

Live collection succeeded on the host and in Docker for all six procedure/year groups. Histogram totals matched separate count queries. Approved terms and source-document hashes matched, and dataset revisions matched before and after collection. Requests returned aggregate counts only and needed no TypeSafe key or Jev calls.

The [saved public example](../../pipeline/examples/public-2023-2024/README.md) replayed successfully in Docker with network access turned off. The actual command is also tested with network calls blocked: changed file hashes fail, existing outputs are refused and invalid data leaves no final snapshot. The documented Compose command saved its output to a host-mounted folder successfully on Mac Docker; Windows and physical Linux host permissions were not tested.

Independent review found two gaps: positive PHI wording could pass the source check, and saving could accept missing provenance. Both now have negative tests and stricter validation. The collector also handles the source's `120 +` label through an explicit recorded mapping.

These checks establish collection, validation and repeatability. The historical data has not been used to validate clinical decisions or individual bed-release predictions. Revision checks are not a transactional snapshot, and file hashes do not certify compliance. [Run the pipeline](../../pipeline/README.md).

## Bed-readiness tests first

Checked October 2, 2026 on the bed-readiness draft branch. There are 51 complete fictional scenarios, two forecast invariants and 105 invalid-input assertions. Both fixture checks pass; all 158 forecast/validation assertions fail against the NOT_IMPLEMENTED placeholder. No tests are skipped. This is the expected red stage before writing the timing function, not a working predictor.

The same 160-test result was reproduced in Docker with network access turned off. The existing app checks and all 163 public-data pipeline tests pass on the host and in Docker. No TypeSafe key or live model call was used.

Independent review checked the scenario arithmetic, fixed queue order, status precedence and separate earliest/latest overlap checks. It identified two missing cases, which were added: only the latest scenario failing to fit, and a busy-task window partly elapsed at the snapshot. Invalid-input checks verify named issues, input immutability and multiple independent errors.

The [draft instructions](../../readiness/README.md) explain the placeholder and the test commands. GitHub runs the new suite as part of its required Tests check; this draft must not merge while the new assertions fail. Planning notes remain outside the repository.
