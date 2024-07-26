import { defineConfig, Config } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
})
