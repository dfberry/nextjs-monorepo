# GitHub OAuth example in Next.js App router

Uses SQLite (`main.db`) database.

```
pnpm i
pnpm dev
```

## Setup

Create a GitHub OAuth app with the callback set to `http://localhost:3000/login/github/callback` and create an `.env` file.

```bash
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

## Polyfill

If you're using Node 16 or 18, uncomment the code in `lib/auth.ts`. This is not required in Node 20, Bun, and Cloudflare Workers.

```ts
// import { webcrypto } from "crypto";
// globalThis.crypto = webcrypto as Crypto;
```

https://whateverittech.medium.com/authenticate-next-14-app-router-with-lucia-auth-92816b1831ff

## Restart with clean db and cookie

* Delete cookie
* Delete `source-board` db in pgAdmin
* Create `source-board` db in pgAdmin
* run `npm run db:generate`
* run `npm run db:push`
* run `npm run dev`