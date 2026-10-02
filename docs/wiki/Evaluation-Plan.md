# What I would test next

The software checks and a small fictional-note experiment passed. I have not measured clinical accuracy or hospital performance. See [the recorded experiment](Evaluation-Results.md).

## Compare the models fairly

I would give Jev and the cheaper candidate the same made-up notes and category definitions. I would label the expected answers first, keep related patient examples together, and save a separate set for the final comparison.

I would record the exact model, questions, date, dataset version, and provider. Then I would compare correct categories, missed blockers, invented blockers, unclear answers, invalid responses, timeouts, latency, and billed cost. I would also compare both models with a simple structured form that uses no model.

The comparison page uses five categories. The current app uses three progress categories. Those must be made consistent before running a fair comparison.

## Check the bed behavior

- A two-day C-section example still needs confirmed departure before the bed can be released.
- A pain score of 4 does not automatically add a fixed number of hours.
- Missing pain or milestones remain unknown.
- Bowel injury without a team estimate means an unknown departure time, not an automatic five-day stay.
- A patient who has left still leaves cleaning and release checks to complete.
- A countdown reaching zero asks for confirmation and does not change status.
- A maintenance or staffing hold still blocks availability.
- A model answer never changes a bed state by itself.

The current app shows fixed snapshots. Transfers, saved assessments, staff approvals, and a live bed-state workflow would need more code and separate tests.

## Current results

| Check | Status |
|---|---|
| Research links, 22 made-up histories, and six current snapshots | Prepared and checked locally |
| API contract, key setup, and provider error paths | Fixture tests passed |
| Five additional behavior tests | Passed after the probability-validation fix |
| Container startup permissions and HTTPS | Passed on the two tested architectures |
| Successful request with a real key | Recorded; revised labels matched 8 retests and 10 fresh fictional notes |
| Cheaper-model call and measured comparison | Not run |
| Clinical or bed-time accuracy | Not evaluated |

The 22 histories are examples to start with. They are not enough to claim a validated bed-time predictor. If I add a predictor later, I would compare it with a procedure-only baseline using only information available at the time of each prediction.

See [what was tested](Verification.md) for the evidence and limits.
