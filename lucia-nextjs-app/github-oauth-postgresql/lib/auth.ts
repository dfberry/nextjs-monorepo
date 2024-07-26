import { Lucia } from "lucia";
import { adapter, db, userTable } from "./db";
import { cookies } from "next/headers";
import { GitHub } from "arctic";
import { cache } from "react";

import type { Session, User } from "lucia";
import type { DatabaseUser } from "./db";

export { db, userTable };

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		console.log("Auth attributes", attributes);
		return {
			githubId: attributes.github_id,
			username: attributes.username,
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}

export const validateRequest = cache(
	async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {

		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {

			console.log("No session id");

			return {
				user: null,
				session: null
			};
		}

		const result = await lucia.validateSession(sessionId);
		console.log("Auth result", result);
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result && result.session && result.session.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				console.log("sessionCookie", sessionCookie);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				console.log("sessionCookie", sessionCookie);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch { }
		return result;
	}
);

export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);
