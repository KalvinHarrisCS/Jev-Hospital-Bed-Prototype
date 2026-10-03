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
| Successful valid-key inference | 28 real calls recorded: 8 baseline, 8 tuned retests, 10 fresh notes and 2 browser calls. Returned model `jev-1.13.0`. | All notes fictional; see [results](Evaluation-Results.md). This is not clinical validation. |
| Fast practice flow and note guidance | Seven behavior tests pass; sample results make no provider calls; editing clears old answers. Actual browser showed detail guidance after Jev. | Expected examples are written labels; no inference occurs in sample mode. |
| Cleaning timings | Four fixture tests pass: elapsed duration, reload, two-tab updates, storage failures and validated fields. | Local browser log and device clock; no shared hospital database or measured cleaning-quality outcome. |
| Clinical or forecasting accuracy | Not evaluated. | Synthetic category agreement is not clinical validation. |

The first connection attempt with a user-supplied key failed because the slim container lacked the certificate bundle used by workerd. I added pinned Debian CA certificates and OpenSSL while keeping HTTPS verification enabled.

I also left the packages owned by root after installation, which prevented the regular app user from creating `/app/node_modules/.mf`. I fixed ownership in the Dockerfile. The old check missed this because it checked the response and ignored startup logs. The updated check reads the logs and fails on permission errors.

Commands recipients can repeat:

```sh
docker compose -f container/compose.yaml up --build
docker compose -f container/compose.yaml run --rm --build bedboard npm test
docker compose -f container/compose.yaml run --rm --build bedboard npm run check:https
```

The last command sends only an invalid fixture key and fictional note to TypeSafe. It requires network access. Ordinary `npm test` makes no provider calls.
