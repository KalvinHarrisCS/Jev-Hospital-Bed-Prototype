# Narrated project walkthrough

Kalvin narration. About four minutes, in 12 parts. Actual UI captures with an animated cursor. Fictional patients; demo only.

[Download the video](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.1/jev-project-walkthrough.mp4) · [Chapter list](../wiki/Nurse-Walkthrough.md) · [Subtitles (VTT)](jev-project-walkthrough.vtt) · [Subtitles (SRT)](jev-project-walkthrough.srt)

The practice results shown are written expected answers marked **SAMPLE ONLY**, with no model call. The later **Ask Jev for real** section shows a genuine live response to a fictional MAT-02 note. The readiness example and public aggregate pipeline are separate from the bedboard.

## 0:00 — Why I made it

Hey, I'm Kalvin. You've got twenty beds, patients recovering, and another admission coming. Which bed is actually ready? Here's the small Jev prototype I put together to explore that. The patients are fictional. You can run it, change it, and build on it.

## 0:14 — Run your own copy

The files live on GitHub. With Docker Desktop running, clone the repository, move into the project folder, and run the Compose command shown here. Open localhost, port eighty-seven eighty-seven. Leave the terminal running. The first build needs internet. Docker packages the app; it does not include Jev's model or an API key.

## 0:35 — Read status and time together

The board shows twenty made-up beds across maternity, gynecology, and day surgery. There are three available, twelve occupied, three in turnaround, and two on hold. Read each status with its estimated time. An unknown estimate stays unknown. This board uses a fixed demo clock. A countdown never releases a bed.

## 0:56 — A nurse's observation

For a nurse, start by selecting a bed. Here we have MAT zero two, a fictional cesarean patient, pain rated four out of five, and four of eight milestones met. The progress note should say what changed and which follow-up is pending. These examples do not replace a care team's assessment.

## 1:15 — Practice: improving

Choose the Improving practice note. It explicitly says walking and meals are better than yesterday. Press Show expected answer. The result is marked sample only. This is a written example answer, with no model call. It describes improvement in the note, but it does not confirm discharge or change the bed's status.

## 1:35 — Practice: needs review

Now choose Needs review. Pain is limiting walking, nursing reassessment is pending, and departure is delayed. Those are explicit blockers. The written expected answer is needs review. That means the observations and follow-up need attention. It is not an instruction to discharge the patient or assign the bed to someone else.

## 1:55 — Practice: unclear

The Unclear case says an update was received, but it gives no recovery trend. Its written expected category is unclear. For a live unclear answer, the app asks for more detail about changes in pain, walking or meals, and pending reassessment. That is feedback on the note, not a grade for the nurse.

## 2:15 — An edited note needs a fresh answer

If I edit the note, the old answer clears and the practice selection resets. The app says to use an unchanged practice case or ask Jev again. That keeps an answer from quietly following a different note. Changing the selected bed also clears the old result.

## 2:32 — Ask Jev for real

Now let's actually ask Jev. This server has a key configured, so the private field stays empty. For MAT zero two, I enter a fictional update: pain limits walking, meals are tolerated, and reassessment is pending. I click Ask Jev. The real answer comes back as needs review, with a high delay score. That's a flag for staff to review the note and follow-up. The bed stays occupied.

## 2:56 — Time room cleaning

Choose Time room cleaning and select a turnaround room. Start cleaning records the computer's actual time. The timer saves room IDs and timestamps in this browser, and resumes after a reload. Finish cleaning records elapsed minutes and updates the local average. It still says awaiting staff release. These few seconds only demonstrate the timer; they are not a typical cleaning duration.

## 3:21 — Separate timing example

There is also a separate readiness example you can run from the command line. It considers departure windows, cleaner availability, breaks, and a shift. The two-room example shows estimated windows in New York time. Both rooms remain occupied, with release pending. This timing function is not connected to the board yet and needs no Jev key.

## 3:41 — Data, checks and sharing

The separate data pipeline replays saved public aggregate counts from New York for twenty twenty-three and twenty twenty-four, offline. Those stay lengths cover the whole admission; they are not individual bed-release forecasts. GitHub runs the project checks automatically. You can clone it, change the examples, and build on it. This is a gift for learning and review. Keep it to fictional patients.
