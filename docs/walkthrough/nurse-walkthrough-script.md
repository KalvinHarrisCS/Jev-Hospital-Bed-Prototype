# Narrated project walkthrough

Kalvin narration. About 4 minutes 10 seconds, in 12 parts. Actual UI captures with an animated cursor. Fictional patients; demo only.

[Download the video](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.0/jev-project-walkthrough.mp4) · [Chapter list](../wiki/Nurse-Walkthrough.md) · [Subtitles (VTT)](jev-project-walkthrough.vtt) · [Subtitles (SRT)](jev-project-walkthrough.srt)

The practice results shown are written expected answers marked **SAMPLE ONLY**. No live Jev call was made in this recording. The readiness example and public aggregate pipeline are separate from the bedboard.

## 0:00 — Why I made it

Hey, I'm Kalvin. I put this project together to explore a basic hospital question: which bed is available, and when might the next one be ready? It is a small prototype with fictional patients. I wanted to make something others could run, change, and learn from.

## 0:17 — Run your own copy

The files live on GitHub. With Docker Desktop running, clone the repository, move into the project folder, and run the Compose command shown here. Open localhost, port eighty-seven eighty-seven. Leave the terminal running. The first build needs internet. Docker packages the app; it does not include Jev's model or an API key.

## 0:38 — Read status and time together

The board shows twenty made-up beds across maternity, gynecology, and day surgery. There are three available, twelve occupied, three in turnaround, and two on hold. Read each status with its estimated time. An unknown estimate stays unknown. This board uses a fixed demo clock. A countdown never releases a bed.

## 0:59 — A nurse's observation

For a nurse, start by selecting a bed. Here we have MAT zero two, a fictional cesarean patient, pain rated four out of five, and four of eight milestones met. The progress note should say what changed and which follow-up is pending. These examples do not replace a care team's assessment.

## 1:18 — Practice: improving

Choose the Improving practice note. It explicitly says walking and meals are better than yesterday. Press Show expected answer. The result is marked sample only. This is a written example answer, with no model call. It describes improvement in the note, but it does not confirm discharge or change the bed's status.

## 1:39 — Practice: needs review

Now choose Needs review. Pain is limiting walking, nursing reassessment is pending, and departure is delayed. Those are explicit blockers. The written expected answer is needs review. That means the observations and follow-up need attention. It is not an instruction to discharge the patient or assign the bed to someone else.

## 1:59 — Practice: unclear

The Unclear case says an update was received, but it gives no recovery trend. Its written expected category is unclear. For a live unclear answer, the app asks for more detail about changes in pain, walking or meals, and pending reassessment. That is feedback on the note, not a grade for the nurse.

## 2:19 — An edited note needs a fresh answer

If I edit the note, the old answer clears and the practice selection resets. The app says to use an unchanged practice case or ask Jev again. That keeps an answer from quietly following a different note. Changing the selected bed also clears the old result.

## 2:37 — Optional Jev connection

No key was needed for those practice cases. Open Jev connection and setup, then check server setup. This copy has no server key. Someone can supply their own key in the optional field or through the server environment. Ask Jev is the button that sends the fictional note to TypeSafe. We are not making that call in this walkthrough.

## 2:57 — Time room cleaning

Choose Time room cleaning and select a turnaround room. Start cleaning records the computer's actual time. The timer saves room IDs and timestamps in this browser, and resumes after a reload. Finish cleaning records elapsed minutes and updates the local average. It still says awaiting staff release. These few seconds only demonstrate the timer; they are not a typical cleaning duration.

## 3:22 — Separate timing example

There is also a separate readiness example you can run from the command line. It considers departure windows, cleaner availability, breaks, and a shift. The two-room example shows estimated windows in New York time. Both rooms remain occupied, with release pending. This timing function is not connected to the board yet and needs no Jev key.

## 3:43 — Data, checks and sharing

The separate data pipeline can replay saved public aggregate counts from New York for twenty twenty-three and twenty twenty-four, offline. Those stay lengths cover the whole admission; they are not individual bed-release forecasts. The project has five hundred and two automated tests. GitHub also checks Docker build exclusions. It is a gift: try it, change it, or build on it. Keep it to fictional patients. This is a demo for learning and review.
