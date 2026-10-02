# Narrated project walkthrough

A guided tour of the bedboard, nursing notes, Jev results and room cleaning.

## The project

Hey, I'm Kalvin. I put this project together around one basic question: which hospital bed is available, and when might another one be ready? It is a small obstetrics and gynecology demo with twenty made-up beds. I want other people to be able to run it, adjust it, and build on it.

## Read the bed register

Start with the ward bed register. Available, occupied, cleaning, awaiting cleaning, and hold each have a code. Read that status together with the estimated time. An unknown time stays unknown. When a countdown ends, the app asks staff to confirm readiness. It never frees an occupied bed by itself.

## Write the nursing observation

In the nursing observation form, select a bed and read the recorded snapshot. This made-up patient has pain rated four out of five and four of eight milestones met. The note should describe what changed in pain, walking or meals, and what reassessment is still pending. Editing this note does not save a patient record.

## Try a practice case

For a quick test, choose a practice note and press Show expected answer. That written example works without an API key. For a real model answer, open Jev connection and setup. The app can use a server environment variable or a key kept only in the current tab. Keep your key out of screenshots and GitHub.

## Review the Jev result

Jev returns a structured answer: improving, needs review, or unclear, plus a probability that the note states a current blocker. Here, a vague note gets a suggestion to add more detail. That helps clarify the observation. It does not grade the nurse, authorize discharge, or change the bed state.

## Time room cleaning

Cleaning is another step before a bed can be used again. Select a room in turnaround, then press Start cleaning and Finish cleaning. The app records elapsed minutes and a local average. These room IDs and timestamps stay in the browser. Completion still says awaiting staff release, because timing alone does not prove cleaning quality.

## Use the research carefully

I included the research so people can see where the examples came from. One Iowa study measured a median of thirty-three minutes for manual cleaning and fifty-eight minutes for total room turnover. Those are different clocks, and they are not a universal obstetrics and gynecology target. A hospital would measure its own process.

## Run it and make it yours

The whole app runs in Docker. The documentation shows how to run it, change the examples, and test your copy. This is a demo, not for production. Do not enter real patient information. The security guide shows where I would add staff logins, protected records and audit logs, and where a hospital team would review HIPAA and provider agreements. This is a gift: take it, test it, and make it yours.
