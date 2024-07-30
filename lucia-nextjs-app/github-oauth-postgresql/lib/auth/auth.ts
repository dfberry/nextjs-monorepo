import { Lucia } from "lucia";
import { adapter, db, userTable } from "../db/db";
import { cookies } from "next/headers";
import { GitHub } from "arctic";
import { cache } from "react";
import SessionManager from './session'; // Adjust the import path as necessary

import type { Session, User } from "lucia";
import type { DatabaseUser } from "../db/db";

export { db, userTable };

export interface SessionResult {
    user: User | null;
    session: Session | null;
}

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		console.log("Auth attributes", attributes);
		return {
			githubId: attributes.githubId,
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
    async (): Promise<SessionResult> => {

		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null
			};
		}

        const result = await lucia.validateSession(sessionId);
		console.log("Auth result", result);
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result.session && result.session.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				console.log("sessionCookie", sessionCookie);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				console.log("sessionCookie", sessionCookie);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch {}
		return result;
    }
);

export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);
