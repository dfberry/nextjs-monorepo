# Secrets

## Versions of .env

* Next.js looks for .env.local by default
* Prisma looks for .env by default

Use [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) as a dependency tool to augment the prisma scripts to look in the .env.local file. 

```
"db:sync": "dotenv -e .env.local -- npx prisma db push --force-reset",
"db:client:generate": "dotenv -e .env.local -- npx prisma generate",
```