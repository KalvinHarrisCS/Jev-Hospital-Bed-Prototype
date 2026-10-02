# Jev Hospital Bed Prototype

Watch the nurse walkthrough:

https://github.com/user-attachments/assets/402d6303-6abf-45cc-8257-ddf5911f9732

I put this together to explore a basic hospital question: which bed is available, and when might the next one be ready?

I kept it small: 20 made-up beds, status codes, time estimates, and a place to try Jev on a nurse's progress note. This is a gift to anyone who wants to run it, change it, or learn from it.

**Demo only. Not for production or real patient information.** This project has not been assessed for HIPAA compliance or clinical use. [Security and the path to production](DEMO-SECURITY.md) explains the current safeguards, external data flow and what I would update before hospital use.

**Provided as is, without warranties.** The authors and copyright holders disclaim liability to the fullest extent permitted by applicable law. Read the [demo use and liability notice](DEMO-NOTICE.md) and the [MIT license](LICENSE) before using or sharing it.

The Jev connection was checked against published examples. The included tests let you check your own copy.

Start with the [screenshot guide](nurse-walkthrough.pdf) or [project wiki](docs/wiki/Home.md). You can also [download the narrated walkthrough](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.0.0/obgyn-narrated-walkthrough.mp4).

## Run it with Docker

Start Docker Desktop. Unzip the project and open a terminal in the folder with this README. Run this one command:

```sh
docker compose -f container/compose.yaml up --build
```

Open [localhost:8787](http://localhost:8787). The first build downloads the runtime; later starts reuse it. Leave the terminal open. Press **Ctrl+C** when you are done.

GitHub stores the files. Docker runs the app on your computer; no hosted preview is required. The page uses the container's local endpoints. Live Jev requests go to TypeSafe; the written practice answers need no API connection.

You can browse all 20 beds without a key. The command works in Mac Terminal and Windows PowerShell with Docker Desktop using Linux containers. Docker must be installed and allowed on your computer. All Docker files are in `container/`.

If port 8787 is already in use, stop the other bedboard first. More help is in [Docker setup](container/README.md).

If you prefer Node.js 22 or newer, run `npm ci`, `npm test`, then `npm run dev`. Open the address Wrangler prints.

## Use the demonstration

For a quick run, press **Try a nurse note**, choose a practice case, and press **Show expected answer (no API)**. No key is needed for that written example. See [the quick test](QUICK-TEST.md).

Select a bed and read the status, pain score, milestones, and note. You can edit the made-up note.

To try Jev, expand **Jev connection & setup**, then press **Check server setup**. If your server has a key, leave the password field blank. Otherwise, get your own key from [TypeSafe](https://console.typesafe.ai) and enter it in the password field. Press **Ask Jev (uses your API)**. The app keeps a pasted key in this tab only; a reload clears it.

If you already exported `TYPESAFE_API_KEY`, the Docker command picks it up from that same terminal. See [key setup](ENVIRONMENT-SETUP.md). Jev still calls TypeSafe online, so its account and billing requirements apply.

Jev returns a progress category and a probability that the note affirms a current delay or blocker. An unclear note gets a suggestion to add more detail. A nurse still reviews that answer. The bed times are made-up examples, and a countdown reaching zero says **Confirm readiness**. It never frees a bed automatically. The demo clock starts October 1, 2026 at 10 a.m. New York time.

Press **Time room cleaning** to record start, finish, elapsed minutes and the local average. The timer saves room IDs and timestamps in this browser and survives a reload. Finishing still leaves staff release to confirm. The [research](docs/wiki/Cleaning-Research.md) separates cleaning time from total turnover.

## What I checked

The setup and software checks are recorded in [Verification](VERIFICATION.md). [The Jev evaluation](EVALUATION.md) includes the fictional notes, returned answers and original failures. These checks do not establish clinical accuracy.

To run the included checks after building:

```sh
docker compose -f container/compose.yaml run --rm bedboard npm test
```

I used [TypeSafe's API documentation](https://docs.typesafe.ai/api) and this [published Jev server example](https://github.com/davila7/jev-explained/blob/main/src/app/api/jev/route.ts) to check the connection pattern.

## Documentation

- [Quick test without a key](QUICK-TEST.md)
- [Actual Jev results](EVALUATION.md)
- [Change the beds, scenarios and model questions](CUSTOMIZE.md)
- [Demo security, HIPAA and future production work](DEMO-SECURITY.md)
- [Demo use and liability notice](DEMO-NOTICE.md)
- [Repeat the setup and understand what the checks prove](REPRODUCIBILITY.md)
- [Windows / Mac environment setup](ENVIRONMENT-SETUP.md)
- [Docker setup](container/README.md)

`docs/wiki/` has the research, 22 made-up patient histories, milestones, and the model comparison plan. `nurse-walkthrough.pdf` shows the nurse steps with screenshots and cursor markers. The narrated video is at the top of this page.

Every patient is made up. I chose a 1-5 pain scale for this example. This app saves only cleaning room IDs and timestamps in the browser. It does not save patient notes or decide when someone can leave hospital.

## Reuse and share

Use it, change it, and share your version. Keep the [MIT license](LICENSE) with the original code and docs. External research and dependencies keep their own terms; see [references](THIRD-PARTY.md).

## License

This project uses the [MIT license](LICENSE).
