# How I connected Jev

The browser sends the selected bed and note to this app's server. The server adds the bed's recorded procedure, pain score, and milestones, then calls TypeSafe:

`Browser -> POST /api/jev -> TypeSafe /v1/systemone -> checked answer -> page`

The browser cannot choose another provider URL, model, or set of questions. The request uses `jev-latest`; the answer shows the model TypeSafe actually returned.

## The two questions

| Question | Type | Answer |
|---|---|---|
| What progress does the note explicitly describe? | Choice | `improving`, `needs_review`, or `unclear`, with probabilities and confidence |
| Does it affirm a current delay, blocker, or pending assessment? | Noul | A probability from 0 to 1 |

I kept the questions narrow. The answer helps someone review the note. It does not decide discharge, predict the departure time, or free a bed.

The server checks the chosen category, every requested option probability, confidence, delay probability, and model name. An incomplete or invalid answer gets an error instead of appearing as a successful result.

## Set up your key

1. Get your own key from [TypeSafe](https://console.typesafe.ai).
2. Start the app and open **Jev connection & setup**, then press **Check server setup**.
3. If a server key is configured, leave the password field blank. Otherwise, paste your key there for this tab.
4. Select a bed, write a made-up note, and press **Ask Jev (uses your API)**.

A pasted key stays in tab memory and clears on reload. The app does not put it in browser storage or the source. An exported key must be passed to the server that is running this page. See [key setup](Environment-Setup.md).

## Examples I checked

- [TypeSafe quick start](https://docs.typesafe.ai/introduction/quickstart)
- [Official API request and response formats](https://docs.typesafe.ai/api)
- [Published Jev server example](https://github.com/davila7/jev-explained/blob/main/src/app/api/jev/route.ts)
- [Official JavaScript SDK](https://github.com/typesafe-ai/typesafe-sdk-js)

I used the documented HTTP API directly to keep the app small. These examples show the connection pattern; they do not prove a hospital forecasting model works.

## What passed

The fixture tests checked the request, authentication header, recorded context, response fields, and error handling. A test with an intentionally invalid key reached TypeSafe over HTTPS and got the expected rejection. Real-key checks now passed. Missing note detail maps to `unclear`, which prompts the writer for clearer observations. Clinical accuracy is unverified; see [the recorded checks](Evaluation-Results.md). See [what was tested](Verification.md).
