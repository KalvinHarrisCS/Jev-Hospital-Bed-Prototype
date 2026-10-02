# Key setup

I kept the variable name the same on Windows and Mac: `TYPESAFE_API_KEY`.

The **Check server setup** button reports whether that variable is present on the server running this page. It never returns the value. **Configured** does not mean the key is valid or billing is ready; a successful Jev call verifies those separately.

## Easiest way

Start the app with `docker compose -f container/compose.yaml up --build` and enter your key in its password field. You can browse the board without one. A pasted key is kept in that tab only; reloading clears it.

## Use an environment variable with Docker

From the project root, use the block for your computer. Compose passes the variable to the app. Open **Jev connection & setup**, then press **Check server setup** and leave the password field blank when the server is configured.

Mac Terminal (zsh):

```zsh
read -rs 'TYPESAFE_API_KEY?TypeSafe API key: '
export TYPESAFE_API_KEY
docker compose -f container/compose.yaml up --build
```

Windows PowerShell 7.1 or newer:

```powershell
$env:TYPESAFE_API_KEY = Read-Host 'TypeSafe API key' -MaskInput
docker compose -f container/compose.yaml up --build
```

## Run locally on Mac

From the downloaded project folder, use Terminal with zsh. These commands ask for the key without putting its value into the command itself:

```zsh
npm ci
read -rs 'TYPESAFE_API_KEY?TypeSafe API key: '
export TYPESAFE_API_KEY
npm run dev
```

Open the local URL printed by Wrangler, then open **Jev connection & setup**, then press **Check server setup**. The variable is scoped to this terminal session and its child processes. Stop the server and run `unset TYPESAFE_API_KEY` to clear it.

## Run locally on Windows

From the downloaded project folder, use PowerShell 7.1 or newer:

```powershell
npm ci
$env:TYPESAFE_API_KEY = Read-Host 'TypeSafe API key' -MaskInput
npm run dev
```

Open the local URL printed by Wrangler. Stop the server and run `Remove-Item Env:TYPESAFE_API_KEY` to clear the variable from the session.

## Point at an existing variable

If your key already lives in `MY_JEV_KEY`, map it to the standard name before starting the local server:

| Platform | Command |
|---|---|
| Mac zsh | `export TYPESAFE_API_KEY="$MY_JEV_KEY"` |
| Windows PowerShell | `$env:TYPESAFE_API_KEY = $env:MY_JEV_KEY` |

Replace `MY_JEV_KEY` with your existing variable's name. The webpage does not accept arbitrary names or read unrelated server variables.

## Local files and requirements

The supplied `wrangler.jsonc` declares the required secret name, so Wrangler can load it from the launching process. Node.js 22 or newer and npm are required for this local setup. The optional [container](Container-Setup.md) supplies its own Node.js runtime. You can alternatively put `TYPESAFE_API_KEY="your-key"` in an ignored `.dev.vars` file in the project folder. Do not include `.dev.vars` or `.env` files in Git or submission archives. They are excluded by the supplied `.gitignore`.

The core source is `worker/index.js` (100 lines), with `worker/cleaning.js` (40 lines) for timing; local configuration, dependency lockfiles and checks are separate tooling. `npm ci` installs the locked runtime versions. Run `npm test` before trying a live request.

## Evidence and references

The local Worker started successfully on Mac with a fake process-environment key; `/api/config` returned only `{"configured":true}`. Contract tests checked server-key precedence, blank-variable fallback and the browser's missing/configured/error paths. Windows commands are documentation-based, not physically tested on Windows. No live Jev request was made for this check.

- [Cloudflare local secret loading](https://developers.cloudflare.com/workers/local-development/environment-variables/)
- [Cloudflare required secret configuration](https://developers.cloudflare.com/workers/wrangler/configuration/#secrets)
- [PowerShell environment variables](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)
- [PowerShell masked input](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/read-host)
- [Mac environment variables](https://support.apple.com/guide/terminal/use-environment-variables-apd382cc5fa-4f58-4449-b20a-41c53c006f8f/mac)
- [zsh read command](https://zsh.sourceforge.io/Doc/Release/Shell-Builtin-Commands.html)

## When an exported key does not appear

`export TYPESAFE_API_KEY myvalue` does not assign `myvalue` to the variable. Use the private zsh prompt above, then export the populated variable. Do not print its value to diagnose setup.

An export applies only to that terminal and processes it starts. If the app is already running, press Ctrl+C, then run the Compose launch command again from the same terminal. Open **Jev connection & setup**, then press **Check server setup** on the local page.

The container includes the system certificates needed for HTTPS. The optional `docker compose -f container/compose.yaml run --rm bedboard npm run check:https` checks connectivity using an invalid test key and catches startup permission errors. It does not attempt a request with your real key.
