FROM node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates=20250419~deb12u1 openssl=3.0.22-1~deb12u1 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --chown=node:node package.json package-lock.json LICENSE ./
RUN npm ci --include=dev --no-audit --no-fund && chown -R node:node /app
COPY --chown=node:node worker ./worker
COPY --chown=node:node wrangler.jsonc ./
COPY --chown=node:node scripts/check-contract.mjs scripts/check-setup.mjs scripts/check-behavior.mjs scripts/check-cleaning.mjs scripts/check-https.mjs ./scripts/
USER node
EXPOSE 8787
CMD ["./node_modules/.bin/wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
