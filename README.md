# Jev Hospital Bed Prototype — Local Clef

This demo is a gift for learning and review, created by [Kalvin Harris](https://github.com/KalvinHarrisCS).

This demo checks fictional nurse notes with Cloudflare's Clef Flash running in Ollama on your computer. The original TypeSafe-backed Jev demo is preserved in the earlier releases and dated records below.

I kept the demo small: 20 made-up beds, nurse notes, status codes, time estimates and room cleaning timers. Staff review model answers and confirm bed readiness. A countdown or model answer never frees a bed automatically.

**Demo only. Not for production or real patient information.** This project has not been assessed for HIPAA compliance or clinical use.

## Run the local demo

Install and start [Ollama](https://ollama.com/download) **0.35.1 or newer**, then download the model:

```sh
ollama pull clef-flash:9b-q8_0
```

With Docker Desktop running, clone the project and open its folder:

```sh
git clone https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype.git
cd Jev-Hospital-Bed-Prototype
docker compose -f container/compose.yaml up --build
```

Open [localhost:8788](http://localhost:8788). Leave the terminal open; press **Ctrl+C** to stop.

On Mac, run Ollama natively to use the Apple GPU. Docker runs the bedboard app. The first model download and app build need internet access. Note checks use the local model without an API key or cloud fallback.

[Local Clef setup](docs/guides/LOCAL-CLEF.md) covers running without Docker and model settings. [Docker setup](container/README.md) covers ports and troubleshooting.

## Try it

Press **Try a nurse note**, choose a practice case and press **Show expected answer (no API)** to read its written sample answer. That does not run a model.

Open **Local model setup** and press **Check server setup** to check the model settings. Settings being present do not prove that Ollama is running or that inference works. Press **Check note (local Clef)** to send a fictional note to the local model.

## How it works

The browser sends the note to `/api/jev`. The server calls Ollama's local `/v1/systemone` endpoint and checks the answer's structure and numeric ranges. Clef returns a progress label (`improving`, `needs_review` or `unclear`) and a score for an unresolved delay. This never changes a bed's actual status.

| Code | What it does |
| --- | --- |
| [worker/index.js](worker/index.js) | Bed examples, page and local model routes |
| [worker/cleaning.js](worker/cleaning.js) | Room cleaning timer and saved local records |
| [scripts](scripts) | Automated app checks |
| [readiness](readiness/README.md) | Separate fictional timing examples; estimates stay pending staff release |
| [pipeline](pipeline/README.md) | Optional public stay-data collector and summaries; the board does not use them yet |

## Check a change

With Node.js 22 or newer installed, run from the project root:

```sh
npm ci
npm test
npm run check:local
```

These checks use fictional data and simulated model replies. `check:local` checks the local app runtime against a mock service; it does not prove Clef inference or clinical accuracy. A real model check is separate.

## Original Jev demo and records

The existing video, screenshots, release ZIP and dated evaluation records describe the original TypeSafe-backed Jev demo. They are not a Local Clef walkthrough or Local Clef test results.

https://github.com/user-attachments/assets/60c21a36-537c-4a62-b571-9450f3d46f6c

[Original v1.1.1 ZIP](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.1/jev-hospital-bed-prototype.zip) · [Original walkthrough video](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.1.1/jev-project-walkthrough.mp4) · [Original chapters and transcript](docs/walkthrough/nurse-walkthrough-script.md) · [Original screenshot guide](docs/walkthrough/nurse-walkthrough.pdf)

## Read more

- [Documentation index](docs/README.md)
- [Local Clef setup](docs/guides/LOCAL-CLEF.md)
- [Security notes](docs/security/DEMO-SECURITY.md)
- [Data pipeline and saved example](pipeline/README.md)
- [Historical Jev verification](docs/testing/VERIFICATION.md) and [evaluation](docs/testing/EVALUATION.md)

## Credit and contact

Copyright (c) 2026 Kalvin Harris. All rights reserved. This version is not offered under an open-source license; see the [copyright and permissions notice](LICENSE). Contact Kalvin for permission to reuse or redistribute the original project.

**Want this app retargeted for your use case? Get in touch with [Kalvin Harris](https://github.com/KalvinHarrisCS).**

**Provided as is, without warranties.** Read the [demo use and liability notice](docs/security/DEMO-NOTICE.md) and [third-party references](docs/research/THIRD-PARTY.md). The model has its own terms in the [Clef Flash model card](https://huggingface.co/Cloudflare/clef-flash). Earlier releases retain the permissions under which they were published.
