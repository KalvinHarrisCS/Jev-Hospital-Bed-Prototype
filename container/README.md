# Docker setup for Local Clef

Docker runs the bedboard app. Install and run Ollama on the host computer separately; the image does not include the model. On Mac, native Ollama can use the Apple GPU. Docker Desktop on Mac does not provide GPU passthrough for Ollama. See the [Ollama FAQ](https://docs.ollama.com/faq).

## Build and run

Start Ollama **0.35.1 or newer** and download the model:

```sh
ollama pull clef-flash:9b-q8_0
```

Start Docker Desktop. Open a terminal in the **project root**, where the main README is, and run:

```sh
docker compose -f container/compose.yaml up --build
```

Open [localhost:8788](http://localhost:8788). Leave the terminal open. Press **Ctrl+C** to stop. Run the same command again to rebuild after changing the source.

Compose uses project `jev-clef-local`, image `jev-bedboard:clef-local`, and a localhost-only app port. It connects to native Ollama at `http://host.docker.internal:11434`. No API key is needed. The first download and build need internet access.

Open **Local model setup** and press **Check server setup** to check the app's settings, then **Check note (local Clef)** with a fictional note to test a real request. Settings being present do not prove inference works. [Local Clef setup](../docs/guides/LOCAL-CLEF.md) explains the model request and how to run the app without Docker.

## Optional settings

To change the app port, set `BEDBOARD_PORT` before starting Compose. If your local Ollama service uses a different port, change the port in `OLLAMA_BASE_URL` too.

Mac Terminal or Linux shell:

```sh
export BEDBOARD_PORT=8789
export OLLAMA_BASE_URL='http://host.docker.internal:11434'
docker compose -f container/compose.yaml up --build
```

Windows PowerShell:

```powershell
$env:BEDBOARD_PORT = '8789'
$env:OLLAMA_BASE_URL = 'http://host.docker.internal:11434'
docker compose -f container/compose.yaml up --build
```

Open `http://localhost:8789` for these examples. Changes apply to processes started in that terminal; restart Compose after changing a setting. The app accepts loopback addresses and `host.docker.internal` only. Keep Ollama bound to a local address.

## Run the checks

```sh
docker compose -f container/compose.yaml run --rm --build bedboard npm test
docker compose -f container/compose.yaml run --rm --build bedboard npm run check:local
```

These checks use fictional data and simulated replies. The local runtime check uses a mock service and does not run Clef. A successful real model response is a separate check, and it does not establish clinical accuracy.

With Node.js and Docker available, `npm run check:docker-context` checks the files copied into the image using synthetic fixtures. It excludes secret files, Git history and generated collection output. The copyright and permissions notice is included in the image.

## If it does not start

- **Docker is unavailable:** start Docker Desktop and wait for its engine to be ready. On Windows, use Linux containers.
- **Port 8788 is in use:** choose another `BEDBOARD_PORT` using the examples above.
- **Ollama cannot be reached:** make sure the native app is running and the configured port is correct. `127.0.0.1` inside the app container points to that container; use `host.docker.internal` for the host service on Docker Desktop.
- **Model missing:** run `ollama list` and confirm `clef-flash:9b-q8_0` was downloaded to the Ollama service the app uses.
- **System One endpoint missing:** check `ollama --version`; Clef needs 0.35.1 or newer.

Linux host networking and GPU access need their own Ollama and Docker setup. This Compose file does not supply a GPU runtime or guarantee host access on every Linux installation. Use [the native app setup](../docs/guides/LOCAL-CLEF.md#run-without-docker) if the host connection is unavailable.

This is a local demo using Wrangler's development server. Use a computer where Docker and Ollama are allowed. The [dated verification record](../docs/testing/VERIFICATION.md) describes the original cloud Jev demo; it does not verify this Local Clef setup.
