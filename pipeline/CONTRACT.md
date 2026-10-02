# Stay-summary contract, version 1

This is what `summarizeCohort(input)` needs to do. It handles one procedure and one year, returns its answer right away, and gives the same answer for the same input. It leaves the input alone. Downloading and saving data happen in a separate step.

## What goes in

| Field | Rule |
| --- | --- |
| `schemaVersion` | Exactly `1` |
| `procedureCode` | `PGN003`, `PGN002` or `FRS001` |
| `year` | Integer `2023` or `2024` |
| `expectedDischarges` | Nonnegative safe integer from a separate count query for this procedure/year |
| `source` | The provenance object below |
| `histogram` | Array of `{lengthOfStay, discharges}` frequency bins |

Each bin has a canonical string `lengthOfStay`: `1` through `119`, or `120+`. Numeric values, leading zeros, blanks and exact `120` are rejected. Bin counts must be positive safe integers. Duplicate stay bins are rejected. Their sum must be a safe integer and equal `expectedDischarges`.

An explicitly empty cohort has `expectedDischarges: 0` and `histogram: []`. Missing data and extraction failures must never be converted into that empty cohort. Unsupported fields at the input, source or bin level are rejected rather than silently carried into output.

## Where the data came from

`source` has exactly these fields:

| Field | Rule |
| --- | --- |
| `kind` | `synthetic` or `sparcs-public-aggregate` |
| `datasetId` | Synthetic: `fixture-2023` / `fixture-2024`, matching the year. Public: `46xm-urtu` / `sf4k-39ay`, matching the year. |
| `retrievedAt` | Valid canonical UTC ISO timestamp, including milliseconds and `Z` |
| `query` | Nonblank string recording the actual aggregate query; fixtures identify their invented cohort |
| `codingVersion` | Public: `CCSR 2025.1`; synthetic: `fixture-v1` |

The future download step must check the source fields and coding version first. This information tells us where the data came from. Permission to use it, complete downloads and privacy still need their own checks.

## What comes out

Output has exactly these fields:

| Field | Meaning |
| --- | --- |
| `schemaVersion`, `procedureCode`, `year`, `source` | Preserved input values |
| `procedureDescription` | `CESAREAN SECTION`, `SPONTANEOUS VAGINAL DELIVERY` or `HYSTERECTOMY`, matched to its code |
| `unit` | Exactly `patient_days` |
| `quantileMethod` | Exactly `weighted_nearest_rank` |
| `discharges` | Reconciled sum of bin counts |
| `p25PatientDays`, `medianPatientDays`, `p75PatientDays` | Integer 1–119, literal `120+`, or `null` for an empty cohort |
| `censoredDischarges` | Count in the `120+` bin; zero when absent |
| `smallSample` | `true` for 1–29 discharges; otherwise `false` |
| `status` | `ok` or `empty` |
| `histogram` | Validated bins sorted from shortest stay to `120+` |

For each quantile, sort the bins, calculate rank `ceil(fraction × discharges)` and return the first bin whose cumulative count reaches that rank. Fractions are 0.25, 0.5 and 0.75. Ranks must remain exact across the accepted safe-integer range. An even-count median is not averaged. Preserve `120+` when a rank lands in that bin; do not return exact 120, a precise mean or hours.

The middle-half range describes past stays. It does not promise a stay length for one patient. The small-sample flag tells us to take a closer look at a small group; it does not make the result clinically validated.

## When the input is wrong

Throw an `Error` with `code` equal to `INVALID_INPUT` for invalid fields, metadata, stay bins, counts or unsafe totals; `DUPLICATE_BIN` for repeated stay bins; and `COUNT_MISMATCH` for a valid histogram whose count differs from its independent total. Do not return a partial summary after validation fails.

The function currently throws `NOT_IMPLEMENTED`. The tests fail there until we write the function.
