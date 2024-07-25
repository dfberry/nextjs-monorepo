import { github, lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";

import { DatabaseUser, insertToken, updateToken } from "@/lib/db";
import EncryptionService from "@/lib/encrypt";


export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies().get("github_oauth_state")?.value ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const encryptor = new EncryptionService();
		const tokens = await github.validateAuthorizationCode(code);
		console.log("tokens", tokens);

		const encryptedAccessToken = encryptor.encrypt(tokens.accessToken);
		console.log("encryptedAccessToken", encryptedAccessToken);

		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const githubUser: GitHubUser = await githubUserResponse.json();
		const existingUser = db.prepare("SELECT * FROM user WHERE github_id = ?").get(githubUser.id) as
			| DatabaseUser
			| undefined;

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

			// Update user's access token	
			updateToken(existingUser.id, encryptedAccessToken);

			return new Response(null, {
				status: 302,
				headers: {
					Location: "/profile"
				}
			});
		}

		const userId = generateId(15);
		db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
			userId,
			githubUser.id,
			githubUser.login
		);
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		insertToken(userId, encryptedAccessToken);

		// Set user's access token
		// await db.prepare("INSERT INTO tokens ( id, user_id, encrypted_access_token) VALUES () SET access_token = ? WHERE user_id = ?").run(
		// 	generateId(15),
		// 	userId,
		// 	encryptedAccessToken);

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

interface GitHubUser {
	id: string;
	login: string;
}
