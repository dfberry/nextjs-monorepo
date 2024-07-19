# Secrets

## Versions of .env

* Next.js looks for .env.local by default
* Prisma looks for .env by default

Use [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) as a dependency tool to augment the prisma scripts to look in the .env.local file. 

```
"db:sync": "dotenv -e .env.local -- npx prisma db push --force-reset",
"db:client:generate": "dotenv -e .env.local -- npx prisma generate",
```

## Database secrets

* This is based on an encryption investigation - encryption on this subdir is currently not used

Use [prisma-field-encryption](https://www.npmjs.com/package/prisma-field-encryption) to encrypt secrets in Prisma. Edit prisma schema to annotate fields for encyrptio with `/// @encrypted` syntax:

```
 
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? /// @encrypted
  access_token      String? /// @encrypted
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
 
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 
  @@id([provider, providerAccountId])
}
```

Encryption adds quite a bit of overhead, so you'll need to raise your database field maximum lengths (usually declared with @db.VarChar(someNumber) or similar).

For the same reason, [indexes should not be placed on encrypted fields](https://www.npmjs.com/package/prisma-field-encryption#filtering-using-where) because the encryption is not deterministic: encrypting the same input multiple times will yield different outputs. To circumvent this issue, the extension provides support for a separate field containing a hash of the clear-text input, which is stable and can be used for exact matching (partial matching like startsWith, contains is not possible).