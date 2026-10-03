# Nurse walkthrough

I updated the walkthrough to cover the whole project in 12 parts. It runs for about 4 minutes 10 seconds, with Kalvin narration, actual UI captures and an animated cursor. Every patient is made up.

[Download the video](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.0/jev-project-walkthrough.mp4) or watch it on the [project front page](../../README.md). The [transcript](../walkthrough/nurse-walkthrough-script.md) has the full narration.

| Start | Part |
| --- | --- |
| 0:00 | Why I made it |
| 0:17 | Run your own copy |
| 0:38 | Read status and time together |
| 0:59 | A nurse's observation |
| 1:18 | Practice: improving |
| 1:39 | Practice: needs review |
| 1:59 | Practice: unclear |
| 2:19 | An edited note needs a fresh answer |
| 2:37 | Optional Jev connection |
| 2:57 | Time room cleaning |
| 3:22 | Separate timing example |
| 3:43 | Data, checks and sharing |

## Follow along without a key

Select a bed, choose **Improving**, **Needs review**, or **Unclear**, then press **Show expected answer (no API)**. These are written expected answers marked **SAMPLE ONLY**. The recording makes no live Jev call. **Ask Jev (uses your API)** is a separate action for someone using their own TypeSafe key.

Editing the note clears the old result and resets the practice selection. A written expected answer applies only to its unchanged practice note. Feedback on a live unclear answer asks for more specific observations; it does not grade the nurse.

The cleaning section shows a timer started, resumed after a reload, and finished. It saves room IDs and timestamps in that browser. Finishing still says **awaiting staff release**. The few seconds shown demonstrate the controls, not a typical cleaning time.

The command-line [readiness example](../../readiness/README.md) and [public-data pipeline](../../pipeline/README.md) are separate from the bedboard. The readiness example leaves actual bed status unchanged. The saved pipeline example uses public aggregate counts for 2023 and 2024; admission stay lengths are not individual bed-release forecasts.

The [PDF screenshot guide](../walkthrough/nurse-walkthrough.pdf) remains the earlier quick guide with numbered cursor markers. See [the quick test](Quick-Testing.md) for the current practice controls and [the Jev checks](Evaluation-Results.md) for earlier recorded model answers.

These steps demonstrate the local app. They do not establish clinical accuracy, confirm cleaning quality, or authorize a bed's release. Keep real patient information out of this demo.
