import { cookies } from "next/headers";
import { github, lucia } from "@/lib/auth/auth";
import { getDbUserByGithubId, insertDbToken, insertDbUser } from "@/lib/db/db";
import { DatabaseUser, generateId } from "lucia";
//import GitHubAuthHandler from "@/lib/auth/github-auth-handler";
import { OAuth2RequestError } from "arctic";

interface GitHubUser {
	id: string;
	login: string;
}

export async function GET(request: Request): Promise<Response> {

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    
    const storedState = cookies().get("github_oauth_state")?.value ?? null;

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
		const githubUser: GitHubUser= await githubUserResponse.json();
        const existingDbUser = await getDbUserByGithubId(githubUser.id);

		if (existingDbUser?.githubId) {

            console.log(`existingDbUser: ${JSON.stringify(existingDbUser)}`);
            await insertDbToken(existingDbUser.id, tokens.accessToken);
			const session = await lucia.createSession(existingDbUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
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
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
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

