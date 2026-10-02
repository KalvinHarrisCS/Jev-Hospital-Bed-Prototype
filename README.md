# Jev Hospital Bed Prototype

[![Tests](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/actions/workflows/tests.yml/badge.svg)](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/actions/workflows/tests.yml)

Watch the nurse walkthrough:

https://github.com/user-attachments/assets/402d6303-6abf-45cc-8257-ddf5911f9732

I put this together to explore a basic hospital question: which bed is available, and when might the next one be ready?

I kept it small: 20 made-up beds, nurse notes, status codes, time estimates and room cleaning timers. This is a gift to anyone who wants to run it, change it or learn from it.

**Demo only. Not for production or real patient information.** This project has not been assessed for HIPAA compliance or clinical use.

[Download the ZIP](https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype/releases/download/v1.0.0/jev-hospital-bed-prototype.zip) · [Documentation](docs/README.md) · [Screenshot guide](docs/walkthrough/nurse-walkthrough.pdf)

## Run the demo

With Git installed and Docker Desktop running:

```sh
git clone https://github.com/KalvinHarrisCS/Jev-Hospital-Bed-Prototype.git
cd Jev-Hospital-Bed-Prototype
docker compose -f container/compose.yaml up --build
```

Open [localhost:8787](http://localhost:8787). Leave the terminal open; press **Ctrl+C** to stop.

If you download the ZIP, extract it and run the Docker command from the folder containing this README. [Docker setup](container/README.md) covers Windows, Mac and troubleshooting.

## Try it

Press **Try a nurse note**, choose a practice case and press **Show expected answer (no API)**. That works without a key.

Live Jev checks use your own TypeSafe key. Follow [key setup](docs/guides/ENVIRONMENT-SETUP.md), then press **Ask Jev (uses your API)**. Staff still review the answer and confirm bed readiness. A countdown never frees a bed automatically.

## Read more

| What you need | Where to go |
| --- | --- |
| Use the form and cleaning timer | [User guide](docs/guides/USER-GUIDE.md) |
| Test it quickly | [Quick test](docs/guides/QUICK-TEST.md) |
| Change the beds and model questions | [Customization](docs/guides/CUSTOMIZE.md) |
| Security, HIPAA and future hospital use | [Security notes](docs/security/DEMO-SECURITY.md) |
| Test changes before merging | [Automated tests](docs/testing/TESTS.md) |
| Try public stay data without an API key | [Data pipeline and saved example](pipeline/README.md) |
| Results and what was checked | [Verification](docs/testing/VERIFICATION.md) · [Jev evaluation](docs/testing/EVALUATION.md) |
| Patient examples and research | [Project wiki](docs/wiki/Home.md) |

## Use and share

Use it, change it and share your version. Keep the [MIT license](LICENSE) with the original work. **Provided as is, without warranties.** Read the [demo use and liability notice](docs/security/DEMO-NOTICE.md) and [third-party references](docs/research/THIRD-PARTY.md).
