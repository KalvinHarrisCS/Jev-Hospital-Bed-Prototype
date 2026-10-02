# Dependencies and references

The project's MIT license covers its original application, fictional fixtures and original documentation. It does not change the terms of linked publications, external services or dependencies. The package lock lists the runtime tooling and its dependencies.

- Node.js container: [official image](https://hub.docker.com/_/node/); [Node.js license](https://github.com/nodejs/node/blob/main/LICENSE).
- Wrangler and workerd: [Cloudflare Workers SDK](https://github.com/cloudflare/workers-sdk) and [workerd](https://github.com/cloudflare/workerd), under their published licenses. Dependency license notices remain in installed packages.
- TypeSafe/Jev: [official API documentation](https://docs.typesafe.ai/api). Inference uses a separate account, key and provider terms; no model weights are distributed in this project.
- Architectural example: [davila7/jev-explained server route](https://github.com/davila7/jev-explained/blob/main/src/app/api/jev/route.ts). The application's implementation is original; this is a reference for the server-proxy pattern.
- Public SPARCS aggregates: New York State Department of Health, [2023 release](https://health.data.ny.gov/d/46xm-urtu) and [2024 release](https://health.data.ny.gov/d/sf4k-39ay), under [Open NY terms](https://data.ny.gov/download/77gx-ii52/application/pdf). Reviewed October 2, 2026. [The saved example](../../pipeline/examples/public-2023-2024/README.md) includes attribution, query provenance and source-document hashes. External source data is outside the project's MIT grant; no State endorsement is implied.
- Medical reference links are preserved in `docs/wiki/Research-and-References.md` and `docs/research/fictional-patient-histories.md`. They support the labeled research summaries; the invented histories do not establish clinical performance.
