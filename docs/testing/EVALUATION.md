# What happened when I tried Jev

Checked October 1, 2026, America/New_York. I used made-up notes and wrote the expected labels before each test set ran. These are my labels for a small software demo, not labels from a clinical study.

The returned model was **jev-1.13.0**. The app requested `jev-latest`. I made **28 calls** in this pass: eight original notes, eight retests, ten fresh notes, and two actual browser checks. The key stayed in the running local container. No key is in this report or result file.

| Set | Expected categories matched | Timing in this run | What this proves |
|---|---|---|---|
| Original questions, 8 notes | 6 of 8 | Median 0.169 seconds | Two notes exposed a category-definition problem |
| Revised questions, same 8 notes | 8 of 8 | Median 0.199 seconds | A retest on the notes used for tuning |
| Revised questions, 10 fresh notes | 10 of 10 | Median 0.181 seconds; range 0.144-0.267 | Agreement on these new fictional examples |
| Actual browser, vague preset twice | `unclear` both times | Displayed request time recorded in JSON | The page showed the note-detail guidance after a real response |

The first timing used the running Docker Worker's HTTP endpoint. The revised batches used the same Worker module in Node 22 inside that container with its process environment supplied privately. This avoids copying the key. The browser checks used the running Docker Worker after the source update. Different request paths and a small warm test set prevent a general speed claim.

## What I changed

The original criteria put a missing assessment under `needs_review`, which made a vague note overlap with `unclear`. A note containing only a patient identifier and procedure also came back as `improving`.

I changed the wording so the model uses only observations in the submitted note for the label. Missing detail by itself means `unclear`. Explicit worsening, blockers, delays or pending assessment mean `needs_review`, including when improvement is also mentioned. It must not infer improvement from the absence of a blocker. Negated or resolved blockers are not current blockers.

An `unclear` answer now gives the writer a specific suggestion: add what changed in pain, walking or meals and whether reassessment is pending. The app keeps the submitted note beside the answer and clears stale sample feedback on editing.

## Fresh-note results

| Case | Expected | Returned | Current-blocker probability |
|---|---|---|---|
| unchanged | `unclear` | `unclear` | 0.21 |
| resolved-delay | `improving` | `improving` | 0.04 |
| administrative | `unclear` | `unclear` | 0.05 |
| transport-pending | `needs_review` | `needs_review` | 0.94 |
| assessment-pending | `needs_review` | `needs_review` | 0.94 |
| no-worsening | `unclear` | `unclear` | 0.10 |
| comparison | `improving` | `improving` | 0.05 |
| subjective-worsening | `needs_review` | `needs_review` | 0.75 |
| different-bed-improvement | `improving` | `improving` | 0.06 |
| different-bed-administrative | `unclear` | `unclear` | 0.04 |

These probabilities are not discharge probabilities or calibrated risks. No decision threshold was validated. A countdown, sample answer, or model answer never releases a bed.

## Repeat it or challenge it

Use [the quick test](../guides/QUICK-TEST.md) for three ready-made notes. [The full results](../../data/evaluation-results.json) contain every note, expected label, returned probability, model version, measured time, and token usage, including the two original failures. The questions are in `worker/index.js`.

Reported usage in these 28 responses totals **13528 input tokens** and **1688 output tokens**. I did not verify billed cost. Model outputs may change on a rerun or when `jev-latest` changes.

This is a small check of note classification and the app connection. It does not establish clinical accuracy, a bed-time predictor, cleaning quality, or performance on real hospital notes. The cheaper-model comparison has not run.

## Narrated walkthrough example

After the hospital-form layout update, one additional browser request returned `unclear` for the vague fictional MAT-02 note. The page displayed 0.3 seconds and a current-blocker probability of 0.09. Reported usage was 496 input and 60 output tokens. This is separate from the 28-call tuning evaluation above; 29 actual calls are now recorded in the result file.
