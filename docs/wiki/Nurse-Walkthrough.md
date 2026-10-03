# Nurse walkthrough

I updated the walkthrough to cover the whole project in 12 parts. It runs for about four minutes, with Kalvin narration, actual UI captures and an animated cursor. Every patient is made up.

[Download the video](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.1/jev-project-walkthrough.mp4) or watch it on the [project front page](../../README.md). The [transcript](../walkthrough/nurse-walkthrough-script.md) has the full narration.

| Start | Part |
| --- | --- |
| 0:00 | Why I made it |
| 0:14 | Run your own copy |
| 0:35 | Read status and time together |
| 0:56 | A nurse's observation |
| 1:15 | Practice: improving |
| 1:35 | Practice: needs review |
| 1:55 | Practice: unclear |
| 2:15 | An edited note needs a fresh answer |
| 2:32 | Ask Jev for real |
| 2:56 | Time room cleaning |
| 3:21 | Separate timing example |
| 3:41 | Data, checks and sharing |

## Follow along without a key

Select a bed, choose **Improving**, **Needs review**, or **Unclear**, then press **Show expected answer (no API)**. These are written expected answers marked **SAMPLE ONLY**. No model call is made for those practice results.

Editing the note clears the old result and resets the practice selection. A written expected answer applies only to its unchanged practice note. Feedback on a live unclear answer asks for more specific observations; it does not grade the nurse.

## The live Jev call

At 2:32, the video shows **Ask Jev (uses your API)** with a fictional MAT-02 note: pain limits walking, meals are tolerated, and reassessment is pending. This server has its own key configured; the private field stays empty. To make your own live call, follow [key setup](../guides/ENVIRONMENT-SETUP.md).

The genuine recorded response from `jev-1.13.0` is **needs review**, with a delay score of 0.97 and a displayed response time of 0.3 seconds. That score concerns a delay or blocker described in the note. MAT-02 stays **OCC**, and its estimate stays **Unknown**. Staff still review the answer and confirm readiness.

The cleaning section shows a timer started, resumed after a reload, and finished. It saves room IDs and timestamps in that browser. Finishing still says **awaiting staff release**. The few seconds shown demonstrate the controls, not a typical cleaning time.

The command-line [readiness example](../../readiness/README.md) and [public-data pipeline](../../pipeline/README.md) are separate from the bedboard. The readiness example leaves actual bed status unchanged. The saved pipeline example uses public aggregate counts for 2023 and 2024; admission stay lengths are not individual bed-release forecasts.

The [PDF screenshot guide](../walkthrough/nurse-walkthrough.pdf) remains the earlier quick guide with numbered cursor markers. See [the quick test](Quick-Testing.md) for the current practice controls and [the Jev checks](Evaluation-Results.md) for earlier recorded model answers.

These steps demonstrate the local app. They do not establish clinical accuracy, confirm cleaning quality, or authorize a bed's release. Keep real patient information out of this demo.
