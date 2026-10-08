# Using the demo

I put this together to explore a basic hospital question: which bed is available, and when might the next one be ready?

I kept it small: 20 made-up beds, status codes, time estimates, and a place to try Jev on a nurse's progress note. Created by [Kalvin Harris](https://github.com/KalvinHarrisCS).

**Demo only. Not for production or real patient information.** This project has not been assessed for HIPAA compliance or clinical use. [Security and the path to production](../security/DEMO-SECURITY.md) explains the current safeguards, external data flow and what I would update before hospital use.

**Provided as is, without warranties.** The authors and copyright holders disclaim liability to the fullest extent permitted by applicable law. Read the [demo use and liability notice](../security/DEMO-NOTICE.md) and the [copyright and permissions notice](../../LICENSE) before using or sharing it.

The Jev connection was checked against published examples. The included tests let you check your own copy.

Start with the [four-minute project walkthrough](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.1/jev-project-walkthrough.mp4). It has 12 parts, Kalvin narration, actual app captures and a moving cursor. [The chapter list](../wiki/Nurse-Walkthrough.md) and [transcript](../walkthrough/nurse-walkthrough-script.md) help you follow along. The [PDF screenshot guide](../walkthrough/nurse-walkthrough.pdf) is the earlier quick guide.

The video runs the three written practice cases without an API key. Their answers say **SAMPLE ONLY**. It then uses **Ask Jev (uses your API)** with a fictional MAT-02 note and a configured server key. The genuine response is **needs review**, with a delay score of 0.97; MAT-02 stays occupied and its estimate stays unknown. It also shows editing a note, timing cleaning across a reload, and the separate readiness and public-data examples.

## Run it with Docker

Start Docker Desktop. Clone the project and move into its folder:

```sh
git clone https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype.git
cd Jev-Hospital-Bed-Prototype
```

If you downloaded a ZIP, unzip it and open a terminal in the project folder instead. Then run:

```sh
docker compose -f container/compose.yaml up --build
```

Open [localhost:8787](http://localhost:8787). The first build downloads the runtime; later starts reuse it. Leave the terminal open. Press **Ctrl+C** when you are done.

GitHub stores the files. Docker runs the app on your computer; no hosted preview is required. The page uses the container's local endpoints. Live Jev requests go to TypeSafe; the written practice answers need no API connection.

You can browse all 20 beds without a key. The command works in Mac Terminal and Windows PowerShell with Docker Desktop using Linux containers. Docker must be installed and allowed on your computer. All Docker files are in `container/`.

If port 8787 is already in use, stop the other bedboard first. More help is in [Docker setup](../../container/README.md).

If you prefer Node.js 22 or newer, run `npm ci`, `npm test`, then `npm run dev`. Open the address Wrangler prints.

## Use the demonstration

For a quick run, press **Try a nurse note**, choose a practice case, and press **Show expected answer (no API)**. No key is needed for that written example. Try **Improving**, **Needs review**, and **Unclear**. Each expected answer is marked **SAMPLE ONLY**, with **Bed state unchanged**. See [the quick test](QUICK-TEST.md).

Select a bed and read the status, pain score, milestones, and note. You can edit the made-up note. Editing clears the old answer and resets the practice selection. Changing the bed also clears the old result. A written expected answer applies only to its unchanged practice note.

To try Jev, expand **Jev connection & setup**, then press **Check server setup**. If your server has a key, leave the password field blank. Otherwise, get your own key from [TypeSafe](https://console.typesafe.ai) and enter it in the password field. Press **Ask Jev (uses your API)**. The app keeps a pasted key in this tab only; a reload clears it.

If you already exported `TYPESAFE_API_KEY`, the Docker command picks it up from that same terminal. See [key setup](ENVIRONMENT-SETUP.md). Jev still calls TypeSafe online, so its account and billing requirements apply.

Jev returns a progress category and a probability that the note affirms a current delay or blocker. A live unclear answer gets a suggestion to add more detail. A nurse still reviews that answer. The bed times are made-up examples, and a countdown reaching zero says **Confirm readiness**. It never frees a bed automatically. The demo clock starts October 1, 2026 at 10 a.m. New York time.

Press **Time room cleaning** to record start, finish, elapsed minutes and the local average. The timer saves room IDs and timestamps in this browser and survives a reload. Finishing still leaves staff release to confirm. The [research](../wiki/Cleaning-Research.md) separates cleaning time from total turnover.

The video records a short cleaning interval to show the controls. Those few seconds are not a typical cleaning duration.

## Try the separate examples

The [readiness example](../../readiness/README.md) runs from the command line without a Jev key. It uses departure windows, cleaner availability, breaks and a shift to estimate room-ready windows. The two-room example prints New York times and keeps both rooms occupied with staff release pending. This function is not connected to the bedboard.

The [public-data pipeline](../../pipeline/README.md) can replay saved New York aggregate counts for 2023 and 2024 offline. Its stay lengths cover the whole admission. They are not individual bed-release forecasts and do not change the board.

## What I checked

The app, data pipeline and timing checks passed in Docker before recording. GitHub also checks Docker build exclusions. [Testing](../testing/TESTS.md) explains how to run those checks on your own copy. The earlier setup and software checks are recorded in [Verification](../testing/VERIFICATION.md). [The Jev evaluation](../testing/EVALUATION.md) includes earlier fictional notes, returned answers and original failures. These checks do not establish clinical accuracy.

To run the included checks after building:

```sh
docker compose -f container/compose.yaml run --rm --build bedboard npm test
```

I used [TypeSafe's API documentation](https://docs.typesafe.ai/api) and this [published Jev server example](https://github.com/davila7/jev-explained/blob/main/src/app/api/jev/route.ts) to check the connection pattern.

## Documentation

- [Quick test without a key](QUICK-TEST.md)
- [Actual Jev results](../testing/EVALUATION.md)
- [Change the beds, scenarios and model questions](CUSTOMIZE.md)
- [Demo security, HIPAA and future production work](../security/DEMO-SECURITY.md)
- [Demo use and liability notice](../security/DEMO-NOTICE.md)
- [Repeat the setup and understand what the checks prove](REPRODUCIBILITY.md)
- [Windows / Mac environment setup](ENVIRONMENT-SETUP.md)
- [Docker setup](../../container/README.md)

`docs/wiki/` has the research, 22 made-up patient histories, milestones, and the model comparison plan. `docs/walkthrough/nurse-walkthrough.pdf` is the earlier nurse screenshot guide. The current narrated video is on the [project front page](../../README.md).

Every patient is made up. I chose a 1-5 pain scale for this example. This app saves only cleaning room IDs and timestamps in the browser. It does not save patient notes or decide when someone can leave hospital.

## Credit and contact

Copyright (c) 2026 Kalvin Harris. All rights reserved. See the [copyright and permissions notice](../../LICENSE) and contact Kalvin for permission to reuse or redistribute the original project. External research and dependencies keep their own terms; see [references](../research/THIRD-PARTY.md).

**Want this app retargeted for your use case? Get in touch with [Kalvin Harris](https://github.com/KalvinHarrisCS).**
