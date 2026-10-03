# Docker setup

I put the whole app in a container so you can run the same project without installing Node.js yourself. Jev still uses TypeSafe online. Docker does not include Jev's model or an API key.

The core stays in `worker/index.js`; its room-cleaning timer is `worker/cleaning.js`. Docker files stay here in `container/`.

## Build and run

Start Docker Desktop. Open a terminal in the **project root**, where the main README is, and run:

```sh
docker compose -f container/compose.yaml up --build
```

Open [localhost:8787](http://localhost:8787). Leave the terminal open. Press **Ctrl+C** to stop. Run that same command again to come back or rebuild after changing the source.

No key is needed to browse the board. To try Jev, enter your key in the app's password field, or use the environment setup below. I made the password field the easiest way to get started.

To remove the stopped Compose container, run `docker compose -f container/compose.yaml down`. The app saves no patient records.

## Run the checks

Run the checks against the current source:

```sh
docker compose -f container/compose.yaml run --rm --build bedboard npm test
```

These checks use made-up data and make no TypeSafe calls. The base image and dependency versions are fixed in the supplied files. See [repeat the setup](../docs/guides/REPRODUCIBILITY.md).

The `--build` flag refreshes the image before the checks run.

To check Docker's build exclusions, run `npm run check:docker-context` from a Git checkout with Node.js and Docker available. It checks the actual copied files using synthetic environment files, dependency folders and generated collection output. It never reads ignored local secret files or collection output and removes its temporary files, image and stopped container.

For an optional network check, run `docker compose -f container/compose.yaml run --rm --build bedboard npm run check:https`. It contacts TypeSafe with an intentionally invalid test key and expects an authentication rejection. It checks HTTPS and startup permission errors. A result with your real key is still a separate check.

To change beds or questions, follow [make it your own](../docs/guides/CUSTOMIZE.md), then run the launch command again. The image keeps the source copied during the build. The MIT license is included in the image.

## Supply the key when running

If you want a server key, set it in the **same terminal** before the launch command. These prompts keep the key out of the command you type:

Mac Terminal (zsh):

```zsh
read -rs 'TYPESAFE_API_KEY?TypeSafe API key: '
export TYPESAFE_API_KEY
```

Windows PowerShell 7.1 or newer:

```powershell
$env:TYPESAFE_API_KEY = Read-Host 'TypeSafe API key' -MaskInput
```

Compose forwards `TYPESAFE_API_KEY` from that terminal. If it is missing, the app still starts and you can use the password field. The build excludes secret files and Git history. Docker administrators can inspect container environment variables, so use an approved machine. See [key setup](../docs/guides/ENVIRONMENT-SETUP.md) if your key has another variable name.

Press **Check server setup** in the app. It reports presence only, never the key value. A valid key and TypeSafe billing are checked by a successful Ask Jev request, which sends the fictional note to TypeSafe. The host port is bound to localhost.

An export applies to that terminal and the processes it starts. If you add a key while the app is running, press Ctrl+C and run the launch command again in that terminal. Press **Check server setup** after it starts.

## If it does not start

- **Docker is unavailable:** open Docker Desktop and wait for its engine to be ready. On Windows, use Linux containers.
- **Port 8787 is already in use:** stop the other app using it. For an older manually started bedboard, run `docker stop obgyn-bedboard`, then run the Compose command.
- **Different port:** set `BEDBOARD_PORT=8788` in your terminal's environment, then start Compose and open `localhost:8788`.
- **Permission denied for `/app/node_modules/.mf`:** rebuild with the current Dockerfile. It now gives the app user ownership of its packages and cache folder. I added a regression check for this exact issue.

## Company computers

Use this where your company allows Docker and access to TypeSafe. Docker itself must already be installed or approved by IT. This is a local demo running Wrangler's development server.

## Verification

I checked the page, key-presence response, and startup as a regular app user. The permission check fails against the old image and passes against the corrected one. Docker builds and HTTPS checks passed on Linux ARM64 and on Linux AMD64 emulated on this Mac. See [what was tested](../docs/testing/VERIFICATION.md) for the full record. Real-key fictional-note checks passed; [their results](../docs/testing/EVALUATION.md) are included. Clinical accuracy and a physical Windows run are still unverified.

## References

- [Docker runtime environment variables](https://docs.docker.com/reference/cli/docker/container/run/#env)
- [Dockerfile-specific build exclusions](https://docs.docker.com/build/building/context/#dockerignore-files)
- [Official Node.js image](https://hub.docker.com/_/node/)
- [Wrangler local server options](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
