# Local Clef setup

This `clef-local` branch runs fictional nurse-note checks through Clef Flash in Ollama. No API key is needed. The app keeps `/api/jev` as its browser route and uses Ollama's local `/v1/systemone` endpoint. It has no TypeSafe call or cloud fallback.

The first app build, package installation and model download need internet access. Once those are ready, note checks use the local model. This is a demo for fictional data; model answers never release a bed.

## Install the model

Install [Ollama](https://ollama.com/download) **0.35.1 or newer**, start it, and run:

```sh
ollama --version
ollama pull clef-flash:9b-q8_0
ollama list
```

The app defaults to `clef-flash:9b-q8_0`. It also accepts `clef:27b-q4_k_m`; download that model first and set `OLLAMA_MODEL` in Compose's environment or replace the native command's model argument below. The larger model needs more memory. Other model tags are rejected by this branch. System One needs compatible GGUF weights; ordinary chat models and MLX checkpoints do not work with this endpoint. See the [Ollama decision guide](https://docs.ollama.com/capabilities/decision) and [System One API reference](https://docs.ollama.com/api/systemone).

On Mac, run Ollama natively for Apple GPU access and keep the app in Docker. The [Ollama FAQ](https://docs.ollama.com/faq) explains GPU support, local binding and service configuration. Windows and Linux acceleration depend on your hardware and Ollama setup.

## Run with Docker

From the project root, with Docker Desktop and native Ollama running:

```sh
docker compose -f container/compose.yaml up --build
```

Open [localhost:8788](http://localhost:8788). Compose connects to Ollama at `http://host.docker.internal:11434`. The app port is bound to localhost. See [Docker setup](../../container/README.md) for optional ports and troubleshooting.

## Run without Docker

With Node.js **22 or newer** and Ollama running, open a terminal in the project root:

```sh
npm ci
npx wrangler dev --ip 127.0.0.1 --port 8788 --var 'OLLAMA_BASE_URL:http://127.0.0.1:11434' --var 'OLLAMA_MODEL:clef-flash:9b-q8_0'
```

Open [localhost:8788](http://localhost:8788). Press **Ctrl+C** to stop. If your Ollama service uses another local port, change `11434` in the command. These quoted `--var` arguments work in a Mac/Linux shell and PowerShell. Setting a process environment variable alone does not supply a Wrangler binding; use `--var` when overriding the native app settings.

The app accepts only a loopback address or `host.docker.internal` for `OLLAMA_BASE_URL`. Keep Ollama bound to a local address. The project config disables Wrangler usage metrics.

## Check a fictional note

1. Press **Try a nurse note** and choose a practice case.
2. Press **Show expected answer (no API)** to read the written sample. This does not run Clef.
3. Open **Local model setup** and press **Check server setup** to check the model settings. This does not contact Ollama.
4. Press **Check note (local Clef)** to run a real local request. Staff still review its progress label and delay score.

A saved model setting is not proof of connectivity or inference. A successful fictional-note response shows the request worked for that input; it does not establish clinical accuracy. A timer, score or progress label never changes the bed's confirmed status.

Clef Flash can mistake administrative updates or procedure facts for improving recovery, and instructions inside a note can affect its answer. Treat every answer as something to review. Ollama also calculates confidence differently from the original Jev service; do not reuse a Jev confidence threshold without evaluating it.

## Automated checks

```sh
npm test
npm run check:local
```

The app tests use simulated replies, and `check:local` runs against a mock local service. These checks need no model or API key and do not measure Clef inference. The existing dated tests, evaluation files and walkthrough describe the original cloud Jev demo.

## Model reference

Read the [Clef Flash model card](https://huggingface.co/Cloudflare/clef-flash) for model details and its license. The project's MIT license covers the app code.
