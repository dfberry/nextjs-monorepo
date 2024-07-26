import { defineConfig } from "drizzle-kit"
import type { Config } from 'drizzle-kit'

export default defineConfig({
  schema: "./lib/db.schema.ts",
  out: './migrations',
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
}) satisfies Config
