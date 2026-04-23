# SIG Social Preview

Standalone Next.js app for creating shareable social post approval previews.

## Local dev

```bash
npm install
npm run dev
```

Runs at `http://localhost:3000`.

## Env vars

See `.env.example`. Copy to `.env.local` and fill in:

- `SMARTSHEET_API_TOKEN` — server-side only. Required for Smartsheet integration.
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Vercel KV credentials. Optional.
  Without them, the app stores previews in `.data/previews.json` locally.

## Smartsheet sheets

All read-only. This app never writes to Smartsheet.

| Purpose | Sheet ID |
| --- | --- |
| Marketing Social & Paid Calendar | `6962924103880580` |
| 2026 Organic Social Calendar | `5981019476807556` |
| 2026 Paid Social Execution Sheet | `2380929671581572` |

## Deploy

Push to Vercel. Set the env vars in the project settings. Provision Vercel KV
from the Storage tab and link it to the project — it auto-populates
`KV_REST_API_URL` and `KV_REST_API_TOKEN`.
