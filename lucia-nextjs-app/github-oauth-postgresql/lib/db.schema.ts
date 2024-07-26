import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const userTable = pgTable("user", {
	id: text("id").primaryKey(),
	githubId: text("github_id").notNull(),
	username: text("username").notNull()
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});
export const tokenTable = pgTable('token', {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
    encryptedAccessToken: text('encrypted_access_token').notNull()
});
