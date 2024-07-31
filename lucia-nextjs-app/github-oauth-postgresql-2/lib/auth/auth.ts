import { Lucia, TimeSpan } from "lucia";
import { adapter, db, userTable } from "../db/db";
import { cookies } from "next/headers";
import { GitHub } from "arctic";
import { cache } from "react";
import { getDbUserByGithubId, insertDbToken, insertDbUser } from "@/lib/db/db";
import {generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import type { Session, User } from "lucia";
import type { DatabaseUser } from "../db/db";

export { db, userTable };

export interface SessionResult {
    user: User | null;
    session: Session | null;
}

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(1, "w"), // 1 week
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
export class SessionService {
    static async validateRequest(): Promise<SessionResult> {
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
	static getStoredState(cookieName: string): string | null {
        return cookies().get(cookieName)?.value ?? null;
    }

    static setStoredState(cookieName: string,state: string): void {
        cookies().set("github_oauth_state", cookieName);
    }

	static async createAndStoreSession(userId: string): Promise<void> {
		// delete user's existing sessions in db
		await lucia.invalidateUserSessions(userId);

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
}
export const validateRequest = cache(SessionService.validateRequest);

export async function githubAuthenticationCallback(request: Request): Promise<Response> {

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    
    //const storedState = cookies().get("github_oauth_state")?.value ?? null;
	const storedState = SessionService.getStoredState("github_oauth_state");

    console.log(`code: ${code}`);
    console.log(`state: ${state}`);
    console.log(`storedState: ${storedState}`);


    if (!code || !state || !storedState || state !== storedState) {
        console.log(`returning 400`);
        return new Response(null, { status: 400 });
    }

    try {
		const tokens = await github.validateAuthorizationCode(code);
		console.log("tokens", tokens);
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const githubUser= await githubUserResponse.json();
        const existingDbUser = await getDbUserByGithubId(githubUser.id);

		if (existingDbUser?.githubId) {

            console.log(`existingDbUser: ${JSON.stringify(existingDbUser)}`);
            await insertDbToken(existingDbUser.id, tokens.accessToken);
			await SessionService.createAndStoreSession(existingDbUser.id);

			return new Response(null, {
				status: 302,
				headers: {
					Location: "/profile"
				}
			});
		}

		const userId = generateId(15);

        const narrowedGithubUser = {
            login: githubUser.login,
            id: githubUser.id
        };

        await insertDbUser(userId, narrowedGithubUser);
        await insertDbToken(userId, tokens.accessToken);
		await SessionService.createAndStoreSession(userId);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/profile"
			}
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}



}

export const github = new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!);
