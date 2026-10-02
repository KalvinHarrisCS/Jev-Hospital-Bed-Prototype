# Jev Hospital Bed Prototype

I wanted to build something basic for hospital logistics: show which beds are free, which ones are still occupied, and when another bed might be ready.

I kept the app small so someone else can run it and change it. It has 20 made-up beds, status codes, countdowns, pain scores, milestone counts, and an optional Jev connection for progress notes. This is a gift to anyone who wants to use it or learn from it.

**Demo only. Not for production or real patient information.** See [Security and production](Security-and-Production.md) for the HIPAA considerations and changes a hospital deployment would need.

**Provided as is, without warranties.** See [Demo use and liability](Demo-Use-and-Liability.md) for the disclaimer and this release's intended use.

## Run it

Start Docker Desktop. From the unzipped project folder, run:

```sh
docker compose -f container/compose.yaml up --build
```

Open `http://localhost:8787`. You can browse the board without a key. To try Jev, enter your TypeSafe key in the app, or set `TYPESAFE_API_KEY` in the same terminal before starting it. Press Ctrl+C to stop.

## What it does

A nurse selects a bed and reads the patient's made-up progress snapshot. Jev can classify a written update and report how likely it is that the note mentions a delay or blocker. Staff still review the answer.

The bed times are fixed examples. Jev does not predict a departure time or release a bed. A countdown reaching zero says **Confirm readiness**.

## Testing

See [the Jev evaluation](Evaluation-Results.md) for the fictional test notes and recorded answers. Staff still review the result and confirm bed readiness.

## Read more

- [Docker setup](Container-Setup.md)
- [Key setup on Windows and Mac](Environment-Setup.md)
- [Nurse walkthrough](Nurse-Walkthrough.md)
- [Change the project](Customization.md)
- [Security, HIPAA and production changes](Security-and-Production.md)
- [Demo use and liability](Demo-Use-and-Liability.md)
- [Research and references](Research-and-References.md)
- [Made-up patient histories](Patient-Histories.md)
- [Pain and milestones](Progress-and-Pain.md)
- [Bed workflow](Bed-Availability-Workflow.md)
- [How Jev is connected](Jev-Integration.md)
- [Jev and a cheaper model](Model-Comparison.md)
- [What was tested](Verification.md)
- [What I would test next](Evaluation-Plan.md)
- [Repeat the setup](Repeatable-Setup.md)
- [Use and share it](Reuse-and-Sharing.md)
- [Project notes](Project-Log.md)

- [Try it quickly](Quick-Testing.md)
- [Recorded Jev checks](Evaluation-Results.md)
- [Cleaning research](Cleaning-Research.md)
