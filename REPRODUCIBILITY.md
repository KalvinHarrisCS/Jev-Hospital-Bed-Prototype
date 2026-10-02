# Repeat the setup

I want someone else to be able to unzip this and run it. The ZIP includes the source, locked tools, Docker setup, tests, and instructions. It does not need my account or my computer's folder paths.

## What is fixed

- Core: `worker/index.js`, 100 lines; `worker/cleaning.js`, 40 lines in this release, with the fictional records included.
- Container base: official `node:22-bookworm-slim` pinned to the digest in `container/Dockerfile`.
- HTTPS trust: Debian CA certificates and OpenSSL versions are pinned in the Dockerfile. These provide the trusted system roots used by the Worker runtime.
- Wrangler: version `4.146.0`; its dependency versions and package integrity values are recorded in `package-lock.json`.
- Installation: `npm ci` reads that lockfile and fails rather than silently rewriting a mismatched dependency list.
- Container source: the explicit allowlist includes application/configuration, locked packages and checks; local secret files are excluded.
- Startup permissions: the container runs as the regular `node` user, which owns the app and can create Wrangler's cache.
- Launch: `docker compose -f container/compose.yaml up --build` builds and starts the whole app. No key is needed to browse it.

This fixes the intended runtime inputs for each supported platform. It does not promise a byte-identical Docker image or identical responses from an external model. The provider alias `jev-latest`, account access, billing and network availability can change independently of this project. Pin a provider-supported model version when comparing model behavior.

## Check a clean copy

Unzip into a new folder and follow the README commands. Do not copy `.env`, `.dev.vars`, `node_modules` or the author's local working directory. The test command needs no key and makes no TypeSafe requests.

| Check | What it demonstrates |
|---|---|
| `scripts/check-contract.mjs` | Request validation, same-origin enforcement, typed result handling and safe error responses, using a simulated provider. |
| `scripts/check-setup.mjs` | Boolean-only key presence, server-key precedence, blank-variable fallback and browser setup behavior, using fixtures. |
| `scripts/check-behavior.mjs` | Five checks for countdown safety, trusted patient context, complete probabilities, tab-key reuse, result labels and retry behavior. |
| Open the local page | The browser renders the board and form in your environment. |
| Optional `npm run check:https` inside a clean container | Startup has no permission errors; the Worker reaches TypeSafe over HTTPS and gets the expected rejection for an invalid test key. No real-key inference is attempted. |
| Analyze a fictional note with your own valid key | The external TypeSafe connection works for your account at that time. This is separate from the fixture tests. |

## Verify the downloaded ZIP

The accompanying `obgyn-submission.zip.sha256` records the ZIP's SHA-256. Compare it with:

Mac Terminal:

```sh
shasum -a 256 obgyn-submission.zip
```

Windows PowerShell:

```powershell
Get-FileHash .\obgyn-submission.zip -Algorithm SHA256
```

The checksum helps detect a changed or incomplete file when the expected checksum is obtained through a trusted route; it is not a publisher signature.

## Updating the tools intentionally

Choose a supported Wrangler version, change `devDependencies.wrangler`, run `npm install --package-lock-only`, and commit both package files. For a base-image update, choose a new official Node image digest. Update the pinned Debian CA/OpenSSL versions deliberately when needed; if an old pinned package becomes unavailable, the build fails rather than choosing a different version silently. Then rebuild, rerun the checks, verify HTTPS connectivity and document the new versions. Keep your API key in the runtime environment or per-tab password field.

References: [npm clean installation](https://docs.npmjs.com/cli/v11/commands/npm-ci/) and [Docker image references](https://docs.docker.com/reference/dockerfile/#from).
